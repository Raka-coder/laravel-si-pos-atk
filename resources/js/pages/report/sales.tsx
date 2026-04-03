import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Download } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

    const [startDate, setStartDate] = React.useState<Date | undefined>(
        filters.start_date ? new Date(filters.start_date) : undefined,
    );
    const [endDate, setEndDate] = React.useState<Date | undefined>(
        filters.end_date ? new Date(filters.end_date) : undefined,
    );
    const [startOpen, setStartOpen] = React.useState(false);
    const [endOpen, setEndOpen] = React.useState(false);

    const applyDateFilter = (start?: Date, end?: Date) => {
        const url = new URL(window.location.href);

        if (start) {
            url.searchParams.set('start_date', format(start, 'yyyy-MM-dd'));
        }

        if (end) {
            url.searchParams.set('end_date', format(end, 'yyyy-MM-dd'));
        }

        window.location.href = url.toString();
    };

    return (
        <>
            <Head title="Sales Report" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Sales Report</h1>
                    <Button asChild size="lg" variant={'default'}>
                        <a
                            href={`/reports/sales/export?start_date=${filters.start_date}&end_date=${filters.end_date}`}
                            target="_blank"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </a>
                    </Button>
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
                        <DropdownMenu
                            open={startOpen}
                            onOpenChange={setStartOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-45 justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? (
                                        format(startDate, 'PPP')
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date);
                                        setStartOpen(false);

                                        if (date) {
applyDateFilter(date, endDate);
}
                                    }}
                                    initialFocus
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm">To:</label>
                        <DropdownMenu open={endOpen} onOpenChange={setEndOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-45 justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? (
                                        format(endDate, 'PPP')
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        setEndDate(date);
                                        setEndOpen(false);

                                        if (date) {
                                            applyDateFilter(startDate, date);
                                        }
                                    }}
                                    initialFocus
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Receipt</TableHead>
                                <TableHead>Cashier</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead className="text-center">
                                    Items
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(transaction.created_at)}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        {transaction.receipt_number}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.user.name}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">
                                            {transaction.payment_method}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(
                                            transaction.total_price,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {transaction.items.length}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
