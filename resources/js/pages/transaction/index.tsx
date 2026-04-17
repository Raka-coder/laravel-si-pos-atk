import { Head, usePage, router, Link } from '@inertiajs/react';
import { FileText, Printer, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    [key: string]: unknown;
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
        payment_method: string;
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
    const { transactions, filters } = usePage<Props>().props;

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [paymentMethod, setPaymentMethod] = useState(
        filters.payment_method || 'all',
    );
    const isFirstRender = useRef(true);

    // Debounce search
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        // Only trigger router.get if search state is actually different from current filters in props
        // This prevents resetting to page 1 when navigating through pagination
        if (
            searchTerm === (filters.search || '') &&
            paymentMethod === (filters.payment_method || 'all')
        ) {
            return;
        }

        const params: Record<string, string> = {};

        if (searchTerm) {
            params.search = searchTerm;
        }

        if (paymentMethod && paymentMethod !== 'all') {
            params.payment_method = paymentMethod;
        }

        const timer = setTimeout(() => {
            router.get('/transactions', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, paymentMethod, filters.search, filters.payment_method]);

    const handlePaymentMethodChange = (value: string) => {
        setPaymentMethod(value);
    };

    // Get current filters for pagination - use server-side filters for consistency
    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (filters.payment_method && filters.payment_method !== 'all') {
            params.set('payment_method', filters.payment_method);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString() ? `?${params.toString()}` : '/transactions';
    };

    return (
        <>
            <Head title="Transactions" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Transactions</h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari transaksi..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSearchTerm(e.target.value);
                                }}
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={paymentMethod}
                            onValueChange={handlePaymentMethodChange}
                        >
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Metode Pembayaran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Metode
                                </SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="qris">QRIS</SelectItem>
                                <SelectItem value="midtrans">
                                    Midtrans
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-left">
                                        Receipt No
                                    </TableHead>
                                    <TableHead className="text-left">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-left">
                                        User
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Payment
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-mono">
                                            {transaction.receipt_number}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(
                                                transaction.transaction_date,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.user.name}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(
                                                transaction.total_price,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center capitalize">
                                            {transaction.payment_method}
                                        </TableCell>
                                        <TableCell className="text-center">
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
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="lg"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/transactions/${transaction.id}`}
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Detail Transaksi
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="lg"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={`/transactions/receipt/${transaction.id}`}
                                                                    target="_blank"
                                                                >
                                                                    <Printer className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Cetak Struk</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {transactions.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Tidak ada transaksi ditemukan
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {transactions.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                transactions.current_page > 1
                                                    ? getPaginationLink(
                                                          transactions.current_page -
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                transactions.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: transactions.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page ===
                                                    transactions.last_page ||
                                                Math.abs(
                                                    page -
                                                        transactions.current_page,
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
                                                            transactions.current_page
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
                                                transactions.current_page <
                                                transactions.last_page
                                                    ? getPaginationLink(
                                                          transactions.current_page +
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                transactions.current_page >=
                                                transactions.last_page
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
    ] as BreadcrumbItem[],
};
