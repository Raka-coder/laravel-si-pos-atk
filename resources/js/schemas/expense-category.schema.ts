import { z } from 'zod';

export const expenseCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export type ExpenseCategoryForm = z.infer<typeof expenseCategorySchema>;
