import { z } from 'zod';

export const unitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    short_name: z.string().min(1, 'Short name is required'),
});

export type UnitForm = z.infer<typeof unitSchema>;
