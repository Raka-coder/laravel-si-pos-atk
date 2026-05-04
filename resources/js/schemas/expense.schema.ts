import { z } from 'zod';

export const expenseSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    date: z.string().min(1, 'Date is required'),
    note: z.string().optional(),
    expense_category_id: z.string().min(1, 'Category is required'),
});

export type ExpenseForm = z.infer<typeof expenseSchema>;
