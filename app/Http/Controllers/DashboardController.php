<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Unit;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();
        $isOwner = $user && $user->hasRole('owner');

        $todayTransactions = Transaction::whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->get();

        $stats = [
            'today_sales' => $todayTransactions->count(),
            'today_revenue' => $todayTransactions->sum('total_price'),
        ];

        if ($isOwner) {
            $todayExpenses = Expense::whereDate('date', today())->get();
            $monthExpenses = Expense::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->get();

            $monthRevenue = Transaction::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->where('payment_status', 'paid')
                ->sum('total_price');

            $stats = array_merge($stats, [
                'total_products' => Product::count(),
                'total_categories' => Category::count(),
                'total_units' => Unit::count(),
                'low_stock_products' => Product::whereColumn('stock', '<', 'min_stock')->count(),
                'active_products' => Product::where('is_active', true)->count(),
                'today_expenses' => $todayExpenses->sum('amount'),
                'month_expenses' => $monthExpenses->sum('amount'),
                'month_revenue' => $monthRevenue,
                'month_profit' => $monthRevenue - $monthExpenses->sum('amount'),
            ]);

            $lowStockProducts = Product::with(['category', 'unit'])
                ->whereColumn('stock', '<', 'min_stock')
                ->orderBy('stock', 'asc')
                ->limit(10)
                ->get();

            // Chart data
            $daysBack = 30;
            $startDate = now()->subDays($daysBack)->startOfDay();

            // Daily revenue last 30 days
            $dailyRevenue = Transaction::selectRaw('DATE(created_at) as date, SUM(total_price) as revenue, COUNT(*) as transactions')
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', $startDate)
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Payment method distribution
            $paymentMethods = Transaction::selectRaw('payment_method, COUNT(*) as count, SUM(total_price) as total')
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', $startDate)
                ->groupBy('payment_method')
                ->get();

            // Top products
            $topProducts = TransactionItem::selectRaw('product_id, product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
                ->whereHas('transaction', function ($q) use ($startDate) {
                    $q->where('payment_status', 'paid')
                        ->where('created_at', '>=', $startDate);
                })
                ->groupBy('product_id', 'product_name')
                ->orderByDesc('total_qty')
                ->limit(10)
                ->get();

            // Revenue by category
            $categoryRevenue = TransactionItem::selectRaw('c.name as category_name, SUM(ti.subtotal) as revenue')
                ->from('transaction_items as ti')
                ->join('transactions as t', 'ti.transaction_id', '=', 't.id')
                ->join('products as p', 'ti.product_id', '=', 'p.id')
                ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
                ->where('t.payment_status', 'paid')
                ->where('t.created_at', '>=', $startDate)
                ->groupBy('c.name')
                ->orderByDesc('revenue')
                ->get();

            // Monthly comparison (last 6 months)
            $monthlyRevenue = Transaction::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(total_price) as revenue, COUNT(*) as transactions')
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            return Inertia::render('dashboard', [
                'stats' => $stats,
                'lowStockProducts' => $lowStockProducts,
                'isCashier' => false,
                'chartData' => [
                    'daily_revenue' => $dailyRevenue,
                    'payment_methods' => $paymentMethods,
                    'top_products' => $topProducts,
                    'category_revenue' => $categoryRevenue,
                    'monthly_revenue' => $monthlyRevenue,
                ],
            ]);
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'isCashier' => true,
        ]);
    }
}
