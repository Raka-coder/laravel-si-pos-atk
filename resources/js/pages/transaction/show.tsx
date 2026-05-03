import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

const transactionItemSchema = z.object({
    id: z.number().optional(),
    product_id: z.number(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price_sell: z.number().min(0, 'Price must be non-negative'),
});

const transactionSchema = z.object({
    items: z.array(transactionItemSchema).min(1, 'At least one item is required'),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface Product {
    id: number;
    name: string;
    sell_price: number;
    stock: number;
}

interface TransactionItem {
    id: number;
    product_id: number;
    quantity: number;
    price_sell: number;
    product: Product;
}

interface Transaction {
    id: number;
    receipt_number: string;
    total_price: number;
    amount_paid: number;
    change_amount: number;
    created_at: string;
    user: {
        name: string;
    };
    items: TransactionItem[];
}

interface Props {
    [key: string]: unknown;
    transaction: Transaction;
    products: Product[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TransactionShow() {
    const { transaction, products } = usePage<Props>().props;
    const [isPrinting, setIsPrinting] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { control, handleSubmit } = useForm<TransactionForm>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            items: transaction.items.map((item) => ({
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_sell: item.price_sell,
            })),
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items',
    });

    const watchItems = useWatch({
        control,
        name: 'items',
    });

    const totalAmount = watchItems.reduce(
        (acc, item) => acc + (item.price_sell || 0) * (item.quantity || 0),
        0,
    );

    const handlePrintDirect = () => {
        setIsPrinting(true);
        router.post(
            `/transactions/${transaction.id}/print-direct`,
            {},
            {
                onFinish: () => setIsPrinting(false),
            },
        );
    };

    const onEditSubmit = (data: TransactionForm) => {
        setIsProcessing(true);
        router.patch(`/transactions/${transaction.id}`, data, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    return (
        <>
            <Head title={`Transaction ${transaction.receipt_number}`} />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Transaction Details</h1>
                    <div className="flex gap-2">
                        {transaction.receipt_number.startsWith('SO') && (
                            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size={'lg'}>
                                        <Pencil className="mr-0.5 h-4 w-4" />
                                        Edit Transaction
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Edit Transaction</DialogTitle>
                                        <DialogDescription>
                                            Modify transaction items for{' '}
                                            {transaction.receipt_number}.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead className="w-37.5">
                                                            Price
                                                        </TableHead>
                                                        <TableHead className="w-25">
                                                            Qty
                                                        </TableHead>
                                                        <TableHead className="w-37.5 text-right">
                                                            Subtotal
                                                        </TableHead>
                                                        <TableHead className="w-25"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map((field, index) => (
                                                        <TableRow key={field.id}>
                                                            <TableCell>
                                                                <Select
                                                                    value={String(
                                                                        watchItems[index]
                                                                            ?.product_id,
                                                                    )}
                                                                    onValueChange={(
                                                                        value,
                                                                    ) => {
                                                                        const product =
                                                                            products.find(
                                                                                (
                                                                                    p,
                                                                                ) =>
                                                                                    p.id ===
                                                                                    Number(
                                                                                        value,
                                                                                    ),
                                                                            );

                                                                        if (product) {
                                                                            update(
                                                                                index,
                                                                                {
                                                                                    ...watchItems[
                                                                                        index
                                                                                    ],
                                                                                    product_id:
                                                                                        product.id,
                                                                                    price_sell:
                                                                                        product.sell_price,
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {products.map(
                                                                            (
                                                                                product,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        product.id
                                                                                    }
                                                                                    value={String(
                                                                                        product.id,
                                                                                    )}
                                                                                >
                                                                                    {
                                                                                        product.name
                                                                                    }{' '}
                                                                                    ({
                                                                                        product.stock
                                                                                    })
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        watchItems[
                                                                            index
                                                                        ]?.price_sell
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        update(
                                                                            index,
                                                                            {
                                                                                ...watchItems[
                                                                                    index
                                                                                ],
                                                                                price_sell:
                                                                                    Number(
                                                                                        e.target.value,
                                                                                    ),
                                                                            },
                                                                        );
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        watchItems[
                                                                            index
                                                                        ]?.quantity
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        update(
                                                                            index,
                                                                            {
                                                                                ...watchItems[
                                                                                    index
                                                                                ],
                                                                                quantity:
                                                                                    Number(
                                                                                        e.target.value,
                                                                                    ),
                                                                            },
                                                                        );
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(
                                                                    (watchItems[
                                                                        index
                                                                    ]?.price_sell ||
                                                                        0) *
                                                                        (watchItems[
                                                                            index
                                                                        ]?.quantity ||
                                                                            0),
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        remove(
                                                                            index,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        fields.length ===
                                                                        1
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    append({
                                                        product_id:
                                                            products[0]?.id,
                                                        quantity: 1,
                                                        price_sell:
                                                            products[0]
                                                                ?.sell_price,
                                                    })
                                                }
                                            >
                                                <Plus className="mr-0.5 h-4 w-4" />
                                                Add Item
                                            </Button>

                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">
                                                    Total Amount
                                                </p>
                                                <p className="text-xl font-bold">
                                                    {formatCurrency(totalAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSubmit(onEditSubmit)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                'Saving...'
                                            ) : (
                                                <>
                                                    <Check className="mr-0.5 h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button
                            variant="outline"
                            size={'lg'}
                            onClick={handlePrintDirect}
                            disabled={isPrinting}
                        >
                            <Printer className="mr-0.5 h-4 w-4" />
                            {isPrinting ? 'Printing...' : 'Print Thermal'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Transaction Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transaction.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.product.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.price_sell)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.price_sell * item.quantity)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Receipt</span>
                                    <span className="font-medium">{transaction.receipt_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium">{formatDate(transaction.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cashier</span>
                                    <span className="font-medium">{transaction.user.name}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold">{formatCurrency(transaction.total_price)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cash</span>
                                    <span className="font-medium">{formatCurrency(transaction.amount_paid)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="font-semibold">Change</span>
                                    <span className="font-bold">{formatCurrency(transaction.change_amount)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

TransactionShow.layout = {
    breadcrumbs: [
        { title: 'Transactions', href: '/transactions' },
        { title: 'Details', href: '#' },
    ] as BreadcrumbItem[],
};


TransactionShow.layout = {
    breadcrumbs: [
        { title: 'Transactions', href: '/transactions' },
        { title: 'Details', href: '#' },
    ] as BreadcrumbItem[],
};