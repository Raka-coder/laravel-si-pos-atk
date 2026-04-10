<?php

namespace App\Http\Controllers\ExpenseCategory;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseCategory\StoreExpenseCategoryRequest;
use App\Http\Requests\ExpenseCategory\UpdateExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = Cache::remember('expense_categories_all', now()->addHours(6), function () {
            return ExpenseCategory::orderBy('name')->get()->toArray();
        });

        $categories = collect($categories);
        $filtered = $categories;

        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $filtered = $filtered->filter(function ($category) use ($search) {
                return str_contains(strtolower($category['name']), $search);
            });
        }

        $total = $filtered->count();
        $perPage = 10;
        $currentPage = (int) $request->get('page', 1);
        $currentPage = max(1, $currentPage);
        $offset = ($currentPage - 1) * $perPage;
        $paginated = $filtered->slice($offset, $perPage)->values();

        $lastPage = max(1, (int) ceil($total / $perPage));

        $paginatedData = new LengthAwarePaginator(
            $paginated,
            $total,
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('expense-category/index', [
            'categories' => $paginatedData,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function store(StoreExpenseCategoryRequest $request): RedirectResponse
    {
        ExpenseCategory::create($request->validated());

        Cache::forget('expense_categories_all');

        return back()->with('success', 'Kategori pengeluaran berhasil ditambahkan.');
    }

    public function update(UpdateExpenseCategoryRequest $request, ExpenseCategory $expense_category): RedirectResponse
    {
        $expense_category->update($request->validated());

        Cache::forget('expense_categories_all');

        return back()->with('success', 'Kategori pengeluaran berhasil diperbarui.');
    }

    public function destroy(ExpenseCategory $expense_category): RedirectResponse
    {
        $expense_category->delete();

        Cache::forget('expense_categories_all');

        return back()->with('success', 'Kategori pengeluaran berhasil dihapus.');
    }
}
