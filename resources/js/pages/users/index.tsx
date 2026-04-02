import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Trash2,
    Key,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { useState } from 'react';

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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    role: string;
    created_at: string;
}

interface Props {
    [key: string]: unknown;
    users: User[];
    roles: string[];
}

export default function UserIndex() {
    const { users } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(
        null,
    );

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_active: true,
        role: 'cashier',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_active: true,
        role: 'cashier',
    });

    const deleteForm = useForm({});

    const toggleActiveForm = useForm({});

    const resetPasswordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleCreate = () => {
        createForm.post('/users', {
            onSuccess: () => {
                createForm.reset();
                setIsOpen(false);
            },
        });
    };

    const handleEdit = (user: User) => {
        setEditUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            is_active: user.is_active,
            role: user.role || 'cashier',
        });
    };

    const handleUpdate = () => {
        if (!editUser) {
            return;
        }

        editForm.patch(`/users/${editUser.id}`, {
            onSuccess: () => {
                editForm.reset('password', 'password_confirmation');
                setEditUser(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteUser) {
            return;
        }

        deleteForm.delete(`/users/${deleteUser.id}`, {
            onSuccess: () => {
                setDeleteUser(null);
            },
        });
    };

    const handleToggleActive = (user: User) => {
        toggleActiveForm.patch(`/users/${user.id}/toggle-active`, {
            onSuccess: () => {
                toggleActiveForm.reset();
            },
        });
    };

    const handleResetPassword = () => {
        if (!resetPasswordUser) {
            return;
        }

        resetPasswordForm.patch(
            `/users/${resetPasswordUser.id}/reset-password`,
            {
                onSuccess: () => {
                    resetPasswordForm.reset();
                    setResetPasswordUser(null);
                },
            },
        );
    };

    return (
        <>
            <Head title="User Management" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Kasir
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>
                                    Create a new user account.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={createForm.data.name}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Kasir name"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="email@example.com"
                                    />
                                    <InputError
                                        message={createForm.errors.email}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Password"
                                    />
                                    <InputError
                                        message={createForm.errors.password}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        value={
                                            createForm.data
                                                .password_confirmation
                                        }
                                        onChange={(e) =>
                                            createForm.setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm password"
                                    />
                                    <InputError
                                        message={
                                            createForm.errors
                                                .password_confirmation
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={createForm.data.role}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'role',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="cashier">Cashier</option>
                                        <option value="owner">Owner</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="create-is_active"
                                        type="checkbox"
                                        checked={createForm.data.is_active}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="create-is_active">
                                        Active
                                    </Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    onClick={handleCreate}
                                    disabled={createForm.processing}
                                >
                                    {createForm.processing
                                        ? 'Creating...'
                                        : 'Create'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            {user.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`capitalize ${user.role === 'owner' ? 'font-semibold text-blue-600' : ''}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    user.is_active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {user.is_active
                                                    ? 'Active'
                                                    : 'Non-active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(user)
                                                    }
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setResetPasswordUser(
                                                            user,
                                                        )
                                                    }
                                                    title="Reset Password"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleToggleActive(user)
                                                    }
                                                    title={
                                                        user.is_active
                                                            ? 'Deactivate'
                                                            : 'Activate'
                                                    }
                                                >
                                                    {user.is_active ? (
                                                        <ToggleRight className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteUser(user)
                                                    }
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No user found. Create one to get
                                            started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog
                open={!!editUser}
                onOpenChange={(open) => !open && setEditUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Kasir</DialogTitle>
                        <DialogDescription>
                            Update the cashier information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={editForm.data.name}
                                onChange={(e) =>
                                    editForm.setData('name', e.target.value)
                                }
                            />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                name="email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) =>
                                    editForm.setData('email', e.target.value)
                                }
                            />
                            <InputError message={editForm.errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password">
                                Password (leave blank to keep current)
                            </Label>
                            <Input
                                id="edit-password"
                                name="password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) =>
                                    editForm.setData('password', e.target.value)
                                }
                            />
                            <InputError message={editForm.errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="edit-password_confirmation"
                                name="password_confirmation"
                                type="password"
                                value={editForm.data.password_confirmation}
                                onChange={(e) =>
                                    editForm.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={editForm.errors.password_confirmation}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <select
                                id="edit-role"
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={editForm.data.role}
                                onChange={(e) =>
                                    editForm.setData('role', e.target.value)
                                }
                            >
                                <option value="cashier">Cashier</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="edit-is_active"
                                type="checkbox"
                                checked={editForm.data.is_active}
                                onChange={(e) =>
                                    editForm.setData(
                                        'is_active',
                                        e.target.checked,
                                    )
                                }
                                className="h-4 w-4"
                            />
                            <Label htmlFor="edit-is_active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleUpdate}
                            disabled={editForm.processing}
                        >
                            {editForm.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Modal */}
            <Dialog
                open={!!resetPasswordUser}
                onOpenChange={(open) => !open && setResetPasswordUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Reset password for {resetPasswordUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reset-password">New Password</Label>
                            <Input
                                id="reset-password"
                                name="password"
                                type="password"
                                value={resetPasswordForm.data.password}
                                onChange={(e) =>
                                    resetPasswordForm.setData(
                                        'password',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={resetPasswordForm.errors.password}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reset-password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="reset-password_confirmation"
                                name="password_confirmation"
                                type="password"
                                value={
                                    resetPasswordForm.data.password_confirmation
                                }
                                onChange={(e) =>
                                    resetPasswordForm.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={
                                    resetPasswordForm.errors
                                        .password_confirmation
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleResetPassword}
                            disabled={resetPasswordForm.processing}
                        >
                            {resetPasswordForm.processing
                                ? 'Resetting...'
                                : 'Reset Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog
                open={!!deleteUser}
                onOpenChange={(open) => !open && setDeleteUser(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Kasir</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteUser?.name}
                            "? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteForm.processing}
                        >
                            {deleteForm.processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        { title: 'User Management', href: '/users' },
    ] as BreadcrumbItem[],
};
