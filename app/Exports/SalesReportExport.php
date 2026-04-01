<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SalesReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected $startDate;

    protected $endDate;

    public function __construct(string $startDate, string $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate.' 23:59:59';
    }

    public function collection()
    {
        return Transaction::with(['user', 'items.product'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('payment_status', 'paid')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Receipt Number',
            'Cashier',
            'Payment Method',
            'Items Count',
            'Total Revenue',
            'Gross Profit',
        ];
    }

    public function map($transaction): array
    {
        $grossProfit = $transaction->items->sum(fn ($item) => ($item->price_sell - $item->price_buy_snapshot) * $item->quantity
        );

        return [
            $transaction->created_at->format('Y-m-d H:i'),
            $transaction->receipt_number,
            $transaction->user->name,
            $transaction->payment_method,
            $transaction->items->count(),
            $transaction->total_price,
            $grossProfit,
        ];
    }
}
