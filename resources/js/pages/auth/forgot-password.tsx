import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword({ status }: { status?: string }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = (data: ForgotPasswordForm) => {
        setIsProcessing(true);
        router.post(email.url(), data, {
            onFinish: () => setIsProcessing(false),
        });
    };

    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex justify-center">
                    <img src="/logo.svg" alt="POS Logo" className="h-10 w-10" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            autoComplete="off"
                            autoFocus
                            placeholder="email@example.com"
                        />

                        <InputError message={errors.email?.message} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button
                            className="w-full"
                            disabled={isProcessing}
                            data-test="email-password-reset-link-button"
                        >
                            {isProcessing && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            Email password reset link
                        </Button>
                    </div>
                </form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
