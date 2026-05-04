import { Link } from '@inertiajs/react';
import { FileText, Printer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Transaction } from '@/types/models';

interface TransactionTableProps {
    transactions: Transaction[];
}

const statusVariant: Record<
    string,
    'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning'
> = {
    paid: 'success',
    pending: 'warning',
    failed: 'destructive',
    cancelled: 'destructive',
};

export function TransactionTable({ transactions }: TransactionTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left">Receipt No</TableHead>
                        <TableHead className="text-left">Date</TableHead>
                        <TableHead className="text-left">User</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Payment</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="font-mono">
                                    {transaction.receipt_number}
                                </TableCell>
                                <TableCell>
                                    {formatDate(transaction.transaction_date)}
                                </TableCell>
                                <TableCell>{transaction.user?.name}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(transaction.total_price)}
                                </TableCell>
                                <TableCell className="text-center capitalize">
                                    {transaction.payment_method}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant={
                                            (transaction.payment_status &&
                                                statusVariant[
                                                    transaction.payment_status
                                                ]) ||
                                            'default'
                                        }
                                        className="capitalize"
                                    >
                                        {transaction.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
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
                                                    <p>Detail Transaksi</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <a
                                                            href={`/transactions/receipt/${transaction.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
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
                        ))
                    ) : (
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
    );
}
