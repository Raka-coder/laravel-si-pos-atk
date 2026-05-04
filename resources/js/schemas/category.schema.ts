import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export type CategoryForm = z.infer<typeof categorySchema>;
