import { Head, useForm, usePage } from '@inertiajs/react';
import { Pencil, Printer } from 'lucide-react';
import { useState } from 'react';
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
import type { BreadcrumbItem } from '@/types';

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

    const editForm = useForm({
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
    });

    const calculateTotals = (items: typeof editForm.data.items) => {
        const subtotal = items.reduce((sum, item) => {
            const itemTotal =
                item.price_sell * item.quantity - (item.discount_amount || 0);

            return sum + itemTotal;
        }, 0);
        const discountAmount = editForm.data.discount_amount || 0;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (taxRate / 100);
        const totalPrice = afterDiscount + taxAmount;

        return { subtotal, taxAmount, totalPrice };
    };

    const handleItemChange = (
        index: number,
        field: string,
        value: string | number,
    ) => {
        const newItems = [...editForm.data.items];

        if (field === 'product_id') {
            const product = products.find((p) => p.id === Number(value));

            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: Number(value),
                    product_name: product.name,
                    price_sell: product.sell_price,
                    quantity: 1,
                    discount_amount: 0,
                    subtotal: product.sell_price,
                };
            }
        } else if (field === 'quantity') {
            const qty = Math.max(1, Number(value));
            newItems[index].quantity = qty;
            newItems[index].subtotal =
                newItems[index].price_sell * qty -
                (newItems[index].discount_amount || 0);
        } else if (field === 'price_sell') {
            newItems[index].price_sell = Number(value);
            newItems[index].subtotal =
                Number(value) * newItems[index].quantity -
                (newItems[index].discount_amount || 0);
        } else if (field === 'discount_amount') {
            const disc = Number(value) || 0;
            newItems[index].discount_amount = disc;
            newItems[index].subtotal =
                newItems[index].price_sell * newItems[index].quantity - disc;
        }

        const totals = calculateTotals(newItems);
        editForm.setData({
            ...editForm.data,
            items: newItems,
            subtotal: totals.subtotal,
            tax_amount: totals.taxAmount,
            total_price: totals.totalPrice,
        });
    };

    const handleDiscountChange = (value: string) => {
        const disc = Number(value) || 0;
        const totals = calculateTotals(editForm.data.items);
        const afterDiscount = totals.subtotal - disc;
        const taxAmount = afterDiscount * (taxRate / 100);

        editForm.setData({
            ...editForm.data,
            discount_amount: disc,
            tax_amount: taxAmount,
            total_price: afterDiscount + taxAmount,
        });
    };

    const handleAddItem = () => {
        const newItem = {
            product_id: 0,
            product_name: '',
            price_sell: 0,
            quantity: 1,
            discount_amount: 0,
            subtotal: 0,
        };
        editForm.setData('items', [...editForm.data.items, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        if (editForm.data.items.length <= 1) {
return;
}

        const newItems = editForm.data.items.filter((_, i) => i !== index);
        const totals = calculateTotals(newItems);
        editForm.setData({
            ...editForm.data,
            items: newItems,
            subtotal: totals.subtotal,
            tax_amount: totals.taxAmount,
            total_price: totals.totalPrice,
        });
    };

    const handleSubmit = () => {
        editForm.patch(`/transactions/${transaction.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
            },
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
                                    <Button>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Edit Transaction
                                        </DialogTitle>
                                        <DialogDescription>
                                            Ubah item, quantity, harga, atau
                                            catatan transaksi.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="rounded-md border">
                                            <table className="w-full">
                                                <thead className="border-b bg-muted/50">
                                                    <tr>
                                                        <th className="px-2 py-2 text-left text-xs font-medium">
                                                            Product
                                                        </th>
                                                        <th className="px-2 py-2 text-right text-xs font-medium">
                                                            Price
                                                        </th>
                                                        <th className="px-2 py-2 text-center text-xs font-medium">
                                                            Qty
                                                        </th>
                                                        <th className="px-2 py-2 text-right text-xs font-medium">
                                                            Discount
                                                        </th>
                                                        <th className="px-2 py-2 text-right text-xs font-medium">
                                                            Subtotal
                                                        </th>
                                                        <th className="w-10 px-2 py-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {editForm.data.items.map(
                                                        (item, index) => (
                                                            <tr key={index}>
                                                                <td className="px-2 py-2">
                                                                    <select
                                                                        className="w-full rounded border px-2 py-1 text-sm"
                                                                        value={
                                                                            item.product_id ||
                                                                            ''
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            handleItemChange(
                                                                                index,
                                                                                'product_id',
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    >
                                                                        <option value="">
                                                                            Select...
                                                                        </option>
                                                                        {products.map(
                                                                            (
                                                                                p,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        p.id
                                                                                    }
                                                                                    value={
                                                                                        p.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        p.name
                                                                                    }
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </select>
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <Input
                                                                        type="number"
                                                                        className="w-20 text-right text-sm"
                                                                        value={
                                                                            item.price_sell
                                                                        }
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
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <Input
                                                                        type="number"
                                                                        className="w-16 text-center text-sm"
                                                                        min="1"
                                                                        value={
                                                                            item.quantity
                                                                        }
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
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <Input
                                                                        type="number"
                                                                        className="w-20 text-right text-sm"
                                                                        value={
                                                                            item.discount_amount
                                                                        }
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
                                                                </td>
                                                                <td className="px-2 py-2 text-right text-sm font-medium">
                                                                    {formatCurrency(
                                                                        item.subtotal,
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-red-500"
                                                                        onClick={() =>
                                                                            handleRemoveItem(
                                                                                index,
                                                                            )
                                                                        }
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddItem}
                                        >
                                            + Add Item
                                        </Button>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="note">
                                                    Catatan
                                                </Label>
                                                <Input
                                                    id="note"
                                                    value={editForm.data.note}
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            'note',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Catatan opsional..."
                                                />
                                            </div>
                                            <div className="space-y-2 text-right">
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal:</span>
                                                    <span>
                                                        {formatCurrency(
                                                            editForm.data
                                                                .subtotal,
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
                                                        value={
                                                            editForm.data
                                                                .discount_amount
                                                        }
                                                        onChange={(e) =>
                                                            handleDiscountChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        Tax ({taxRate}%):
                                                    </span>
                                                    <span>
                                                        {formatCurrency(
                                                            editForm.data
                                                                .tax_amount,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                                    <span>Total:</span>
                                                    <span>
                                                        {formatCurrency(
                                                            editForm.data
                                                                .total_price,
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
                                            onClick={handleSubmit}
                                            disabled={editForm.processing}
                                        >
                                            {editForm.processing
                                                ? 'Saving...'
                                                : 'Save Changes'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button variant="outline" asChild>
                            <a
                                href={`/transactions/receipt/${transaction.id}`}
                                target="_blank"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Receipt
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
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
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-center text-sm font-medium">
                                            Qty
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-medium">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {transaction.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {item.product_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Buy:{' '}
                                                    {formatCurrency(
                                                        item.price_buy_snapshot,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatCurrency(
                                                    item.price_sell,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
