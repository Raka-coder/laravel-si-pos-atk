import { zodResolver } from '@hookform/resolvers/zod';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    Key,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BreadcrumbItem } from '@/types';

const userSchema = z
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

const resetPasswordSchema = z
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

type UserForm = z.infer<typeof userSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

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
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    roles: string[];
    filters: {
        search: string;
    };
}

export default function UserIndex() {
    const { users, filters } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    const [isCreateProcessing, setIsCreateProcessing] = useState(false);
    const [isEditProcessing, setIsEditProcessing] = useState(false);
    const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);
    const [isResetProcessing, setIsResetProcessing] = useState(false);

    // Debounce search
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (searchTerm === (filters.search || '')) {
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/users',
                { search: searchTerm },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, filters.search]);

    const {
        register: createRegister,
        handleSubmit: createHandleSubmit,
        setValue: createSetValue,
        control: createControl,
        reset: createReset,
        formState: { errors: createErrors },
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            is_active: true,
            role: 'cashier',
        },
    });

    const {
        register: editRegister,
        handleSubmit: editHandleSubmit,
        setValue: editSetValue,
        control: editControl,
        reset: editReset,
        formState: { errors: editErrors },
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
    });

    const {
        register: resetRegister,
        handleSubmit: resetHandleSubmit,
        reset: resetReset,
        formState: { errors: resetErrors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            password_confirmation: '',
        },
    });

    const createFormData = useWatch({ control: createControl });
    const editFormData = useWatch({ control: editControl });

    const onCreateSubmit = (data: UserForm) => {
        setIsCreateProcessing(true);
        router.post('/users', data, {
            onSuccess: () => {
                createReset();
                setIsOpen(false);
            },
            onFinish: () => setIsCreateProcessing(false),
        });
    };

    const handleEdit = (user: User) => {
        setEditUser(user);
        editReset({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            is_active: user.is_active,
            role: user.role || 'cashier',
        });
    };

    const onEditSubmit = (data: UserForm) => {
        if (!editUser) {
            return;
        }

        setIsEditProcessing(true);
        router.patch(`/users/${editUser.id}`, data, {
            onSuccess: () => {
                editReset();
                setEditUser(null);
            },
            onFinish: () => setIsEditProcessing(false),
        });
    };

    const handleDelete = () => {
        if (!deleteUser) {
            return;
        }

        setIsDeleteProcessing(true);
        router.delete(`/users/${deleteUser.id}`, {
            onSuccess: () => {
                setDeleteUser(null);
            },
            onFinish: () => setIsDeleteProcessing(false),
        });
    };

    const handleToggleActive = (user: User) => {
        router.patch(
            `/users/${user.id}/toggle-active`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const onResetPasswordSubmit = (data: ResetPasswordForm) => {
        if (!resetPasswordUser) {
            return;
        }

        setIsResetProcessing(true);
        router.patch(`/users/${resetPasswordUser.id}/reset-password`, data, {
            onSuccess: () => {
                resetReset();
                setResetPasswordUser(null);
            },
            onFinish: () => setIsResetProcessing(false),
        });
    };

    // Get current filters for pagination
    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString() ? `?${params.toString()}` : '/users';
    };

    return (
        <>
            <Head title="User Management" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size={'lg'}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
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
                                        {...createRegister('name')}
                                        placeholder="Kasir name"
                                    />
                                    <InputError
                                        message={createErrors.name?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...createRegister('email')}
                                        placeholder="email@example.com"
                                    />
                                    <InputError
                                        message={createErrors.email?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...createRegister('password')}
                                        placeholder="Password"
                                    />
                                    <InputError
                                        message={createErrors.password?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        {...createRegister(
                                            'password_confirmation',
                                        )}
                                        placeholder="Confirm password"
                                    />
                                    <InputError
                                        message={
                                            createErrors.password_confirmation
                                                ?.message
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={createFormData.role}
                                        onValueChange={(value) =>
                                            createSetValue('role', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cashier">
                                                Cashier
                                            </SelectItem>
                                            <SelectItem value="owner">
                                                Owner
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={createErrors.role?.message}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="create-is_active"
                                        type="checkbox"
                                        checked={createFormData.is_active}
                                        onChange={(e) =>
                                            createSetValue(
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
                                    <Button variant="outline" size={'lg'}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    size={'lg'}
                                    onClick={createHandleSubmit(onCreateSubmit)}
                                    disabled={isCreateProcessing}
                                >
                                    {isCreateProcessing
                                        ? 'Creating...'
                                        : 'Create'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSearchTerm(e.target.value);
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-left">
                                        ID
                                    </TableHead>
                                    <TableHead className="text-left">
                                        Name
                                    </TableHead>
                                    <TableHead className="text-left">
                                        Email
                                    </TableHead>
                                    <TableHead className="text-left">
                                        Role
                                    </TableHead>
                                    <TableHead className="text-left">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            {(users.current_page - 1) *
                                                users.per_page +
                                                index +
                                                1}
                                        </TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`capitalize ${user.role === 'owner' ? 'font-semibold text-blue-600' : ''}`}
                                            >
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="lg"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit User</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="lg"
                                                                onClick={() =>
                                                                    setResetPasswordUser(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <Key className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Reset Password
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="lg"
                                                                onClick={() =>
                                                                    handleToggleActive(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                {user.is_active ? (
                                                                    <ToggleRight className="h-4 w-4 text-green-500" />
                                                                ) : (
                                                                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                {user.is_active
                                                                    ? 'Deactivate'
                                                                    : 'Activate'}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="lg"
                                                                onClick={() =>
                                                                    setDeleteUser(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive-foreground" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete User</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No user found. Create one to get
                                            started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {users.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                users.current_page > 1
                                                    ? getPaginationLink(
                                                          users.current_page -
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                users.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: users.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === users.last_page ||
                                                Math.abs(
                                                    page - users.current_page,
                                                ) <= 2,
                                        )
                                        .map((page, index, array) => (
                                            <PaginationItem key={page}>
                                                {index > 0 &&
                                                page - array[index - 1] > 1 ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href={getPaginationLink(
                                                            page,
                                                        )}
                                                        isActive={
                                                            page ===
                                                            users.current_page
                                                        }
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                users.current_page <
                                                users.last_page
                                                    ? getPaginationLink(
                                                          users.current_page +
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                users.current_page >=
                                                users.last_page
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
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
                            <Input id="edit-name" {...editRegister('name')} />
                            <InputError message={editErrors.name?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                {...editRegister('email')}
                            />
                            <InputError message={editErrors.email?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password">
                                Password (leave blank to keep current)
                            </Label>
                            <Input
                                id="edit-password"
                                type="password"
                                {...editRegister('password')}
                            />
                            <InputError
                                message={editErrors.password?.message}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="edit-password_confirmation"
                                type="password"
                                {...editRegister('password_confirmation')}
                            />
                            <InputError
                                message={
                                    editErrors.password_confirmation?.message
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select
                                value={editFormData.role}
                                onValueChange={(value) =>
                                    editSetValue('role', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashier">
                                        Cashier
                                    </SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={editErrors.role?.message} />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="edit-is_active"
                                type="checkbox"
                                checked={editFormData.is_active}
                                onChange={(e) =>
                                    editSetValue('is_active', e.target.checked)
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
                            onClick={editHandleSubmit(onEditSubmit)}
                            disabled={isEditProcessing}
                        >
                            {isEditProcessing ? 'Saving...' : 'Save Changes'}
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
                                type="password"
                                {...resetRegister('password')}
                            />
                            <InputError
                                message={resetErrors.password?.message}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reset-password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="reset-password_confirmation"
                                type="password"
                                {...resetRegister('password_confirmation')}
                            />
                            <InputError
                                message={
                                    resetErrors.password_confirmation?.message
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={resetHandleSubmit(onResetPasswordSubmit)}
                            disabled={isResetProcessing}
                        >
                            {isResetProcessing
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
                            Are you sure you want to delete \"{deleteUser?.name}
                            \"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleteProcessing}
                        >
                            {isDeleteProcessing ? 'Deleting...' : 'Delete'}
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
