import { Head, usePage } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

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
    transaction: Transaction;
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
    const { transaction } = usePage<Props>().props;

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
                                    Tax (11%)
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
    ],
} satisfies BreadcrumbItem[];
