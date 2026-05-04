import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { userSchema } from '@/schemas/user.schema';
import type { UserForm } from '@/schemas/user.schema';
import type { User } from '@/types/models';

interface UserFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSubmit: (data: UserForm) => void;
    isProcessing: boolean;
}

export function UserFormDialog({
    isOpen,
    onOpenChange,
    user,
    onSubmit,
    isProcessing,
}: UserFormDialogProps) {
    const isEditMode = !!user;

    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors },
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
    });

    const formData = useWatch({ control });

    useEffect(() => {
        if (isEditMode) {
            reset({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                is_active: user.is_active,
                role: user.role,
            });
        } else {
            reset({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                is_active: true,
                role: 'cashier',
            });
        }
    }, [user, isEditMode, reset]);

    const formTitle = isEditMode ? 'Edit User' : 'Add New User';
    const formDescription = isEditMode
        ? 'Update the user information.'
        : 'Create a new user account.';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{formTitle}</DialogTitle>
                    <DialogDescription>{formDescription}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="User's name"
                        />
                        <InputError message={errors.name?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {isEditMode
                                ? 'New Password (leave blank to keep current)'
                                : 'Password'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            placeholder="Password"
                        />
                        <InputError message={errors.password?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            {...register('password_confirmation')}
                            placeholder="Confirm password"
                        />
                        <InputError
                            message={errors.password_confirmation?.message}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setValue('role', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cashier">Cashier</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role?.message} />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            id="is_active"
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) =>
                                setValue('is_active', e.target.checked)
                            }
                            className="h-4 w-4"
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" size="lg">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        size="lg"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isProcessing}
                    >
                        {isProcessing
                            ? isEditMode
                                ? 'Saving...'
                                : 'Creating...'
                            : isEditMode
                              ? 'Save Changes'
                              : 'Create User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
