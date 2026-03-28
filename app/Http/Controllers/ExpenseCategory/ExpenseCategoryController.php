<?php

namespace App\Http\Controllers\ExpenseCategory;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseCategory\StoreExpenseCategoryRequest;
use App\Http\Requests\ExpenseCategory\UpdateExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = ExpenseCategory::orderBy('name')->get();

        return Inertia::render('expense-category/index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreExpenseCategoryRequest $request): RedirectResponse
    {
        ExpenseCategory::create($request->validated());

        return back();
    }

    public function update(UpdateExpenseCategoryRequest $request, ExpenseCategory $expense_category): RedirectResponse
    {
        $expense_category->update($request->validated());

        return back();
    }

    public function destroy(ExpenseCategory $expense_category): RedirectResponse
    {
        $expense_category->delete();

        return back();
    }
}
