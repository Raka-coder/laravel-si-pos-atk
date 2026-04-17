<?php

use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\Chat\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expense\ExpenseController;
use App\Http\Controllers\ExpenseCategory\ExpenseCategoryController;
use App\Http\Controllers\Payment\MidtransCallbackController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Settings\ShopSettingController;
use App\Http\Controllers\StockMovement\StockMovementController;
use App\Http\Controllers\Transaction\TransactionController;
use App\Http\Controllers\Unit\UnitController;
use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// Midtrans webhook (no auth required - verified by signature)
Route::post('midtrans/notification', [MidtransCallbackController::class, 'handleNotification'])->name('midtrans.notification');
Route::get('midtrans/redirect', [MidtransCallbackController::class, 'handleRedirect'])->name('midtrans.redirect');

Route::middleware(['auth', 'verified', 'role:owner'])->group(function () {
    Route::resource('users', UserController::class)->except(['create', 'edit']);
    Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::patch('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');

    Route::resource('product-categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('units', UnitController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('products', ProductController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('products/barcode/{barcode}', [ProductController::class, 'byBarcode']);

    Route::resource('expense-categories', ExpenseCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('stock-movements', StockMovementController::class)->only(['index', 'store']);

    Route::get('shop-settings', [ShopSettingController::class, 'index'])->name('shop-settings');
    Route::put('shop-settings', [ShopSettingController::class, 'update'])->name('shop-settings.update');

    Route::get('reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
    Route::get('reports/sales/export', [ReportController::class, 'exportSales'])->name('reports.sales.export');
    Route::get('reports/expenses', [ReportController::class, 'expenses'])->name('reports.expenses');
    Route::get('reports/expenses/export', [ReportController::class, 'exportExpenses'])->name('reports.expenses.export');
    Route::get('reports/profit-loss', [ReportController::class, 'profitLoss'])->name('reports.profit-loss');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Dashboard API for lazy loading
    Route::get('api/dashboard/charts', [DashboardApiController::class, 'chartData'])->name('api.dashboard.charts');
    Route::get('api/dashboard/charts/refresh', [DashboardApiController::class, 'refreshStats'])->name('api.dashboard.refresh');
    Route::get('api/dashboard/hourly', [DashboardApiController::class, 'hourlyData'])->name('api.dashboard.hourly');

    Route::get('chat', [ChatController::class, 'index'])->name('chat');
    Route::post('chat/send', [ChatController::class, 'send'])->name('chat.send');
    Route::post('chat/reset', [ChatController::class, 'reset'])->name('chat.reset');
    Route::get('chat/conversations', [ChatController::class, 'conversations'])->name('chat.conversations');
    Route::get('chat/conversations/{conversation}', [ChatController::class, 'showConversation'])->name('chat.show');
    Route::delete('chat/conversations/{conversation}', [ChatController::class, 'deleteConversation'])->name('chat.destroy');
    Route::post('chat/clear-old', [ChatController::class, 'clearOldConversations'])->name('chat.clear-old');
    Route::get('chat/statistics', [ChatController::class, 'statistics'])->name('chat.statistics');

    Route::get('pos', [TransactionController::class, 'pos'])->name('pos');

    Route::resource('transactions', TransactionController::class)->only(['index', 'store', 'show', 'update']);
    Route::get('transactions/receipt/{transaction}', [TransactionController::class, 'receipt'])->name('transactions.receipt');
});

require __DIR__.'/settings.php';
