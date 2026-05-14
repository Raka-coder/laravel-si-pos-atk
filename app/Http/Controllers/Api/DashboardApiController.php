<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    private const CACHE_TTL = 10; // 10 seconds

    private function getUserFilter($query)
    {
        $user = Auth::user();
        $isOwner = $user && $user->hasRole('owner');

        if (! $isOwner && $user) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }

    public function chartData(): JsonResponse
    {
        $user = Auth::user();
        $isOwner = $user && $user->hasRole('owner');
        $userId = $isOwner ? null : $user->id;
        $cacheKey = 'dashboard_charts_'.$user->id.'_'.now()->format('Y-m-d-H-i');

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($userId) {
            $startDate = now()->subDays(30)->startOfDay();
            $driver = DB::getDriverName();
            $date = $driver === 'sqlite' ? 'date(created_at)' : ($driver === 'pgsql' ? 'created_at::date' : 'DATE(created_at)');

            // Daily revenue last 30 days
            $dailyRevenue = Transaction::selectRaw("{$date} as date, COALESCE(SUM(total_price), 0) as revenue, COUNT(*) as transactions")
                ->when($userId, function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', $startDate)
                ->groupBy(DB::raw($date))
                ->orderBy('date')
                ->get();

            // Payment method distribution
            $paymentMethods = Transaction::selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total_price), 0) as total')
                ->when($userId, function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
                ->where('payment_status', 'paid')
                ->where('created_at', '>=', $startDate)
                ->groupBy('payment_method')
                ->get();

            // Top products
            $topProducts = TransactionItem::selectRaw('product_id, product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_revenue')
                ->whereHas('transaction', function ($q) use ($startDate, $userId) {
                    $q->when($userId, function ($query) use ($userId) {
                        $query->where('user_id', $userId);
                    })
                        ->where('payment_status', 'paid')
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
                ->when($userId, function ($query) use ($userId) {
                    $query->where('t.user_id', $userId);
                })
                ->where('t.payment_status', 'paid')
                ->where('t.created_at', '>=', $startDate)
                ->groupBy('c.name')
                ->orderByDesc('revenue')
                ->get();

            // Monthly comparison (last 6 months)
            if ($driver === 'sqlite') {
                $monthSelect = 'strftime("%Y", created_at) as year, strftime("%m", created_at) as month';
            } elseif ($driver === 'pgsql') {
                $monthSelect = "EXTRACT(YEAR FROM created_at) as year, LPAD(EXTRACT(MONTH FROM created_at)::text, 2, '0') as month";
            } else {
                $monthSelect = 'YEAR(created_at) as year, MONTH(created_at) as month';
            }

            $monthlyRevenue = Transaction::selectRaw($monthSelect.', COALESCE(SUM(total_price), 0) as revenue, COUNT(*) as transactions')
                ->when($userId, function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                })
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
        $user = Auth::user();
        $cacheKey = 'dashboard_charts_'.$user->id.'_'.now()->format('Y-m-d-H-i');
        Cache::forget($cacheKey);

        return $this->chartData();
    }

    public function hourlyData(): JsonResponse
    {
        $user = Auth::user();
        $isOwner = $user && $user->hasRole('owner');
        $userId = $isOwner ? null : $user->id;
        $driver = DB::getDriverName();
        $today = today();

        if ($driver === 'sqlite') {
            $hourSelect = 'strftime("%H", created_at) as hour';
        } elseif ($driver === 'pgsql') {
            $hourSelect = "LPAD(EXTRACT(HOUR FROM created_at)::text, 2, '0') as hour";
        } else {
            $hourSelect = 'HOUR(created_at) as hour';
        }

        $hourlyRevenue = Transaction::selectRaw($hourSelect.', COALESCE(SUM(total_price), 0) as revenue')
            ->when($userId, function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
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
