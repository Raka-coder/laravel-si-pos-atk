import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export type StockMovementType = 'in' | 'out' | 'adjustment' | 'sale' | 'return';

export function getTypeColor(type: string): string {
    switch (type) {
        case 'in':
            return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
        case 'out':
            return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
        case 'adjustment':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        case 'sale':
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
        case 'return':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
}

export function getTypeLabel(type: string): string {
    switch (type) {
        case 'in':
            return 'Stock IN';
        case 'out':
            return 'Stock OUT';
        case 'adjustment':
            return 'Adjustment';
        case 'sale':
            return 'Penjualan';
        case 'return':
            return 'Return';
        default:
            return type;
    }
}

export function getQtyPrefix(type: string): string {
    if (type === 'out' || type === 'sale') {
        return '-';
    }

    return '+';
}

export function getQtyColorClass(type: string): string {
    if (type === 'in' || type === 'return') {
        return 'text-green-600';
    }

    if (type === 'out' || type === 'sale') {
        return 'text-red-600';
    }

    return '';
}
