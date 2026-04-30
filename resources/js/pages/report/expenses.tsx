import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Download, CreditCard } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface ExpenseCategory {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Expense {
    id: number;
    name: string;
    amount: number;
    date: string;
    note: string | null;
    expense_category_id: number | null;
    user_id: number;
    category: ExpenseCategory | null;
    user: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    [key: string]: unknown;
    expenses: {
        data: Expense[];
        current_page: number;
        last_page: number;
        total: number;
    };
    summary: {
        total_expenses: number;
        by_category: Record<string, number>;
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
    });
};

export default function ExpensesReport() {
    const { expenses, summary, filters } = usePage<Props>().props;

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

    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.start_date) {
            params.set('start_date', filters.start_date);
        }

        if (filters.end_date) {
            params.set('end_date', filters.end_date);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString()
            ? `?${params.toString()}`
            : '/reports/expenses';
    };

    return (
        <>
            <Head title="Expenses Report" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Expenses Report</h1>
                    <Button asChild size="lg">
                        <a
                            href={`/reports/expenses/export?start_date=${filters.start_date}&end_date=${filters.end_date}`}
                            target="_blank"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </a>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Expenses
                            </CardTitle>
                            <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/50">
                                <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {formatCurrency(summary.total_expenses)}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Total expenses in selected period
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
                                        <CalendarIcon className="mr-0.5 h-4 w-4 text-muted-foreground" />
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
                                        <CalendarIcon className="mr-0.5 h-4 w-4 text-muted-foreground" />
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.data.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(expense.date)}
                                        </TableCell>
                                        <TableCell>{expense.name}</TableCell>
                                        <TableCell>
                                            {expense.category?.name || '-'}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {expense.note || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(expense.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {expenses.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No expenses found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {expenses.last_page >= 1 && (
                    <div className="mt-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={
                                            expenses.current_page > 1
                                                ? getPaginationLink(
                                                      expenses.current_page - 1,
                                                  )
                                                : undefined
                                        }
                                        className={
                                            expenses.current_page <= 1
                                                ? 'pointer-events-none opacity-50'
                                                : ''
                                        }
                                    />
                                </PaginationItem>

                                {Array.from(
                                    { length: expenses.last_page },
                                    (_, i) => i + 1,
                                )
                                    .filter(
                                        (page) =>
                                            page === 1 ||
                                            page === expenses.last_page ||
                                            Math.abs(
                                                page - expenses.current_page,
                                            ) <= 2,
                                    )
                                    .map((page, index, array) => (
                                        <PaginationItem key={page}>
                                            {index > 0 &&
                                            page - array[index - 1] > 1 ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    href={getPaginationLink(
                                                        page,
                                                    )}
                                                    isActive={
                                                        page ===
                                                        expenses.current_page
                                                    }
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href={
                                            expenses.current_page <
                                            expenses.last_page
                                                ? getPaginationLink(
                                                      expenses.current_page + 1,
                                                  )
                                                : undefined
                                        }
                                        className={
                                            expenses.current_page >=
                                            expenses.last_page
                                                ? 'pointer-events-none opacity-50'
                                                : ''
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </>
    );
}

ExpensesReport.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: '/reports/expenses',
        },
        {
            title: 'Expenses',
            href: '/reports/expenses',
        },
    ] as BreadcrumbItem[],
};
