<?php

use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\ExpenseController;
use App\Http\Controllers\ExpenseCategory\ExpenseCategoryController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockMovement\StockMovementController;
use App\Http\Controllers\Transaction\TransactionController;
use App\Http\Controllers\Unit\UnitController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('pos', [TransactionController::class, 'pos'])->name('pos');

    Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'show']);
    Route::get('transactions/receipt/{transaction}', [TransactionController::class, 'receipt'])->name('transactions.receipt');

    Route::resource('stock-movements', StockMovementController::class)->only(['index', 'store']);

    Route::resource('expense-categories', ExpenseCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('units', UnitController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('products', ProductController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('products/barcode/{barcode}', [ProductController::class, 'byBarcode']);

    Route::get('reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('reports/expenses', [ReportController::class, 'expenses'])->name('reports.expenses');
    Route::get('reports/profit-loss', [ReportController::class, 'profitLoss'])->name('reports.profit-loss');
});

require __DIR__.'/settings.php';
