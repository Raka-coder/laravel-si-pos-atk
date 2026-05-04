import { DataTable } from '@/components/common/data-table';
import type { Column } from '@/components/common/data-table';
import { formatDate } from '@/lib/formatters';
import { getQtyColorClass, getQtyPrefix, getTypeColor, getTypeLabel } from '@/lib/utils';
import type { Paginated, StockMovement } from '@/types';

interface StockMovementTableProps {
    movements: Paginated<StockMovement>;
    getPaginationLink: (page: number) => string;
}

export function StockMovementTable({
    movements,
    getPaginationLink,
}: StockMovementTableProps) {
    const columns: Column<StockMovement>[] = [
        {
            header: 'No',
            cell: (_, index) =>
                (movements.current_page - 1) * movements.per_page + index + 1,
        },
        {
            header: 'Date',
            cell: (movement) => (
                <span className="whitespace-nowrap">
                    {formatDate(movement.created_at)}
                </span>
            ),
        },
        {
            header: 'Product',
            cell: (movement) => movement.product.name,
        },
        {
            header: 'Type',
            className: 'text-center',
            cell: (movement) => (
                <span
                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-medium ${getTypeColor(movement.movement_type)}`}
                >
                    {getTypeLabel(movement.movement_type)}
                </span>
            ),
        },
        {
            header: 'Qty',
            className: 'text-right',
            cell: (movement) => (
                <span
                    className={`font-medium ${getQtyColorClass(movement.movement_type)}`}
                >
                    {getQtyPrefix(movement.movement_type)}
                    {movement.qty}
                </span>
            ),
        },
        {
            header: 'Before',
            className: 'text-right',
            accessorKey: 'stock_before' as any,
        },
        {
            header: 'After',
            className: 'text-right',
            cell: (movement) => (
                <span className="font-medium">{movement.stock_after}</span>
            ),
        },
        {
            header: 'Reason',
            cell: (movement) => (
                <div className="max-w-xs truncate" title={movement.reason}>
                    {movement.reason}
                </div>
            ),
        },
        {
            header: 'User',
            cell: (movement) => movement.user.name,
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={movements.data}
            meta={movements}
            getPaginationLink={getPaginationLink}
            emptyMessage="No stock movements found"
        />
    );
}
