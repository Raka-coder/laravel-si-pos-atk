import { Head, usePage, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

import { ConfirmAlert } from '@/components/common/confirm-alert';
import { DataTable } from '@/components/common/data-table';
import type { Column } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UnitActions } from '@/features/unit/components/UnitActions';
import { UnitFormDialog } from '@/features/unit/components/UnitFormDialog';
import type { UnitForm } from '@/schemas/unit.schema';
import type { BreadcrumbItem, Paginated, Unit } from '@/types';

interface Props {
    [key: string]: unknown;
    units: Paginated<Unit>;
    filters: {
        search: string;
    };
}

export default function UnitIndex() {
    const { units, filters } = usePage<Props>().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    const [isProcessing, setIsProcessing] = useState(false);

    // Debounce search
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
                '/units',
                { search: searchTerm },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filters.search]);

    const handleFormSubmit = (data: UnitForm) => {
        setIsProcessing(true);

        if (editingUnit) {
            router.put(`/units/${editingUnit.id}`, data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    setEditingUnit(null);
                },
                onFinish: () => setIsProcessing(false),
            });
        } else {
            router.post('/units', data, {
                onSuccess: () => setIsFormOpen(false),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deletingUnit) {
            return;
        }

        setIsProcessing(true);
        router.delete(`/units/${deletingUnit.id}`, {
            onSuccess: () => setDeletingUnit(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const openCreateForm = () => {
        setEditingUnit(null);
        setIsFormOpen(true);
    };

    const openEditForm = (unit: Unit) => {
        setEditingUnit(unit);
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

        return params.toString() ? `?${params.toString()}` : '/units';
    };

    const columns: Column<Unit>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
            className: 'text-left font-medium',
        },
        {
            header: 'Short Name',
            accessorKey: 'short_name',
            className: 'text-left',
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: useCallback(
                (unit: Unit) => (
                    <UnitActions
                        unit={unit}
                        onEdit={openEditForm}
                        onDelete={setDeletingUnit}
                    />
                ),
                [],
            ),
        },
    ];

    return (
        <>
            <Head title="Units" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Units">
                    <Button size="lg" onClick={openCreateForm}>
                        <Plus className="mr-0.5 h-4 w-4" />
                        Add Unit
                    </Button>
                </PageHeader>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search units..."
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
                        data={units.data}
                        meta={units}
                        getPaginationLink={getPaginationLink}
                        emptyMessage="No units found."
                    />
                </div>
            </div>

            <UnitFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                unit={editingUnit}
                onSubmit={handleFormSubmit}
                isProcessing={isProcessing}
            />

            <ConfirmAlert
                open={!!deletingUnit}
                onOpenChange={(open) => !open && setDeletingUnit(null)}
                title="Delete Unit"
                description={`Are you sure you want to delete "${deletingUnit?.name}"? This action cannot be undone.`}
                confirmText={isProcessing ? 'Deleting...' : 'Delete'}
                onConfirm={handleDelete}
                variant="destructive"
            />
        </>
    );
}

UnitIndex.layout = {
    breadcrumbs: [
        {
            title: 'Units',
            href: '/units',
        },
    ] as BreadcrumbItem[],
};
