import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type { UseFormReturn, SubmitHandler } from 'react-hook-form';
export { useForm } from 'react-hook-form';
export { zodResolver } from '@hookform/resolvers/zod';
export type { ZodType } from 'zod';

interface UseSmartMutationOptions<T> {
    mutationFn: (data: T) => Promise<unknown>;
    queryKey?: string[];
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function useSmartMutation<T>({
    mutationFn,
    queryKey,
    onSuccess,
    onError,
}: UseSmartMutationOptions<T>) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            if (queryKey) {
                queryKey.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: [key] });
                });
            }
            
            onSuccess?.();
        },
        onError: (error: Error) => {
            onError?.(error);
        },
    });
}

interface UseSmartQueryOptions<T> {
    queryKey: string[];
    queryFn: () => Promise<T>;
    enabled?: boolean;
}

export function useSmartQuery<T>({
    queryKey,
    queryFn,
    enabled = true,
}: UseSmartQueryOptions<T>) {
    return useQuery<T>({
        queryKey,
        queryFn,
        enabled,
    });
}

export function createMutationKey(...keys: string[]): string[] {
    return keys;
}
