import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Printer } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EditTransactionDialog } from '@/features/transaction/components/EditTransactionDialog';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { BreadcrumbItem, Product, Transaction } from '@/types';

interface Props {
    [key: string]: unknown;
    transaction: Transaction;
    products: Product[];
}

export default function TransactionShow() {
    const { transaction, products } = usePage<Props>().props;
    const [isPrinting, setIsPrinting] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handlePrintDirect = () => {
        setIsPrinting(true);
        router.post(
            `/transactions/${transaction.id}/print-direct`,
            {},
            {
                onFinish: () => setIsPrinting(false),
            },
        );
    };

    return (
        <>
            <Head title={`Transaction ${transaction.receipt_number}`} />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Transaction Details">
                    {transaction.receipt_number.startsWith('SO') && (
                        <>
                            <Button
                                variant="outline"
                                size={'lg'}
                                onClick={() => setIsEditOpen(true)}
                            >
                                <Pencil className="mr-0.5 h-4 w-4" />
                                Edit Transaction
                            </Button>
                            <EditTransactionDialog
                                transaction={transaction}
                                products={products}
                                open={isEditOpen}
                                onOpenChange={setIsEditOpen}
                            />
                        </>
                    )}
                    <Button
                        variant="outline"
                        size={'lg'}
                        onClick={handlePrintDirect}
                        disabled={isPrinting}
                    >
                        <Printer className="mr-0.5 h-4 w-4" />
                        {isPrinting ? 'Printing...' : 'Print Thermal'}
                    </Button>
                </PageHeader>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Transaction Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">
                                            Price
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Qty
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Subtotal
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transaction.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.product.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(
                                                    item.price_sell,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(
                                                    item.price_sell *
                                                        item.quantity,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Receipt
                                    </span>
                                    <span className="font-medium">
                                        {transaction.receipt_number}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Date
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(transaction.created_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Cashier
                                    </span>
                                    <span className="font-medium">
                                        {transaction.user?.name}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold">
                                        {formatCurrency(
                                            transaction.total_price,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Cash
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            transaction.amount_paid,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="font-semibold">
                                        Change
                                    </span>
                                    <span className="font-bold">
                                        {formatCurrency(
                                            transaction.change_amount,
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

TransactionShow.layout = {
    breadcrumbs: [
        { title: 'Transactions', href: '/transactions' },
        { title: 'Details', href: '#' },
    ] as BreadcrumbItem[],
};
