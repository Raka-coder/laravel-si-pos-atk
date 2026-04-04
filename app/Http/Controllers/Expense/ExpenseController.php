<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $cacheKey = 'expense_categories_list';

        $categories = Cache::remember($cacheKey, now()->addHours(6), function () {
            return ExpenseCategory::orderBy('name')->get()->toArray();
        });

        $query = Expense::with(['user', 'category'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhere('note', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category_id'), function ($query) use ($request) {
                $query->where('expense_category_id', $request->category_id);
            })
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->whereDate('date', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->whereDate('date', '<=', $request->date_to);
            })
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        $expenses = $query->paginate(15)->withQueryString();

        return Inertia::render('expense/index', [
            'expenses' => $expenses,
            'categories' => array_values($categories),
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }

    public function store(StoreExpenseRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();
        Expense::create($data);

        Cache::forget('expense_categories_list');

        return back();
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): RedirectResponse
    {
        $expense->update($request->validated());

        return back();
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return back();
    }
}
