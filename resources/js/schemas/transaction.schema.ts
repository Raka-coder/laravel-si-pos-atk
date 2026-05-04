import { z } from 'zod';

export const transactionItemSchema = z.object({
    id: z.number().optional(),
    product_id: z.number(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price_sell: z.number().min(0, 'Price must be non-negative'),
});

export const transactionSchema = z.object({
    items: z
        .array(transactionItemSchema)
        .min(1, 'At least one item is required'),
});

export type TransactionForm = z.infer<typeof transactionSchema>;
