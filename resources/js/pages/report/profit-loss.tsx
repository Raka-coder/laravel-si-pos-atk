import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BreadcrumbItem } from '@/types';
import { ArrowDownCircle, DollarSign, TrendingUp } from 'lucide-react';

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
                    <Card className="overflow-hidden border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Gross Profit
                            </CardTitle>
                            <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-900/50">
                                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(summary.gross_profit)}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Total revenue - COGS
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Expenses
                            </CardTitle>
                            <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/50">
                                <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {formatCurrency(summary.total_expenses)}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Operational costs
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`overflow-hidden border-l-4 ${
                            summary.net_profit >= 0
                                ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/10'
                                : 'border-l-red-500 bg-red-50/30 dark:bg-red-950/10'
                        }`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Net Profit
                            </CardTitle>
                            <div
                                className={`rounded-full p-1.5 ${
                                    summary.net_profit >= 0
                                        ? 'bg-green-100 dark:bg-green-900/50'
                                        : 'bg-red-100 dark:bg-red-900/50'
                                }`}
                            >
                                <DollarSign
                                    className={`h-4 w-4 ${
                                        summary.net_profit >= 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    summary.net_profit >= 0
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-red-700 dark:text-red-300'
                                }`}
                            >
                                {formatCurrency(summary.net_profit)}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Gross Profit - Expenses
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                From:
                            </span>
                            <DropdownMenu
                                open={startOpen}
                                onOpenChange={setStartOpen}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-48 justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                            <span className="text-sm font-medium text-muted-foreground">
                                To:
                            </span>
                            <DropdownMenu
                                open={endOpen}
                                onOpenChange={setEndOpen}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-48 justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                                                applyDateFilter(
                                                    startDate,
                                                    date,
                                                );
                                            }
                                        }}
                                        initialFocus
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
