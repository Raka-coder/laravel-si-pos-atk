import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useRHF } from 'react-hook-form';
import type { UseFormProps } from 'react-hook-form';
import { toast } from 'sonner';
import type { ZodType } from 'zod';

export function useForm<T extends Record<string, any>>(
    schema: ZodType<T>,
    options?: UseFormProps<T>,
) {
    return useRHF<T>({
        resolver: zodResolver(schema as any) as any,
        ...options,
    });
}

export async function submitForm<T extends Record<string, any>>(
    form: ReturnType<typeof useRHF<T>>['handleSubmit'],
    onSuccess: (data: T) => Promise<void>,
    onError?: (error: Error) => void,
) {
    return form(
        async (data) => {
            try {
                await onSuccess(data);
            } catch (error) {
                const err = error as Error;
                onError?.(err);
                toast.error(err.message || 'Terjadi kesalahan');
            }
        },
        (errors) => {
            console.error('Validation errors:', errors);
        },
    );
}

export function showError(message: string) {
    toast.error(message);
}

export function showSuccess(message: string) {
    toast.success(message);
}
