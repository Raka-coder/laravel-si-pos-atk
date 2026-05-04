import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    buy_price: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Buy price must be a non-negative number',
        }),
    sell_price: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Sell price must be a non-negative number',
        }),
    stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Stock must be a non-negative number',
    }),
    min_stock: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Min stock must be a non-negative number',
        }),
    category_id: z.string().min(1, 'Category is required'),
    unit_id: z.string().min(1, 'Unit is required'),
    is_active: z.boolean(),
    image: z.any().optional(),
    remove_image: z.boolean().optional(),
});

export type ProductForm = z.infer<typeof productSchema>;
