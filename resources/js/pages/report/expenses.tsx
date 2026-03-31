import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
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

    return (
        <>
            <Head title="Expenses Report" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Expenses Report</h1>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <div className="text-sm text-muted-foreground">
                        Total Expenses
                    </div>
                    <div className="text-3xl font-bold">
                        {formatCurrency(summary.total_expenses)}
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
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Note
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {expenses.data.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {formatDate(expense.date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {expense.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {expense.category?.name || '-'}
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 text-sm">
                                            {expense.note || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                    </tr>
                                ))}
                                {expenses.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No expenses found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {expenses.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: expenses.last_page }, (_, i) => (
                            <a
                                key={i}
                                href={`?page=${i + 1}&start_date=${filters.start_date}&end_date=${filters.end_date}`}
                                className={`rounded px-3 py-1 text-sm ${
                                    expenses.current_page === i + 1
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border'
                                }`}
                            >
                                {i + 1}
                            </a>
                        ))}
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
