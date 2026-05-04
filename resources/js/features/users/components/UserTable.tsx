import { useCallback } from 'react';

import { DataTable } from '@/components/common/data-table';
import type { Column } from '@/components/common/data-table';
import { Badge } from '@/components/ui/badge';
import type { Paginated, User } from '@/types/models';

import { UserActions } from './UserActions';

interface UserTableProps {
    users: Paginated<User>;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onResetPassword: (user: User) => void;
    onToggleActive: (user: User) => void;
    getPaginationLink: (page: number) => string;
}

export function UserTable({
    users,
    onEdit,
    onDelete,
    onResetPassword,
    onToggleActive,
    getPaginationLink,
}: UserTableProps) {
    const columns: Column<User>[] = [
        {
            header: 'No',
            cell: (user: User, index: number) =>
                (users.current_page - 1) * users.per_page + (index ?? 0) + 1,
        },
        {
            header: 'Name',
            accessorKey: 'name',
            className: 'font-medium',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Role',
            cell: (user: User) => (
                <span
                    className={`capitalize ${
                        user.role === 'owner'
                            ? 'font-semibold text-blue-600'
                            : ''
                    }`}
                >
                    {user.role}
                </span>
            ),
        },
        {
            header: 'Status',
            cell: (user: User) => (
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Non-active'}
                </Badge>
            ),
        },
        {
            header: 'Actions',
            className: 'text-right',
            cell: useCallback(
                (user: User) => (
                    <UserActions
                        user={user}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onResetPassword={onResetPassword}
                        onToggleActive={onToggleActive}
                    />
                ),
                [onEdit, onDelete, onResetPassword, onToggleActive],
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={users.data}
            meta={users}
            getPaginationLink={getPaginationLink}
            emptyMessage="No user found."
        />
    );
}
