<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\Unit;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $todayTransactions = Transaction::whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->get();

        $stats = [
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
            'total_units' => Unit::count(),
            'low_stock_products' => Product::whereColumn('stock', '<', 'min_stock')->count(),
            'active_products' => Product::where('is_active', true)->count(),
            'today_sales' => $todayTransactions->count(),
            'today_revenue' => $todayTransactions->sum('total_price'),
        ];

        $lowStockProducts = Product::with(['category', 'unit'])
            ->whereColumn('stock', '<', 'min_stock')
            ->orderBy('stock', 'asc')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}
