import { Form, Head } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
}: Props) {
    const [selectedRole, setSelectedRole] = useState<'owner' | 'cashier'>(
        'cashier',
    );

    return (
        <>
            <Head title="Log in" />

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl">
                            <img 
                                src="/logo.svg" 
                                alt="POS Logo" 
                                className="h-10 w-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Portal Access
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Log in to your POS account to continue
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                {status && (
                                    <div className="mb-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                        {status}
                                    </div>
                                )}

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="role"
                                            className="text-xs font-medium tracking-wide text-muted-foreground"
                                        >
                                            Access Role
                                        </Label>
                                        <Tabs
                                            value={selectedRole}
                                            onValueChange={(value) =>
                                                setSelectedRole(
                                                    value as
                                                        | 'owner'
                                                        | 'cashier',
                                                )
                                            }
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="owner">
                                                    Owner
                                                </TabsTrigger>
                                                <TabsTrigger value="cashier">
                                                    Cashier
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                        <input
                                            type="hidden"
                                            name="role"
                                            value={selectedRole}
                                        />
                                        <InputError message={errors.role} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="email"
                                            className="text-sm"
                                        >
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="password"
                                                className="text-sm"
                                            >
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs font-medium"
                                                    tabIndex={6}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/*<div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={4}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm font-medium"
                                        >
                                            Remember me
                                        </Label>
                                    </div>*/}

                                    <Button
                                        type="submit"
                                        tabIndex={5}
                                        disabled={processing}
                                        data-test="login-button"
                                        size={'lg'}
                                        className="w-full mb-2"
                                    >
                                        {processing && <Spinner />}
                                        Log in
                                    </Button>
                                </div>

                                {/*{canRegister && (
                                    <div className="mt-2 text-center text-sm text-muted-foreground">
                                        Don't have an account?{' '}
                                        <TextLink
                                            href={register()}
                                            tabIndex={6}
                                        >
                                            Sign up
                                        </TextLink>
                                    </div>
                                )}*/}
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}
