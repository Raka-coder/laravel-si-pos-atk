import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import type { BreadcrumbItem } from '@/types';

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
    const { movements, products } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);

    const createForm = useForm({
        product_id: '',
        movement_type: 'in',
        qty: 1,
        reason: '',
    });

    const handleCreate = () => {
        createForm.post('/stock-movements', {
            onSuccess: () => {
                createForm.reset();
                setIsOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Stock Movements" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Stock Movements</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
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
                                        value={createForm.data.product_id}
                                        onValueChange={(value) =>
                                            createForm.setData(
                                                'product_id',
                                                value,
                                            )
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
                                        message={createForm.errors.product_id}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="movement_type">
                                        Movement Type
                                    </Label>
                                    <Select
                                        value={createForm.data.movement_type}
                                        onValueChange={(value) =>
                                            createForm.setData(
                                                'movement_type',
                                                value,
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
                                        message={
                                            createForm.errors.movement_type
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qty">Quantity</Label>
                                    <Input
                                        id="qty"
                                        type="number"
                                        min="1"
                                        value={createForm.data.qty}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'qty',
                                                parseInt(e.target.value) || 1,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={createForm.errors.qty}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Input
                                        id="reason"
                                        value={createForm.data.reason}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'reason',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Alasan perubahan stok"
                                    />
                                    <InputError
                                        message={createForm.errors.reason}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    onClick={handleCreate}
                                    disabled={createForm.processing}
                                >
                                    {createForm.processing
                                        ? 'Saving...'
                                        : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Before
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        After
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Reason
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        User
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {movements.data.map((movement) => (
                                    <tr
                                        key={movement.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {formatDate(movement.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {movement.product.name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-medium ${getTypeColor(movement.movement_type)}`}
                                            >
                                                {getTypeLabel(
                                                    movement.movement_type,
                                                )}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-medium ${
                                                movement.movement_type ===
                                                    'in' ||
                                                movement.movement_type ===
                                                    'return'
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
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {movement.stock_before}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            {movement.stock_after}
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 text-sm">
                                            {movement.reason}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {movement.user.name}
                                        </td>
                                    </tr>
                                ))}
                                {movements.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No stock movements found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
    ] as BreadcrumbItem[]
};
