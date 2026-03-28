import { Head, usePage } from '@inertiajs/react';
import { FileText, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

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
    transaction_date: string;
    user: {
        id: number;
        name: string;
    };
    items_count: number;
}

interface Props {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
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
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TransactionIndex() {
    const { transactions } = usePage<Props>().props;

    return (
        <>
            <Head title="Transactions" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Transactions</h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari transaksi..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Receipt No
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Kasir
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">
                                        Payment
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.data.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 font-mono text-sm">
                                            {transaction.receipt_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {formatDate(
                                                transaction.transaction_date,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {transaction.user.name}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            {formatCurrency(
                                                transaction.total_price,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">
                                            <span className="capitalize">
                                                {transaction.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-medium ${
                                                    transaction.payment_status ===
                                                    'paid'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : transaction.payment_status ===
                                                            'pending'
                                                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}
                                            >
                                                {transaction.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <a
                                                        href={`/transactions/${transaction.id}`}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <a
                                                        href={`/transactions/receipt/${transaction.id}`}
                                                        target="_blank"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            Tidak ada transaksi ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {Array.from(
                                { length: transactions.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === transactions.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

TransactionIndex.layout = {
    breadcrumbs: [
        {
            title: 'Transactions',
            href: '/transactions',
        },
    ],
} satisfies BreadcrumbItem[];
