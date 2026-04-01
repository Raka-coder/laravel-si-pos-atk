import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Download } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface TransactionItem {
    id: number;
    product_name: string;
    quantity: number;
    price_sell: number;
    price_buy_snapshot: number;
    subtotal: number;
    product: {
        id: number;
        name: string;
    } | null;
}

interface Transaction {
    id: number;
    receipt_number: string;
    total_price: number;
    payment_method: string;
    payment_status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    items: TransactionItem[];
}

interface Props {
    [key: string]: unknown;
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        total: number;
    };
    summary: {
        total_revenue: number;
        total_transactions: number;
        gross_profit: number;
    };
    filters: {
        start_date: string;
        end_date: string;
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

export default function SalesReport() {
    const { transactions, summary, filters } = usePage<Props>().props;

    return (
        <>
            <Head title="Sales Report" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Sales Report</h1>
                    <a
                        href={`/reports/sales/export?start_date=${filters.start_date}&end_date=${filters.end_date}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Download className="h-4 w-4" />
                        Export Excel
                    </a>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Total Revenue
                        </div>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.total_revenue)}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Total Transactions
                        </div>
                        <div className="text-2xl font-bold">
                            {summary.total_transactions}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Gross Profit
                        </div>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.gross_profit)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm">From:</label>
                        <input
                            type="date"
                            className="rounded-md border px-3 py-2 text-sm"
                            defaultValue={filters.start_date}
                            onChange={(e) => {
                                const url = new URL(window.location.href);
                                url.searchParams.set(
                                    'start_date',
                                    e.target.value,
                                );
                                window.location.href = url.toString();
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm">To:</label>
                        <input
                            type="date"
                            className="rounded-md border px-3 py-2 text-sm"
                            defaultValue={filters.end_date}
                            onChange={(e) => {
                                const url = new URL(window.location.href);
                                url.searchParams.set(
                                    'end_date',
                                    e.target.value,
                                );
                                window.location.href = url.toString();
                            }}
                        />
                    </div>
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
                                        Receipt
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Cashier
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Payment
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">
                                        Items
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.data.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {formatDate(transaction.created_at)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">
                                            {transaction.receipt_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {transaction.user.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">
                                                {transaction.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            {formatCurrency(
                                                transaction.total_price,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm">
                                            {transaction.items.length}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from(
                            { length: transactions.last_page },
                            (_, i) => (
                                <a
                                    key={i}
                                    href={`?page=${i + 1}&start_date=${filters.start_date}&end_date=${filters.end_date}`}
                                    className={`rounded px-3 py-1 text-sm ${
                                        transactions.current_page === i + 1
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border'
                                    }`}
                                >
                                    {i + 1}
                                </a>
                            ),
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

SalesReport.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: '/reports/sales',
        },
        {
            title: 'Sales',
            href: '/reports/sales',
        },
    ] as BreadcrumbItem[],
};
