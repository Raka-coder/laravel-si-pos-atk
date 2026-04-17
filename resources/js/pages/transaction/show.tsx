import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Printer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
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
    product_id: z.number().min(1, 'Product is required'),
    product_name: z.string(),
    price_sell: z.number().min(0),
    quantity: z.number().min(1),
    discount_amount: z.number().min(0),
    subtotal: z.number().min(0),
});

const transactionEditSchema = z.object({
    items: z
        .array(transactionItemSchema)
        .min(1, 'At least one item is required'),
    note: z.string().optional(),
    subtotal: z.number(),
    discount_amount: z.number().min(0),
    tax_amount: z.number(),
    total_price: z.number(),
});

type TransactionEditForm = z.infer<typeof transactionEditSchema>;

interface Product {
    id: number;
    name: string;
    stock: number;
    sell_price: number;
    category: { name: string } | null;
    unit: { short_name: string } | null;
}

interface TransactionItem {
    id: number;
    product_id: number;
    product_name: string;
    price_buy_snapshot: number;
    price_sell: number;
    quantity: number;
    discount_amount: number;
    subtotal: number;
    product: {
        id: number;
        name: string;
    };
}

interface Transaction {
    id: number;
    receipt_number: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_price: number;
    payment_method: string;
    payment_status: string;
    amount_paid: number;
    change_amount: number;
    note: string | null;
    transaction_date: string;
    user: {
        id: number;
        name: string;
    };
    items: TransactionItem[];
}

interface Props {
    [key: string]: unknown;
    transaction: Transaction;
    products: Product[];
    taxRate: number;
    isOwner?: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TransactionShow() {
    const { transaction, products, taxRate } = usePage<Props>().props;
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
    } = useForm<TransactionEditForm>({
        resolver: zodResolver(transactionEditSchema),
        defaultValues: {
            items: transaction.items.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                price_sell: item.price_sell,
                quantity: item.quantity,
                discount_amount: item.discount_amount,
                subtotal: item.subtotal,
            })),
            note: transaction.note || '',
            subtotal: transaction.subtotal,
            discount_amount: transaction.discount_amount,
            tax_amount: transaction.tax_amount,
            total_price: transaction.total_price,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const formData = useWatch({ control }) as TransactionEditForm;

    const calculateTotals = useCallback(
        (items: TransactionEditForm['items'], discountAmount: number) => {
            const subtotal = (items || []).reduce((sum, item) => {
                const itemTotal =
                    (item?.price_sell || 0) * (item?.quantity || 0) -
                    (item?.discount_amount || 0);

                return sum + itemTotal;
            }, 0);

            const afterDiscount = subtotal - (discountAmount || 0);
            const taxAmount = afterDiscount * (taxRate / 100);
            const totalPrice = afterDiscount + taxAmount;

            return { subtotal, taxAmount, totalPrice };
        },
        [taxRate],
    );

    // Update totals when items or main discount changes
    useEffect(() => {
        const totals = calculateTotals(
            formData?.items || [],
            formData?.discount_amount || 0,
        );

        // Use a conditional update to prevent infinite loops if values are the same
        if (totals.subtotal !== formData?.subtotal) {
            setValue('subtotal', totals.subtotal);
        }

        if (totals.taxAmount !== formData?.tax_amount) {
            setValue('tax_amount', totals.taxAmount);
        }

        if (totals.totalPrice !== formData?.total_price) {
            setValue('total_price', totals.totalPrice);
        }
    }, [
        formData?.items,
        formData?.discount_amount,
        formData?.subtotal,
        formData?.tax_amount,
        formData?.total_price,
        setValue,
        calculateTotals,
    ]);

