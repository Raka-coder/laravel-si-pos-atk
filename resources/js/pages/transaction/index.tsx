import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { TransactionFilter } from '@/features/transaction/components/TransactionFilter';
import { TransactionPagination } from '@/features/transaction/components/TransactionPagination';
import { TransactionTable } from '@/features/transaction/components/TransactionTable';
import type { BreadcrumbItem, Paginated, Transaction } from '@/types';

interface Props {
    [key: string]: unknown;
    transactions: Paginated<Transaction>;
    filters: {
        search: string;
        payment_method: string;
    };
}

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

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setSearchTerm(value);
    };

    const handlePaymentMethodChange = (value: string) => {
        setPaymentMethod(value);
    };

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
                <PageHeader title="Transactions" />

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <TransactionFilter
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        paymentMethod={paymentMethod}
                        onPaymentMethodChange={handlePaymentMethodChange}
                    />

                    <TransactionTable transactions={transactions.data} />

                    <TransactionPagination
                        transactions={transactions}
                        getPaginationLink={getPaginationLink}
                    />
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
