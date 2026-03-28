<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Expense;
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

        $todayExpenses = Expense::whereDate('date', today())->get();
        $monthExpenses = Expense::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->get();

        $stats = [
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
            'total_units' => Unit::count(),
            'low_stock_products' => Product::whereColumn('stock', '<', 'min_stock')->count(),
            'active_products' => Product::where('is_active', true)->count(),
            'today_sales' => $todayTransactions->count(),
            'today_revenue' => $todayTransactions->sum('total_price'),
            'today_expenses' => $todayExpenses->sum('amount'),
            'month_expenses' => $monthExpenses->sum('amount'),
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