    const handleItemChange = (
        index: number,
        field: keyof TransactionEditForm['items'][0],
        value: string | number,
    ) => {
        if (field === 'product_id') {
            const product = products.find((p) => p.id === Number(value));

            if (product) {
                setValue(`items.${index}.product_id`, Number(value));
                setValue(`items.${index}.product_name`, product.name);
                setValue(`items.${index}.price_sell`, product.sell_price);
                setValue(`items.${index}.quantity`, 1);
                setValue(`items.${index}.discount_amount`, 0);
                setValue(`items.${index}.subtotal`, product.sell_price);
            }
        } else if (field === 'quantity') {
            const qty = Math.max(1, Number(value));
            setValue(`items.${index}.quantity`, qty);
            const item = formData?.items?.[index];

            if (item) {
                setValue(
                    `items.${index}.subtotal`,
                    (item.price_sell || 0) * qty - (item.discount_amount || 0),
                );
            }
        } else if (field === 'price_sell') {
            const price = Number(value);
            setValue(`items.${index}.price_sell`, price);
            const item = formData?.items?.[index];

            if (item) {
                setValue(
                    `items.${index}.subtotal`,
                    price * (item.quantity || 1) - (item.discount_amount || 0),
                );
            }
        } else if (field === 'discount_amount') {
            const disc = Number(value) || 0;
            setValue(`items.${index}.discount_amount`, disc);
            const item = formData?.items?.[index];

            if (item) {
                setValue(
                    `items.${index}.subtotal`,
                    (item.price_sell || 0) * (item.quantity || 1) - disc,
                );
            }
        }
    };

