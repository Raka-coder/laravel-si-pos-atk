import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BreadcrumbItem } from '@/types';

interface Props {
    [key: string]: unknown;
    summary: {
        gross_profit: number;
        total_expenses: number;
        net_profit: number;
    };
    sales_by_day: { date: string; total: number }[];
    expenses_by_day: { date: string; total: number }[];
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

export default function ProfitLossReport() {
    const { summary, sales_by_day, expenses_by_day, filters } =
        usePage<Props>().props;

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
            <Head title="Profit & Loss Report" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Profit & Loss Report</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Gross Profit
                        </div>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.gross_profit)}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-6">
                        <div className="text-sm text-muted-foreground">
                            Total Expenses
                        </div>
                        <div className="text-2xl font-bold text-red-500">
                            {formatCurrency(summary.total_expenses)}
                        </div>
                    </div>
                    <div
                        className={`rounded-xl border bg-card p-6 ${
                            summary.net_profit >= 0
                                ? 'border-green-500'
                                : 'border-red-500'
                        }`}
                    >
                        <div className="text-sm text-muted-foreground">
                            Net Profit
                        </div>
                        <div
                            className={`text-2xl font-bold ${
                                summary.net_profit >= 0
                                    ? 'text-green-500'
                                    : 'text-red-500'
                            }`}
                        >
                            {formatCurrency(summary.net_profit)}
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
                    <h2 className="mb-4 text-lg font-semibold">
                        Daily Summary
                    </h2>
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Sales
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Expenses
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Net
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sales_by_day.map((sale) => {
                                    const expense = expenses_by_day.find(
                                        (e) => e.date === sale.date,
                                    );
                                    const expenseAmount = expense?.total || 0;
                                    const net = sale.total - expenseAmount;

                                    return (
                                        <tr
                                            key={sale.date}
                                            className="hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(
                                                    sale.date,
                                                ).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {formatCurrency(sale.total)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-red-500">
                                                {formatCurrency(expenseAmount)}
                                            </td>
                                            <td
                                                className={`px-4 py-3 text-right text-sm font-medium ${
                                                    net >= 0
                                                        ? 'text-green-500'
                                                        : 'text-red-500'
                                                }`}
                                            >
                                                {formatCurrency(net)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {sales_by_day.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No data found.
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

ProfitLossReport.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: '/reports/profit-loss',
        },
        {
            title: 'Profit & Loss',
            href: '/reports/profit-loss',
        },
    ] as BreadcrumbItem[],
};
