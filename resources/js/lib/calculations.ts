/**
 * Calculate tax amount based on subtotal and tax rate
 */
export const calculateTax = (subtotal: number, taxRate: number): number => {
    return Math.round(subtotal * (taxRate / 100));
};

/**
 * Calculate total price including tax
 */
export const calculateTotal = (subtotal: number, taxAmount: number): number => {
    return subtotal + taxAmount;
};

/**
 * Calculate change amount
 */
export const calculateChange = (amountPaid: number, total: number): number => {
    return Math.max(0, amountPaid - total);
};

/**
 * Calculate subtotal for a list of items
 */
export const calculateSubtotal = <
    T extends { price: number; quantity: number },
>(
    items: T[],
): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
