import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

import { ConfirmAlert } from '@/components/common/confirm-alert';
import { DataTable } from '@/components/common/data-table';
import type { Column } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExpenseActions } from '@/features/expense/components/ExpenseActions';
import { ExpenseFormDialog } from '@/features/expense/components/ExpenseFormDialog';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { ExpenseForm } from '@/schemas/expense.schema';
import type { BreadcrumbItem } from '@/types';
import type { Expense, ExpenseCategory, Paginated } from '@/types/models';

interface Props {
    [key: string]: unknown;
    expenses: Paginated<Expense>;
    categories: ExpenseCategory[];
    filters: {
        search: string | null;
        category_id: string | null;
        date_from: string | null;
        date_to: string | null;
    };
}

export default function ExpenseIndex() {
    const { expenses, categories, filters } = usePage<Props>().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(
        null,
    );
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (search === (filters.search || '')) {
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/expenses',
                { search },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleFormSubmit = (data: ExpenseForm) => {
        setIsProcessing(true);

        if (editingExpense) {
            router.put(`/expenses/${editingExpense.id}`, data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    setEditingExpense(null);
                },
                onFinish: () => setIsProcessing(false),
            });
        } else {
            router.post('/expenses', data, {
                onSuccess: () => setIsFormOpen(false),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deletingExpense) {
            return;
        }

        setIsProcessing(true);
        router.delete(`/expenses/${deletingExpense.id}`, {
            onSuccess: () => setDeletingExpense(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const openCreateForm = () => {
        setEditingExpense(null);
        setIsFormOpen(true);
    };

    const openEditForm = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString() ? `?${params.toString()}` : '/expenses';
    };

    const columns: Column<Expense>[] = [
        {
            header: 'Date',
            accessorKey: 'date',
            className: 'text-left',
            cell: (expense) => formatDate(expense.date),
        },
        {
            header: 'Name',
            accessorKey: 'name',
            className: 'text-left font-medium',
        },
        {
            header: 'Category',
            className: 'text-left',
            cell: (expense) => expense.category?.name || '-',
        },
        {
            header: 'Amount',
            className: 'text-right',
            cell: (expense) => formatCurrency(expense.amount),
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: useCallback(
                (expense: Expense) => (
                    <ExpenseActions
                        expense={expense}
                        onEdit={openEditForm}
                        onDelete={setDeletingExpense}
                    />
                ),
                [],
            ),
        },
    ];

    return (
        <>
            <Head title="Expenses" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Expenses">
                    <Button size="lg" onClick={openCreateForm}>
                        <Plus className="mr-0.5 h-4 w-4" />
                        Add Expense
                    </Button>
                </PageHeader>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search expenses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={expenses.data}
                        meta={expenses}
                        getPaginationLink={getPaginationLink}
                        emptyMessage="No expenses found."
                    />
                </div>
            </div>

            <ExpenseFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                expense={editingExpense}
                onSubmit={handleFormSubmit}
                isProcessing={isProcessing}
                categories={categories}
            />

            <ConfirmAlert
                open={!!deletingExpense}
                onOpenChange={(open) => !open && setDeletingExpense(null)}
                title="Delete Expense"
                description={`Are you sure you want to delete this expense? This action cannot be undone.`}
                confirmText={isProcessing ? 'Deleting...' : 'Delete'}
                onConfirm={handleDelete}
                variant="destructive"
            />
        </>
    );
}

ExpenseIndex.layout = {
    breadcrumbs: [
        {
            title: 'Expenses',
            href: '/expenses',
        },
    ] as BreadcrumbItem[],
};
