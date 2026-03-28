<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $stats = [
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
            'total_units' => Unit::count(),
            'low_stock_products' => Product::whereColumn('stock', '<', 'min_stock')->count(),
            'active_products' => Product::where('is_active', true)->count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
