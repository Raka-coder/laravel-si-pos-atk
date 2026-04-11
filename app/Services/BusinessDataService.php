<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;

class BusinessDataService
{
    public function getTodaySales(): array
    {
        $today = Carbon::today();

        $transactions = Transaction::whereDate('transaction_date', $today)
            ->where('payment_status', 'paid')
            ->get();

        $totalSales = $transactions->count();
        $totalRevenue = $transactions->sum('total_price');
        $totalItems = TransactionItem::whereHas('transaction', function ($query) use ($today) {
            $query->whereDate('transaction_date', $today)
                ->where('payment_status', 'paid');
        })->sum('quantity');

        return [
            'transactions' => $totalSales,
            'revenue' => (int) $totalRevenue,
            'items_sold' => $totalItems,
            'date' => $today->format('d F Y'),
        ];
    }

    public function getTopProducts(int $limit = 5): array
    {
        $startDate = Carbon::now()->startOfWeek();
        $endDate = Carbon::now()->endOfWeek();

        $topProducts = TransactionItem::select('product_id', 'product_name')
            ->selectRaw('SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
            ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('transaction_date', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get();

        return $topProducts->map(function ($item, $index) {
            return [
                'rank' => $index + 1,
                'product_name' => $item->product_name,
                'quantity_sold' => (int) $item->total_qty,
                'revenue' => (int) $item->total_revenue,
            ];
        })->toArray();
    }

    public function getLowStockProducts(): array
    {
        $lowStock = Product::where('is_active', true)
            ->whereRaw('stock <= min_stock')
            ->with(['category', 'unit'])
            ->orderBy('stock')
            ->get();

        return $lowStock->map(function ($product) {
            return [
                'product_name' => $product->name,
                'current_stock' => $product->stock,
                'min_stock' => $product->min_stock,
                'category' => $product->category?->name ?? 'Tidak ada',
                'unit' => $product->unit?->short_name ?? '',
            ];
        })->toArray();
    }

    public function getSalesByPeriod(int $days = 7): array
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $dailySales = Transaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->selectRaw('DATE(transaction_date) as date, COUNT(*) as transactions, SUM(total_price) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalRevenue = $dailySales->sum('revenue');
        $totalTransactions = $dailySales->sum('transactions');
        $avgTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        return [
            'period' => "{$days} hari terakhir",
            'start_date' => $startDate->format('d F Y'),
            'end_date' => $endDate->format('d F Y'),
            'total_revenue' => (int) $totalRevenue,
            'total_transactions' => $totalTransactions,
            'avg_transaction' => (int) $avgTransaction,
            'daily_data' => $dailySales->map(function ($day) {
                return [
                    'date' => Carbon::parse($day->date)->format('d M'),
                    'transactions' => $day->transactions,
                    'revenue' => (int) $day->revenue,
                ];
            })->toArray(),
        ];
    }

    public function getCategorySales(): array
    {
        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        $categorySales = TransactionItem::select('product_name')
            ->selectRaw('SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
            ->whereHas('product', function ($query) {
                $query->where('is_active', true);
            })
            ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('transaction_date', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            })
            ->with('product.category')
            ->get()
            ->groupBy(fn ($item) => $item->product?->category?->name ?? 'Tanpa Kategori')
            ->map(function ($items) {
                return [
                    'total_quantity' => $items->sum('total_qty'),
                    'total_revenue' => (int) $items->sum('total_revenue'),
                ];
            })
            ->sortByDesc('total_revenue')
            ->take(10);

        $totalRevenue = $categorySales->sum('total_revenue');

        return [
            'period' => 'Bulan ini',
            'total_revenue' => (int) $totalRevenue,
            'categories' => $categorySales->map(function ($data, $category) use ($totalRevenue) {
                $percentage = $totalRevenue > 0 ? round(($data['total_revenue'] / $totalRevenue) * 100, 1) : 0;

                return [
                    'category_name' => $category,
                    'quantity_sold' => (int) $data['total_quantity'],
                    'revenue' => $data['total_revenue'],
                    'percentage' => $percentage,
                ];
            })->values()->toArray(),
        ];
    }

    public function getExpensesByPeriod(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $expenses = Expense::whereBetween('date', [$startDate, $endDate])
            ->with('category')
            ->get();

        $totalExpenses = $expenses->sum('amount');
        $byCategory = $expenses->groupBy(fn ($expense) => $expense->category?->name ?? 'Tanpa Kategori')
            ->map(function ($items) {
                return [
                    'total' => (int) $items->sum('amount'),
                    'count' => $items->count(),
                ];
            })
            ->sortByDesc('total');

        return [
            'period' => "{$days} hari terakhir",
            'start_date' => $startDate->format('d F Y'),
            'end_date' => $endDate->format('d F Y'),
            'total_expenses' => (int) $totalExpenses,
            'transaction_count' => $expenses->count(),
            'by_category' => $byCategory->map(function ($data, $category) use ($totalExpenses) {
                $percentage = $totalExpenses > 0 ? round(($data['total'] / $totalExpenses) * 100, 1) : 0;

                return [
                    'category' => $category,
                    'total' => $data['total'],
                    'count' => $data['count'],
                    'percentage' => $percentage,
                ];
            })->toArray(),
        ];
    }

    public function getProfitLoss(int $days = 30): array
    {
        $salesData = $this->getSalesByPeriod($days);
        $expensesData = $this->getExpensesByPeriod($days);

        $totalRevenue = $salesData['total_revenue'];
        $totalExpenses = $expensesData['total_expenses'];
        $profit = $totalRevenue - $totalExpenses;
        $margin = $totalRevenue > 0 ? round(($profit / $totalRevenue) * 100, 1) : 0;

        return [
            'period' => "{$days} hari terakhir",
            'total_revenue' => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'profit' => $profit,
            'margin_percentage' => $margin,
            'status' => $profit >= 0 ? 'profit' : 'loss',
        ];
    }

    public function getAvailableProductsWithSales(string $period = 'week'): array
    {
        $products = Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->with(['category', 'unit'])
            ->orderBy('name')
            ->get();

        $dateRange = match ($period) {
            'today' => [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()],
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            default => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
        };

        [$startDate, $endDate] = $dateRange;

        $salesData = TransactionItem::select('product_id')
            ->selectRaw('SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
            ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('transaction_date', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            })
            ->groupBy('product_id')
            ->pluck('total_qty', 'product_id')
            ->toArray();

        $revenueData = TransactionItem::select('product_id')
            ->selectRaw('SUM(subtotal) as total_revenue')
            ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('transaction_date', [$startDate, $endDate])
                    ->where('payment_status', 'paid');
            })
            ->groupBy('product_id')
            ->pluck('total_revenue', 'product_id')
            ->toArray();

        $productsWithSales = $products->map(function ($product) use ($salesData, $revenueData) {
            $qtySold = $salesData[$product->id] ?? 0;
            $revenue = $revenueData[$product->id] ?? 0;

            return [
                'product_name' => $product->name,
                'category' => $product->category?->name ?? 'Tidak ada',
                'unit' => $product->unit?->short_name ?? '',
                'current_stock' => $product->stock,
                'price' => (int) $product->sell_price,
                'quantity_sold' => (int) $qtySold,
                'revenue' => (int) $revenue,
                'is_selling' => $qtySold > 0,
            ];
        })->sortByDesc('quantity_sold')->values()->toArray();

        $sellingProducts = array_filter($productsWithSales, fn ($p) => $p['is_selling']);
        $notSellingProducts = array_filter($productsWithSales, fn ($p) => ! $p['is_selling']);

        $periodLabel = match ($period) {
            'today' => 'Hari ini',
            'week' => 'Minggu ini',
            'month' => 'Bulan ini',
            default => 'Minggu ini',
        };

        return [
            'period' => $periodLabel,
            'total_products' => count($productsWithSales),
            'selling_products' => count($sellingProducts),
            'not_selling_products' => count($notSellingProducts),
            'all_products' => $productsWithSales,
            'top_selling' => array_slice($sellingProducts, 0, 5),
        ];
    }
}
