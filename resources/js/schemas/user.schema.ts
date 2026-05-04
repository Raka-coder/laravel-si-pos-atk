import { z } from 'zod';

export const userSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .or(z.literal('')),
        password_confirmation: z.string().or(z.literal('')),
        is_active: z.boolean(),
        role: z.string().min(1, 'Role is required'),
    })
    .refine(
        (data) => {
            if (data.password && data.password !== data.password_confirmation) {
                return false;
            }

            return true;
        },
        {
            message: "Passwords don't match",
            path: ['password_confirmation'],
        },
    );

export type UserForm = z.infer<typeof userSchema>;

export const resetPasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        password_confirmation: z
            .string()
            .min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
