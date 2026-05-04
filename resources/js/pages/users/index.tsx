import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ConfirmAlert } from '@/components/common/confirm-alert';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResetPasswordDialog } from '@/features/users/components/ResetPasswordDialog';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import { UserTable } from '@/features/users/components/UserTable';
import type { ResetPasswordForm, UserForm } from '@/schemas/user.schema';
import type { BreadcrumbItem, Paginated } from '@/types';
import type { User } from '@/types/models';

interface Props {
    [key: string]: unknown;
    users: Paginated<User>;
    roles: string[];
    filters: {
        search: string | null;
    };
}

export default function UserIndex() {
    const { users, filters } = usePage<Props>().props;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isResetPassOpen, setIsResetPassOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [resettingUser, setResettingUser] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (search === (filters.search || '')) {
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/users',
                { search },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleFormSubmit = (data: UserForm) => {
        setIsProcessing(true);

        if (editingUser) {
            router.patch(`/users/${editingUser.id}`, data, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    setEditingUser(null);
                },
                onFinish: () => setIsProcessing(false),
            });
        } else {
            router.post('/users', data, {
                onSuccess: () => setIsFormOpen(false),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deletingUser) {
            return;
        }

        setIsProcessing(true);
        router.delete(`/users/${deletingUser.id}`, {
            onSuccess: () => setDeletingUser(null),
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleResetPasswordSubmit = (data: ResetPasswordForm) => {
        if (!resettingUser) {
            return;
        }

        setIsProcessing(true);
        router.patch(`/users/${resettingUser.id}/reset-password`, data, {
            onSuccess: () => {
                setIsResetPassOpen(false);
                setResettingUser(null);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const handleToggleActive = (user: User) => {
        router.patch(
            `/users/${user.id}/toggle-active`,
            {},
            { preserveScroll: true },
        );
    };

    const openCreateForm = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };

    const openEditForm = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const openResetPasswordForm = (user: User) => {
        setResettingUser(user);
        setIsResetPassOpen(true);
    };

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
                <PageHeader title="User Management">
                    <Button size="lg" onClick={openCreateForm}>
                        <Plus className="mr-0.5 h-4 w-4" />
                        Add User
                    </Button>
                </PageHeader>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <UserTable
                        users={users}
                        onEdit={openEditForm}
                        onDelete={setDeletingUser}
                        onResetPassword={openResetPasswordForm}
                        onToggleActive={handleToggleActive}
                        getPaginationLink={getPaginationLink}
                    />
                </div>
            </div>

            <UserFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                user={editingUser}
                onSubmit={handleFormSubmit}
                isProcessing={isProcessing}
            />

            <ResetPasswordDialog
                isOpen={isResetPassOpen}
                onOpenChange={setIsResetPassOpen}
                user={resettingUser}
                onSubmit={handleResetPasswordSubmit}
                isProcessing={isProcessing}
            />

            <ConfirmAlert
                open={!!deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
                title="Delete User"
                description={`Are you sure you want to delete "${deletingUser?.name}"? This action cannot be undone.`}
                confirmText={isProcessing ? 'Deleting...' : 'Delete'}
                onConfirm={handleDelete}
                variant="destructive"
            />
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        { title: 'User Management', href: '/users' },
    ] as BreadcrumbItem[],
};
