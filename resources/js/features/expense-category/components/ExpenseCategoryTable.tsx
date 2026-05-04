import { Pencil, Trash2 } from 'lucide-react';

import { DataTable } from '@/components/common/data-table';
import type { Column } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ExpenseCategory, Paginated } from '@/types';

interface ExpenseCategoryTableProps {
    categories: Paginated<ExpenseCategory>;
    onEdit: (category: ExpenseCategory) => void;
    onDelete: (category: ExpenseCategory) => void;
    getPaginationLink: (page: number) => string;
}

export function ExpenseCategoryTable({
    categories,
    onEdit,
    onDelete,
    getPaginationLink,
}: ExpenseCategoryTableProps) {
    const columns: Column<ExpenseCategory>[] = [
        {
            header: 'Name',
            accessorKey: 'name',
            className: 'text-left font-medium',
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (category) => (
                <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(category)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Kategori</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(category)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Hapus Kategori</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={categories.data}
            meta={categories}
            getPaginationLink={getPaginationLink}
            emptyMessage="No categories found."
        />
    );
}
