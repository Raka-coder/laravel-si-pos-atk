import { z } from 'zod';

export const posPaymentSchema = z.object({
    payment_method: z.enum(['cash', 'qris', 'midtrans']),
    amount_paid: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Amount paid must be a positive number',
        }),
    note: z.string().optional(),
});

export type PosPaymentForm = z.infer<typeof posPaymentSchema>;
