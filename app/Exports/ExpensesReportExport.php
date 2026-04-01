<?php

namespace App\Exports;

use App\Models\Expense;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExpensesReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected $startDate;

    protected $endDate;

    public function __construct(string $startDate, string $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Expense::with(['user', 'category'])
            ->whereBetween('date', [$this->startDate, $this->endDate])
            ->orderBy('date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Name',
            'Category',
            'Note',
            'Amount',
            'Created By',
        ];
    }

    public function map($expense): array
    {
        return [
            $expense->date,
            $expense->name,
            $expense->category?->name ?? '-',
            $expense->note ?? '-',
            $expense->amount,
            $expense->user->name,
        ];
    }
}
