import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TransactionFilterProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    paymentMethod: string;
    onPaymentMethodChange: (value: string) => void;
}

export function TransactionFilter({
    searchQuery,
    onSearchChange,
    paymentMethod,
    onPaymentMethodChange,
}: TransactionFilterProps) {
    return (
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                <SelectTrigger className="w-45">
                    <SelectValue placeholder="Metode Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Metode</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="midtrans">Midtrans</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
