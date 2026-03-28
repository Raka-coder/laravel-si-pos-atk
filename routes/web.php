<?php

use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Product\ProductController;
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

    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('units', UnitController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('products', ProductController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('products/barcode/{barcode}', [ProductController::class, 'byBarcode']);
});

require __DIR__.'/settings.php';
