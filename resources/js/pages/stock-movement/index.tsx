import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

const stockMovementSchema = z.object({
    product_id: z.string().min(1, 'Product is required'),
    movement_type: z.enum(['in', 'out', 'adjustment']),
    qty: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
        message: 'Quantity must be at least 1',
    }),
    reason: z.string().min(1, 'Reason is required'),
});

type StockMovementForm = z.infer<typeof stockMovementSchema>;

interface Product {
    id: number;
    name: string;
    stock: number;
}

interface User {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    receipt_number: string;
}

interface StockMovement {
    id: number;
    movement_type: string;
    qty: number;
    stock_before: number;
    stock_after: number;
    reason: string;
    created_at: string;
    product: Product;
    user: User;
    transaction: Transaction | null;
}

interface Props {
    [key: string]: unknown;
    movements: {
        data: StockMovement[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    products: Product[];
    filters: {
        product_id: string | null;
        type: string | null;
        date_from: string | null;
        date_to: string | null;
    };
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'in':
            return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
        case 'out':
            return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        case 'adjustment':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        case 'sale':
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
        case 'return':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'in':
            return 'Stock IN';
        case 'out':
            return 'Stock OUT';
        case 'adjustment':
            return 'Adjustment';
        case 'sale':
            return 'Penjualan';
        case 'return':
            return 'Return';
        default:
            return type;
    }
};

export default function StockMovementIndex() {
    const { movements, products, filters } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors },
    } = useForm<StockMovementForm>({
        resolver: zodResolver(stockMovementSchema),
        defaultValues: {
            product_id: '',
            movement_type: 'in',
            qty: '1',
            reason: '',
        },
    });

    const formData = useWatch({ control });

    const onSubmit = (data: StockMovementForm) => {
        setIsProcessing(true);
        router.post('/stock-movements', data, {
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

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
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Stock Movements</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <Plus className="mr-0.5 h-4 w-4" />
                                Add Movement
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Stock Movement</DialogTitle>
                                <DialogDescription>
                                    Tambah pergerakan stok produk secara manual.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="product_id">Product</Label>
                                    <Select
                                        value={formData.product_id}
                                        onValueChange={(value) =>
                                            setValue('product_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem
                                                    key={product.id}
                                                    value={String(product.id)}
                                                >
                                                    {product.name} (Stok:{' '}
                                                    {product.stock})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.product_id?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="movement_type">
                                        Movement Type
                                    </Label>
                                    <Select
                                        value={formData.movement_type}
                                        onValueChange={(value) =>
                                            setValue(
                                                'movement_type',
                                                value as any,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="in">
                                                Stock IN (Tambah)
                                            </SelectItem>
                                            <SelectItem value="out">
                                                Stock OUT (Kurangi)
                                            </SelectItem>
                                            <SelectItem value="adjustment">
                                                Adjustment (Koreksi)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.movement_type?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qty">Quantity</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min="1"
                                        {...register('qty')}
                                    />
                                    <InputError message={errors.qty?.message} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Input
                                        id="reason"
                                        {...register('reason')}
                                        placeholder="Alasan perubahan stok"
                                    />
                                    <InputError
                                        message={errors.reason?.message}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" size="lg">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    size="lg"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        'Saving...'
                                    ) : (
                                        <>
                                            <Save className="mr-0.5 h-4 w-4" />
                                            Save
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">
                                    Type
                                </TableHead>
                                <TableHead className="text-right">
                                    Qty
                                </TableHead>
                                <TableHead className="text-right">
                                    Before
                                </TableHead>
                                <TableHead className="text-right">
                                    After
                                </TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>User</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movements.data.map((movement, index) => (
                                <TableRow key={movement.id}>
                                    <TableCell>
                                        {(movements.current_page - 1) *
                                            movements.per_page +
                                            index +
                                            1}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(movement.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {movement.product.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-medium ${getTypeColor(movement.movement_type)}`}
                                        >
                                            {getTypeLabel(
                                                movement.movement_type,
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={`text-right font-medium ${
                                            movement.movement_type === 'in' ||
                                            movement.movement_type === 'return'
                                                ? 'text-green-600'
                                                : movement.movement_type ===
                                                        'out' ||
                                                    movement.movement_type ===
                                                        'sale'
                                                  ? 'text-red-600'
                                                  : ''
                                        }`}
                                    >
                                        {movement.movement_type === 'out' ||
                                        movement.movement_type === 'sale'
                                            ? '-'
                                            : '+'}
                                        {movement.qty}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {movement.stock_before}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {movement.stock_after}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {movement.reason}
                                    </TableCell>
                                    <TableCell>{movement.user.name}</TableCell>
                                </TableRow>
                            ))}
                            {movements.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No stock movements found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {movements.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                movements.current_page > 1
                                                    ? getPaginationLink(
                                                          movements.current_page -
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                movements.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: movements.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === movements.last_page ||
                                                Math.abs(
                                                    page -
                                                        movements.current_page,
                                                ) <= 2,
                                        )
                                        .map((page, index, array) => (
                                            <PaginationItem key={page}>
                                                {index > 0 &&
                                                page - array[index - 1] > 1 ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href={getPaginationLink(
                                                            page,
                                                        )}
                                                        isActive={
                                                            page ===
                                                            movements.current_page
                                                        }
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                movements.current_page <
                                                movements.last_page
                                                    ? getPaginationLink(
                                                          movements.current_page +
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                movements.current_page >=
                                                movements.last_page
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>
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
