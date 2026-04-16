<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Unit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const CACHE_TTL = 10; // 10 seconds cache

    public function __invoke(): Response
    {
        $user = Auth::user();
        $isOwner = $user && $user->hasRole('owner');

        // Minimal stats untuk initial load (fast)
        $stats = $this->getQuickStats($isOwner);

        if ($isOwner) {
            return Inertia::render('dashboard', [
                'stats' => $stats['stats'],
                'lowStockProducts' => $stats['lowStockProducts'],
                'isCashier' => false,
                'chartData' => $stats['chartData'],
            ]);
        }

        return Inertia::render('dashboard', [
            'stats' => $stats['stats'],
            'isCashier' => true,
            'hourlyRevenue' => $stats['hourlyData'],
            'todayPaymentMethods' => $stats['todayPaymentMethods'],
            'todayTopProducts' => $stats['todayTopProducts'],
            'lowStockProducts' => $stats['lowStockProducts'],
        ]);
    }

    private function getQuickStats(bool $isOwner): array
    {
        $userId = Auth::id() ?? 'guest';
        $cacheKey = 'dashboard_quick_'.$userId.'_'.now()->format('Y-m-d-H-i');

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($isOwner) {
            $driver = DB::getDriverName();
            $today = today();
            $startDate = now()->subDays(30)->startOfDay();

            // OPTIMIZATION 1: Single query untuk today transactions dengan agregasi
            $todayStats = Transaction::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue')
                ->first();

            $stats = [
                'today_sales' => $todayStats?->count ?? 0,
                'today_revenue' => (int) ($todayStats?->revenue ?? 0),
            ];

            if (! $isOwner) {
                return $this->getCashierStats($stats, $driver, $today);
            }

            // OPTIMIZATION 2: Single query untuk expenses
            $expenseStats = Expense::whereDate('date', $today)
                ->selectRaw('COALESCE(SUM(amount), 0) as today_expenses')
                ->first();

            $monthExpenseStats = Expense::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->selectRaw('COALESCE(SUM(amount), 0) as month_expenses')
                ->first();

            // OPTIMIZATION 3: Batch counts menggunakan whereRaw
            $counts = [
                'total_products' => Product::count(),
                'total_categories' => Category::count(),
                'total_units' => Unit::count(),
                'low_stock_products' => Product::whereRaw('stock < min_stock')->count(),
                'active_products' => Product::where('is_active', true)->count(),
            ];

            $monthRevenue = Transaction::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->where('payment_status', 'paid')
                ->selectRaw('COALESCE(SUM(total_price), 0) as revenue')
                ->first();

            $monthRevenueVal = (int) ($monthRevenue?->revenue ?? 0);
            $monthExpenseVal = (int) ($monthExpenseStats?->month_expenses ?? 0);

            $stats = array_merge($stats, $counts, [
                'today_expenses' => (int) ($expenseStats?->today_expenses ?? 0),
                'month_expenses' => $monthExpenseVal,
                'month_revenue' => $monthRevenueVal,
                'month_profit' => $monthRevenueVal - $monthExpenseVal,
            ]);

            // OPTIMIZATION 4: Chart data with caching
            $startDate = now()->subDays(30)->startOfDay();
            $driver = DB::getDriverName();

            // Daily revenue last 30 days
            $dailyRevenue = Transaction::selectRaw('DATE(created_at) as date, COALESCE(SUM(total_price), 0) as revenue, COUNT(*) as transactions')
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', $startDate)
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Payment method distribution
            $paymentMethods = Transaction::selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total_price), 0) as total')
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
            $categoryRevenue = TransactionItem::selectRaw('c.name as category_name, COALESCE(SUM(ti.subtotal), 0) as revenue')
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
            $monthSelect = $driver === 'sqlite'
                ? 'strftime("%Y", created_at) as year, strftime("%m", created_at) as month'
                : 'YEAR(created_at) as year, MONTH(created_at) as month';

            $monthlyRevenue = Transaction::selectRaw($monthSelect.', COALESCE(SUM(total_price), 0) as revenue, COUNT(*) as transactions')
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get();

            return [
                'stats' => $stats,
                'lowStockProducts' => Product::with(['category', 'unit'])
                    ->whereRaw('stock < min_stock')
                    ->orderBy('stock', 'asc')
                    ->limit(5)
                    ->get(),
                'chartData' => [
                    'daily_revenue' => $dailyRevenue,
                    'payment_methods' => $paymentMethods,
                    'top_products' => $topProducts,
                    'category_revenue' => $categoryRevenue,
                    'monthly_revenue' => $monthlyRevenue,
                ],
            ];
        });
    }

    private function getCashierStats(array $stats, string $driver, $today): array
    {
        $hourSelect = $driver === 'sqlite'
            ? 'strftime("%H", created_at) as hour'
            : 'HOUR(created_at) as hour';

        $hourlyRevenue = Transaction::selectRaw($hourSelect.', COALESCE(SUM(total_price), 0) as revenue')
            ->where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('revenue', 'hour')
            ->toArray();

        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $hourKey = (string) $h;
            $hourlyData[] = [
                'hour' => str_pad($h, 2, '0', STR_PAD_LEFT).':00',
                'revenue' => (float) ($hourlyRevenue[$hourKey] ?? 0),
            ];
        }

        $paymentStats = Transaction::selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total_price), 0) as total')
            ->where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->groupBy('payment_method')
            ->get();

        $todayTopProducts = TransactionItem::selectRaw('product_id, product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
            ->whereHas('transaction', function ($q) use ($today) {
                $q->where('payment_status', 'paid')
                    ->whereDate('created_at', $today);
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        $peakHour = ! empty($hourlyRevenue)
            ? (array_keys($hourlyRevenue, max($hourlyRevenue))[0] ?? null)
            : null;
        $avgTransaction = $stats['today_sales'] > 0
            ? $stats['today_revenue'] / $stats['today_sales']
            : 0;

        $stats['avg_transaction'] = $avgTransaction;
        $stats['peak_hour'] = $peakHour;

        return [
            'stats' => $stats,
            'hourlyData' => $hourlyData,
            'todayPaymentMethods' => $paymentStats,
            'todayTopProducts' => $todayTopProducts,
            'lowStockProducts' => Product::with(['category', 'unit'])
                ->whereRaw('stock < min_stock')
                ->orderBy('stock', 'asc')
                ->limit(5)
                ->get(),
        ];
    }
}
