<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    private const CACHE_TTL = 10; // 10 seconds

    public function chartData(): JsonResponse
    {
        $cacheKey = 'dashboard_charts_'.now()->format('Y-m-d-H-i');

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () {
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
                'daily_revenue' => $dailyRevenue,
                'payment_methods' => $paymentMethods,
                'top_products' => $topProducts,
                'category_revenue' => $categoryRevenue,
                'monthly_revenue' => $monthlyRevenue,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'cached_at' => now()->toIso8601String(),
        ]);
    }

    public function refreshStats(): JsonResponse
    {
        // Force refresh - bypass cache
        $cacheKey = 'dashboard_charts_'.now()->format('Y-m-d-H-i');
        Cache::forget($cacheKey);

        return $this->chartData();
    }

    public function hourlyData(): JsonResponse
    {
        $driver = DB::getDriverName();
        $today = today();

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

        return response()->json([
            'success' => true,
            'data' => $hourlyData,
        ]);
    }
}
