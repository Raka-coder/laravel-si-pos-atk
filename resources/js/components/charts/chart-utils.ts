const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
});

export function formatCurrency(value: number): string {
    return currencyFormatter.format(value);
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
