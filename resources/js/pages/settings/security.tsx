import { Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

const securitySchema = z
    .object({
        current_password: z.string().min(1, 'Current password is required'),
        password: z
            .string()
            .min(8, 'New password must be at least 8 characters'),
        password_confirmation: z
            .string()
            .min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ['password_confirmation'],
    });

type SecurityForm = z.infer<typeof securitySchema>;

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors: twoFactorErrors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<SecurityForm>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = useCallback(
        (data: SecurityForm) => {
            setIsProcessing(true);
            router.put(SecurityController.update.url(), data, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setRecentlySuccessful(true);
                    setTimeout(() => setRecentlySuccessful(false), 2000);
                },
                onError: (errs) => {
                    if (errs.password) {
                        setError(
                            'password',
                            { message: errs.password },
                            { shouldFocus: true },
                        );
                    }

                    if (errs.current_password) {
                        setError(
                            'current_password',
                            {
                                message: errs.current_password,
                            },
                            { shouldFocus: true },
                        );
                    }
                },
                onFinish: () => setIsProcessing(false),
            });
        },
        [reset, setError],
    );

    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                />

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(onSubmit)(e);
                    }}
                    className="space-y-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">
                            Current password
                        </Label>

                        <PasswordInput
                            id="current_password"
                            {...register('current_password')}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            placeholder="Current password"
                        />

                        <InputError
                            message={errors.current_password?.message}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">New password</Label>

                        <PasswordInput
                            id="password"
                            {...register('password')}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="New password"
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
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />

                        <InputError
                            message={errors.password_confirmation?.message}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            size={'lg'}
                            variant={'default'}
                            disabled={isProcessing}
                            data-test="update-password-button"
                        >
                            {isProcessing ? 'Saving...' : 'Save password'}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>
                </form>
            </div>

            {canManageTwoFactor && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Two-factor authentication"
                        description="Manage your two-factor authentication settings"
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You will be prompted for a secure, random pin
                                during login, which you can retrieve from the
                                TOTP-supported application on your phone.
                            </p>

                            <div className="relative inline">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        router.delete(disable.url());
                                    }}
                                >
                                    <Button variant="destructive" type="submit">
                                        Disable 2FA
                                    </Button>
                                </form>
                            </div>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={twoFactorErrors}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <p className="text-sm text-muted-foreground">
                                When you enable two-factor authentication, you
                                will be prompted for a secure pin during login.
                                This pin can be retrieved from a TOTP-supported
                                application on your phone.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck />
                                        Continue setup
                                    </Button>
                                ) : (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            router.post(
                                                enable.url(),
                                                {},
                                                {
                                                    onSuccess: () =>
                                                        setShowSetupModal(true),
                                                },
                                            );
                                        }}
                                    >
                                        <Button type="submit">
                                            Enable 2FA
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={twoFactorErrors}
                    />
                </div>
            )}
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
