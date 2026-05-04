import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

import { ConfirmAlert } from '@/components/common/confirm-alert';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExpenseCategoryFormDialog } from '@/features/expense-category/components/ExpenseCategoryFormDialog';
import { ExpenseCategoryTable } from '@/features/expense-category/components/ExpenseCategoryTable';
import type { ExpenseCategoryForm } from '@/schemas/expense-category.schema';
import type { BreadcrumbItem, ExpenseCategory, Paginated } from '@/types';

interface Props {
    [key: string]: unknown;
    categories: Paginated<ExpenseCategory>;
    filters: {
        search: string | null;
    };
}

export default function ExpenseCategoryIndex() {
    const { categories, filters } = usePage<Props>().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<ExpenseCategory | null>(null);
    const [deletingCategory, setDeletingCategory] =
        useState<ExpenseCategory | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const [isProcessing, setIsProcessing] = useState(false);

    // Debounce search
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
                '/expense-categories',
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleFormSubmit = (data: ExpenseCategoryForm) => {
        setIsProcessing(true);

        if (editingCategory) {
            router.put(`/expense-categories/${editingCategory.id}`, data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    setEditingCategory(null);
                },
                onFinish: () => setIsProcessing(false),
            });
        } else {
            router.post('/expense-categories', data, {
                onSuccess: () => setIsFormOpen(false),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deletingCategory) {
            return;
        }

        setIsProcessing(true);
        router.delete(`/expense-categories/${deletingCategory.id}`, {
            onSuccess: () => setDeletingCategory(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString()
            ? `?${params.toString()}`
            : '/expense-categories';
    };

    const openCreateForm = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const openEditForm = (category: ExpenseCategory) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    return (
        <>
            <Head title="Expense Categories" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Expense Categories">
                    <Button size="lg" onClick={openCreateForm}>
                        <Plus className="mr-0.5 h-4 w-4" />
                        Add Category
                    </Button>
                </PageHeader>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <ExpenseCategoryTable
                        categories={categories}
                        onEdit={openEditForm}
                        onDelete={setDeletingCategory}
                        getPaginationLink={getPaginationLink}
                    />
                </div>
            </div>

            <ExpenseCategoryFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                category={editingCategory}
                onSubmit={handleFormSubmit}
                isProcessing={isProcessing}
            />

            <ConfirmAlert
                open={!!deletingCategory}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                title="Delete Category"
                description={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
                confirmText={isProcessing ? 'Deleting...' : 'Delete'}
                onConfirm={handleDelete}
                variant="destructive"
            />
        </>
    );
}

ExpenseCategoryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Expense Categories',
            href: '/expense-categories',
        },
    ] as BreadcrumbItem[],
};
