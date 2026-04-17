import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

const resetPasswordSchema = z
    .object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        password_confirmation: z
            .string()
            .min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: email,
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = (data: ResetPasswordForm) => {
        setIsProcessing(true);
        router.post(
            update.url(),
            {
                ...data,
                token,
            },
            {
                onSuccess: () => reset(),
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title="Reset password" />

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            autoComplete="email"
                            className="mt-1 block w-full"
                            readOnly
                        />
                        <InputError
                            message={errors.email?.message}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            {...register('password')}
                            autoComplete="new-password"
                            className="mt-1 block w-full"
                            autoFocus
                            placeholder="Password"
                        />
                        <InputError message={errors.password?.message} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm password
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            {...register('password_confirmation')}
                            autoComplete="new-password"
                            className="mt-1 block w-full"
                            placeholder="Confirm password"
                        />
                        <InputError
                            message={errors.password_confirmation?.message}
                            className="mt-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={isProcessing}
                        data-test="reset-password-button"
                    >
                        {isProcessing && <Spinner />}
                        Reset password
                    </Button>
                </div>
            </form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};
