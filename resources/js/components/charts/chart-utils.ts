import { formatCurrency as sharedFormatCurrency } from '@/lib/formatters';

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
});

export function formatCurrency(value: number): string {
    return sharedFormatCurrency(value);
}

export function formatCompactNumber(value: number): string {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1) + 'M';
    }

    if (value >= 1000) {
        return (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
    }

    return value.toString();
}

export function shortProductName(name: string, maxLength = 25): string {
    if (name.length <= maxLength) {
        return name;
    }

    return `${name.slice(0, maxLength)}...`;
}

export function formatShortDate(timestamp: number): string {
    return shortDateFormatter.format(timestamp);
}
