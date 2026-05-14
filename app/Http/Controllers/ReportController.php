<?php

namespace App\Http\Controllers;

use App\Exports\ExpensesReportExport;
use App\Exports\SalesReportExport;
use App\Models\Expense;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    private function getUserFilter($user)
    {
        return $user && $user->hasRole('owner') ? null : $user->id;
    }

    public function sales(Request $request): Response
    {
        $user = Auth::user();
        $userId = $this->getUserFilter($user);
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $transactions = Transaction::with(['user', 'items.product'])
            ->when($userId, function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->whereBetween('created_at', [$startDate, $endDate.' 23:59:59'])
            ->where('payment_status', 'paid')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $summary = [
            'total_revenue' => Transaction::when($userId, function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
                ->whereBetween('created_at', [$startDate, $endDate.' 23:59:59'])
                ->where('payment_status', 'paid')
                ->sum('total_price'),
            'total_transactions' => Transaction::when($userId, function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
                ->whereBetween('created_at', [$startDate, $endDate.' 23:59:59'])
                ->where('payment_status', 'paid')
                ->count(),
            'gross_profit' => TransactionItem::whereHas('transaction', function ($query) use ($startDate, $endDate, $userId) {
                $query->when($userId, function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                    ->whereBetween('created_at', [$startDate, $endDate.' 23:59:59'])
                    ->where('payment_status', 'paid');
            })->get()->sum(fn ($item) => ($item->price_sell - $item->price_buy_snapshot) * $item->quantity),
        ];

        return Inertia::render('report/sales', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function expenses(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $expenses = Expense::with(['user', 'category'])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->paginate(20)
            ->withQueryString();

        $totalByCategory = Expense::with('category')
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->groupBy('expense_category_id')
            ->map(fn ($items) => $items->sum('amount'));

        $summary = [
            'total_expenses' => Expense::whereBetween('date', [$startDate, $endDate])->sum('amount'),
            'by_category' => $totalByCategory,
        ];

        return Inertia::render('report/expenses', [
            'expenses' => $expenses,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function profitLoss(Request $request): Response
    {
        $user = Auth::user();
        $userId = $this->getUserFilter($user);
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $grossProfit = TransactionItem::whereHas('transaction', function ($query) use ($startDate, $endDate, $userId) {
            $query->when($userId, function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
                ->whereBetween('created_at', [$startDate, $endDate.' 23:59:59'])
                ->where('payment_status', 'paid');
        })->get()->sum(fn ($item) => ($item->price_sell - $item->price_buy_snapshot) * $item->quantity);

        $totalExpenses = Expense::whereBetween('date', [$startDate, $endDate])->sum('amount');
        $netProfit = $grossProfit - $totalExpenses;

        $salesByDay = Transaction::when($userId, function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->whereBetween('created_at', [$startDate, $endDate.' 23:59:59'])
            ->where('payment_status', 'paid')
            ->selectRaw('DATE(created_at) as date, SUM(total_price) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $expensesByDay = Expense::whereBetween('date', [$startDate, $endDate])
            ->selectRaw('date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('report/profit-loss', [
            'summary' => [
                'gross_profit' => $grossProfit,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
            ],
            'sales_by_day' => $salesByDay,
            'expenses_by_day' => $expensesByDay,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function exportSales(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $filename = 'sales_report_'.$startDate.'_to_'.$endDate.'.xlsx';

        return Excel::download(new SalesReportExport($startDate, $endDate), $filename);
    }

    public function exportExpenses(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $filename = 'expenses_report_'.$startDate.'_to_'.$endDate.'.xlsx';

        return Excel::download(new ExpensesReportExport($startDate, $endDate), $filename);
    }
}
