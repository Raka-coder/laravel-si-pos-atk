import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StockMovementFormDialog } from '@/features/stock-movement/components/StockMovementFormDialog';
import { StockMovementTable } from '@/features/stock-movement/components/StockMovementTable';
import type { stockMovementSchema } from '@/lib/schemas';
import type { BreadcrumbItem, Paginated, Product, StockMovement } from '@/types';

type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

interface Props {
    [key: string]: unknown;
    movements: Paginated<StockMovement>;
    products: Product[];
    filters: {
        search: string | null;
        product_id: string | null;
        type: string | null;
        date_from: string | null;
        date_to: string | null;
    };
}

export default function StockMovementIndex() {
    const { movements, products, filters } = usePage<Props>().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    // Debounce search
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (search === (filters.search || '')) {
            return;
        }

        const params: Record<string, string> = {};

        if (search) {
            params.search = search;
        }

        if (filters.product_id) {
            params.product_id = filters.product_id;
        }

        if (filters.type) {
            params.type = filters.type;
        }

        if (filters.date_from) {
            params.date_from = filters.date_from;
        }

        if (filters.date_to) {
            params.date_to = filters.date_to;
        }

        const timer = setTimeout(() => {
            router.get('/stock-movements', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [
        search,
        filters.search,
        filters.product_id,
        filters.type,
        filters.date_from,
        filters.date_to,
    ]);

    const handleFormSubmit = (data: StockMovementFormValues) => {
        setIsProcessing(true);
        router.post('/stock-movements', data, {
            onSuccess: () => {
                setIsFormOpen(false);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (filters.product_id) {
            params.set('product_id', filters.product_id);
        }

        if (filters.type) {
            params.set('type', filters.type);
        }

        if (filters.date_from) {
            params.set('date_from', filters.date_from);
        }

        if (filters.date_to) {
            params.set('date_to', filters.date_to);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString() ? `?${params.toString()}` : '/stock-movements';
    };

    return (
        <>
            <Head title="Stock Movements" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Stock Movements">
                    <Button size="lg" onClick={() => setIsFormOpen(true)}>
                        <Plus className="mr-0.5 h-4 w-4" />
                        Add Movement
                    </Button>
                </PageHeader>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search movements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <StockMovementTable
                        movements={movements}
                        getPaginationLink={getPaginationLink}
                    />
                </div>
            </div>

            <StockMovementFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                products={products}
                onSubmit={handleFormSubmit}
                isProcessing={isProcessing}
            />
        </>
    );
}

StockMovementIndex.layout = {
    breadcrumbs: [
        {
            title: 'Stock Movements',
            href: '/stock-movements',
        },
    ] as BreadcrumbItem[],
};
