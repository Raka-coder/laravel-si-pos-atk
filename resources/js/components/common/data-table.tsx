import type { ReactNode } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataPagination } from './data-pagination';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    className?: string;
    cell?: (row: T, index: number) => ReactNode;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total?: number;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    meta?: PaginationMeta;
    getPaginationLink?: (page: number) => string;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
    columns,
    data,
    meta,
    getPaginationLink,
    emptyMessage = 'No data found.',
    onRowClick,
}: DataTableProps<T>) {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className={column.className}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => onRowClick?.(row)}
                                    className={
                                        onRowClick ? 'cursor-pointer' : ''
                                    }
                                >
                                    {columns.map((column, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            className={column.className}
                                        >
                                            {column.cell
                                                ? column.cell(row, rowIndex)
                                                : column.accessorKey
                                                  ? (row[
                                                        column.accessorKey
                                                    ] as ReactNode)
                                                  : null}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {meta && getPaginationLink && (
                <DataPagination
                    meta={meta}
                    getPaginationLink={getPaginationLink}
                />
            )}
        </div>
    );
}
