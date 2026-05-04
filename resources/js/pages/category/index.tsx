import { Head, usePage, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

import { ConfirmAlert } from '@/components/common/confirm-alert';
import { DataTable } from '@/components/common/data-table';
import type { Column } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryActions } from '@/features/category/components/CategoryActions';
import { CategoryFormDialog } from '@/features/category/components/CategoryFormDialog';
import type { CategoryForm } from '@/schemas/category.schema';
import type { BreadcrumbItem, Category, Paginated } from '@/types';

interface Props {
    [key: string]: unknown;
    categories: Paginated<Category>;
    filters: {
        search: string;
    };
}

export default function CategoryIndex() {
    const { categories, filters } = usePage<Props>().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (searchTerm === (filters.search || '')) {
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/product-categories',
                { search: searchTerm },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filters.search]);

    const handleFormSubmit = (data: CategoryForm) => {
        setIsProcessing(true);

        if (editingCategory) {
            router.put(`/product-categories/${editingCategory.id}`, data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    setEditingCategory(null);
                },
                onFinish: () => setIsProcessing(false),
            });
        } else {
            router.post('/product-categories', data, {
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
        router.delete(`/product-categories/${deletingCategory.id}`, {
            onSuccess: () => setDeletingCategory(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const openCreateForm = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const openEditForm = (category: Category) => {
        setEditingCategory(category);
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

        return params.toString()
            ? `?${params.toString()}`
            : '/product-categories';
    };

    const columns: Column<Category>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
            className: 'text-left font-medium',
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: useCallback(
                (category: Category) => (
                    <CategoryActions
                        category={category}
                        onEdit={openEditForm}
                        onDelete={setDeletingCategory}
                    />
                ),
                [],
            ),
        },
    ];

    return (
        <>
            <Head title="Categories" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Categories">
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
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSearchTerm(e.target.value);
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={categories.data}
                        meta={categories}
                        getPaginationLink={getPaginationLink}
                        emptyMessage="No categories found."
                    />
                </div>
            </div>

            <CategoryFormDialog
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

CategoryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: '/categories',
        },
    ] as BreadcrumbItem[],
};
