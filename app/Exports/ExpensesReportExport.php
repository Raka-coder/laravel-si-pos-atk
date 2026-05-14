<?php

namespace App\Exports;

use App\Models\Expense;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class ExpensesReportExport
{
    protected string $startDate;

    protected string $endDate;

    public function __construct(string $startDate, string $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function write(Writer $writer): void
    {
        $expenses = Expense::with(['user', 'category'])
            ->whereBetween('date', [$this->startDate, $this->endDate])
            ->orderBy('date', 'desc')
            ->get();

        $writer->addRow(Row::fromValues([
            'Date', 'Name', 'Category', 'Note', 'Amount', 'Created By',
        ]));

        foreach ($expenses as $expense) {
            $writer->addRow(Row::fromValues([
                $expense->date,
                $expense->name,
                $expense->category?->name ?? '-',
                $expense->note ?? '-',
                $expense->amount,
                $expense->user->name,
            ]));
        }
    }
}
