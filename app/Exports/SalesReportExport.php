<?php

namespace App\Exports;

use App\Models\Transaction;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class SalesReportExport
{
    protected string $startDate;

    protected string $endDate;

    public function __construct(string $startDate, string $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate.' 23:59:59';
    }

    public function write(Writer $writer): void
    {
        $transactions = Transaction::with(['user', 'items.product'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('payment_status', 'paid')
            ->orderBy('created_at', 'desc')
            ->get();

        $writer->addRow(Row::fromValues([
            'Date', 'Receipt Number', 'Cashier', 'Payment Method',
            'Items Count', 'Total Revenue', 'Gross Profit',
        ]));

        foreach ($transactions as $transaction) {
            $grossProfit = $transaction->items->sum(
                fn ($item) => ($item->price_sell - $item->price_buy_snapshot) * $item->quantity
            );

            $writer->addRow(Row::fromValues([
                $transaction->created_at->format('Y-m-d H:i'),
                $transaction->receipt_number,
                $transaction->user->name,
                $transaction->payment_method,
                $transaction->items->count(),
                $transaction->total_price,
                $grossProfit,
            ]));
        }
    }
}