    const onSubmit = (data: TransactionEditForm) => {
        setIsProcessing(true);
        router.patch(`/transactions/${transaction.id}`, data, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const isEditable = transaction.payment_status === 'paid';

    return (
        <>
            <Head title={`Transaction ${transaction.receipt_number}`} />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Transaction Details
                        </h1>
                        <p className="text-muted-foreground">
                            {transaction.receipt_number}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isEditable && (
                            <Dialog
                                open={isEditOpen}
                                onOpenChange={setIsEditOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button variant={'default'} size={'lg'}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto sm:max-w-6xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Edit Transaction
                                        </DialogTitle>
                                        <DialogDescription>
                                            Ubah item, quantity, harga, atau
                                            catatan transaksi.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6 py-4">
                                        <div className="overflow-x-auto rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="text-left">
                                                            Product
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Price
                                                        </TableHead>
                                                        <TableHead className="text-center">
                                                            Qty
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Discount
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Subtotal
                                                        </TableHead>
                                                        <TableHead className="w-12"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {fields.map(
                                                        (item, index) => (
                                                            <TableRow
                                                                key={item.id}
                                                            >
                                                                <TableCell>
                                                                    <Select
                                                                        value={
                                                                            formData
                                                                                .items[
                                                                                index
                                                                            ]
                                                                                ?.product_id
                                                                                ? String(
                                                                                      formData
                                                                                          .items[
                                                                                          index
                                                                                      ]
                                                                                          .product_id,
                                                                                  )
                                                                                : ''
                                                                        }
                                                                        onValueChange={(
                                                                            value,
                                                                        ) =>
                                                                            handleItemChange(
                                                                                index,
                                                                                'product_id',
                                                                                value,
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select product..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {products.map(
                                                                                (
                                                                                    p,
                                                                                ) => (
                                                                                    <SelectItem
                                                                                        key={
                                                                                            p.id
                                                                                        }
                                                                                        value={String(
                                                                                            p.id,
                                                                                        )}
                                                                                    >
                                                                                        {
                                                                                            p.name
                                                                                        }
                                                                                    </SelectItem>
                                                                                ),
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Input
                                                                        type="number"
                                                                        className="w-24 text-right"
                                                                        {...register(
                                                                            `items.${index}.price_sell`,
                                                                            {
                                                                                valueAsNumber: true,
                                                                            },
                                                                        )}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleItemChange(
                                                                                index,
                                                                                'price_sell',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Input
                                                                        type="number"
                                                                        className="w-20 text-center"
                                                                        min="1"
                                                                        {...register(
                                                                            `items.${index}.quantity`,
                                                                            {
                                                                                valueAsNumber: true,
                                                                            },
                                                                        )}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleItemChange(
                                                                                index,
                                                                                'quantity',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Input
                                                                        type="number"
                                                                        className="w-24 text-right"
                                                                        {...register(
                                                                            `items.${index}.discount_amount`,
                                                                            {
                                                                                valueAsNumber: true,
                                                                            },
                                                                        )}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleItemChange(
                                                                                index,
                                                                                'discount_amount',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatCurrency(
                                                                        formData
                                                                            .items[
                                                                            index
                                                                        ]
                                                                            ?.subtotal ||
                                                                            0,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-500"
                                                                        onClick={() => {
                                                                            if (
                                                                                fields.length >
                                                                                1
                                                                            ) {
                                                                                remove(
                                                                                    index,
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() =>
                                                append({
                                                    product_id: 0,
                                                    product_name: '',
                                                    price_sell: 0,
                                                    quantity: 1,
                                                    discount_amount: 0,
                                                    subtotal: 0,
                                                })
                                            }
                                        >
                                            + Add Item
                                        </Button>

                                        <div className="grid gap-6 lg:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="note">
                                                    Catatan
                                                </Label>
                                                <Input
                                                    id="note"
                                                    {...register('note')}
                                                    placeholder="Catatan opsional..."
                                                />
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal:</span>
                                                    <span>
                                                        {formatCurrency(
                                                            formData.subtotal,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-sm">
                                                        Discount:
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        className="w-24 text-right"
                                                        {...register(
                                                            'discount_amount',
                                                            {
                                                                valueAsNumber: true,
                                                            },
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        Tax ({taxRate}%):
                                                    </span>
                                                    <span>
                                                        {formatCurrency(
                                                            formData.tax_amount,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                                    <span>Total:</span>
                                                    <span>
                                                        {formatCurrency(
                                                            formData.total_price,
                                                        )}
                                                    </span>
                                                </div>
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
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing
                                                ? 'Saving...'
                                                : 'Save Changes'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button variant="outline" size={'lg'} asChild>
                            <a
                                href={`/transactions/receipt/${transaction.id}`}
                                target="_blank"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Receipt
                            </a>
                        </Button>
                        <Button variant="outline" size={'lg'} asChild>
                            <a href="/transactions">Back to List</a>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Receipt Number
                                </span>
                                <span className="font-mono">
                                    {transaction.receipt_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Date
                                </span>
                                <span>
                                    {formatDate(transaction.transaction_date)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Cashier
                                </span>
                                <span>{transaction.user.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Payment Method
                                </span>
                                <span className="capitalize">
                                    {transaction.payment_method}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <span
                                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-medium ${
                                        transaction.payment_status === 'paid'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                    }`}
                                >
                                    {transaction.payment_status}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>
                                    {formatCurrency(transaction.subtotal)}
                                </span>
                            </div>
                            {transaction.discount_amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Discount
                                    </span>
                                    <span>
                                        -{' '}
                                        {formatCurrency(
                                            transaction.discount_amount,
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Tax ({taxRate}%)
                                </span>
                                <span>
                                    {formatCurrency(transaction.tax_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                <span>Total</span>
                                <span>
                                    {formatCurrency(transaction.total_price)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Amount Paid
                                </span>
                                <span>
                                    {formatCurrency(transaction.amount_paid)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Change
                                </span>
                                <span>
                                    {formatCurrency(transaction.change_amount)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-left">
                                            Product
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Price
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Qty
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Subtotal
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transaction.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {item.product_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Buy:{' '}
                                                    {formatCurrency(
                                                        item.price_buy_snapshot,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(
                                                    item.price_sell,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {transaction.note && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{transaction.note}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

TransactionShow.layout = {
    breadcrumbs: [
        {
            title: 'Transactions',
            href: '/transactions',
        },
        {
            title: 'Detail',
            href: '#',
        },
    ] as BreadcrumbItem[],
};
