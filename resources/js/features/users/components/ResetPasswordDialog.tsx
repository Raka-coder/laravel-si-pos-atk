import { zodResolver } from '@hookform/resolvers/zod';
import { Key } from 'lucide-react';
import { useForm } from 'react-hook-form';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordSchema } from '@/schemas/user.schema';
import type { ResetPasswordForm } from '@/schemas/user.schema';
import type { User } from '@/types/models';

interface ResetPasswordDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    onSubmit: (data: ResetPasswordForm) => void;
    isProcessing: boolean;
}

export function ResetPasswordDialog({
    isOpen,
    onOpenChange,
    user,
    onSubmit,
    isProcessing,
}: ResetPasswordDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            password_confirmation: '',
        },
    });

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset();
        }

        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Reset password for {user?.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reset-password">New Password</Label>
                        <Input
                            id="reset-password"
                            type="password"
                            {...register('password')}
                        />
                        <InputError message={errors.password?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reset-password_confirmation">
                            Confirm Password
                        </Label>
                        <Input
                            id="reset-password_confirmation"
                            type="password"
                            {...register('password_confirmation')}
                        />
                        <InputError
                            message={errors.password_confirmation?.message}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            'Resetting...'
                        ) : (
                            <>
                                <Key className="mr-0.5 h-4 w-4" />
                                Reset Password
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
