import { Head, usePage, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

import { ConfirmAlert } from '@/components/common/confirm-alert';
import { DataTable } from '@/components/common/data-table';
import type { Column } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { ProductDetailDialog } from '@/components/product-detail-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductActions } from '@/features/product/components/ProductActions';
import { ProductFormDialog } from '@/features/product/components/ProductFormDialog';
import { ProductImageCell } from '@/features/product/components/ProductImageCell';
import { ProductStatusCell } from '@/features/product/components/ProductStatusCell';
import { formatCurrency } from '@/lib/formatters';
import type { ProductForm } from '@/schemas/product.schema';
import type {
    BreadcrumbItem,
    Category,
    Paginated,
    Product,
    Unit,
} from '@/types';

interface Props {
    [key: string]: unknown;
    products: Paginated<Product>;
    categories: Category[];
    units: Unit[];
    filters: {
        search: string;
    };
}

export default function ProductIndex() {
    const { products, categories, units, filters } = usePage<Props>().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(
        null,
    );
    const [showingProduct, setShowingProduct] = useState<Product | null>(null);
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
                '/products',
                { search: searchTerm },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filters.search]);

    const handleFormSubmit = (data: ProductForm, productId?: number) => {
        setIsProcessing(true);

        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            const dataKey = key as keyof ProductForm;

            if (data[dataKey] !== null && data[dataKey] !== undefined) {
                if (dataKey === 'image' && data.image instanceof File) {
                    formData.append('image', data.image);
                } else {
                    formData.append(dataKey, String(data[dataKey]));
                }
            }
        });

        if (productId) {
            formData.append('_method', 'PUT');
            router.post(`/products/${productId}`, formData as any, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    setEditingProduct(null);
                },
                onFinish: () => setIsProcessing(false),
            });
        } else {
            router.post('/products', formData as any, {
                onSuccess: () => setIsFormOpen(false),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deletingProduct) {
            return;
        }

        setIsProcessing(true);
        router.delete(`/products/${deletingProduct.id}`, {
            onSuccess: () => setDeletingProduct(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const openCreateForm = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const openEditForm = (product: Product) => {
        setEditingProduct(product);
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

        return params.toString() ? `?${params.toString()}` : '/products';
    };

    const columns: Column<Product>[] = [
        {
            header: 'Image',
            className: 'w-16',
            cell: useCallback(
                (product: Product) => <ProductImageCell product={product} />,
                [],
            ),
        },
        {
            header: 'Product Code',
            accessorKey: 'product_code',
            className: 'font-mono text-sm',
        },
        {
            header: 'Name',
            accessorKey: 'name',
            className: 'text-sm font-medium',
        },
        {
            header: 'Category',
            className: 'text-sm',
            cell: (product) => product.category?.name || '-',
        },
        {
            header: 'Unit',
            className: 'text-sm',
            cell: (product) => product.unit?.short_name || '-',
        },
        {
            header: 'Buy',
            className: 'text-right text-sm',
            cell: (product) => formatCurrency(product.buy_price),
        },
        {
            header: 'Sell',
            className: 'text-right text-sm',
            cell: (product) => formatCurrency(product.sell_price),
        },
        {
            header: 'Stock',
            className: 'text-right text-sm',
            cell: (product) => (
                <span
                    className={
                        product.stock < product.min_stock
                            ? 'font-medium text-red-500'
                            : ''
                    }
                >
                    {product.stock}
                </span>
            ),
        },
        {
            header: 'Status',
            className: 'text-center',
            cell: useCallback(
                (product: Product) => <ProductStatusCell product={product} />,
                [],
            ),
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: useCallback(
                (product: Product) => (
                    <ProductActions
                        product={product}
                        onEdit={openEditForm}
                        onDelete={setDeletingProduct}
                    />
                ),
                [],
            ),
        },
    ];

    return (
        <>
            <Head title="Products" />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Products">
                    <Button size="lg" onClick={openCreateForm}>
                        <Plus className="mr-0.5 h-4 w-4" />
                        Add Product
                    </Button>
                </PageHeader>
                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
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
                        data={products.data}
                        meta={products}
                        getPaginationLink={getPaginationLink}
                        emptyMessage="No products found. Create one to get started."
                        onRowClick={setShowingProduct}
                    />
                </div>
            </div>
            <ProductFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                product={editingProduct}
                onSubmit={handleFormSubmit}
                isProcessing={isProcessing}
                categories={categories}
                units={units}
            />
            <ConfirmAlert
                open={!!deletingProduct}
                onOpenChange={(open) => !open && setDeletingProduct(null)}
                title="Delete Product"
                description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
                confirmText={isProcessing ? 'Deleting...' : 'Delete'}
                onConfirm={handleDelete}
                variant="destructive"
            />
            <ProductDetailDialog
                product={showingProduct}
                open={!!showingProduct}
                onOpenChange={(open) => !open && setShowingProduct(null)}
            />
        </>
    );
}

ProductIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
    ] as BreadcrumbItem[],
};
