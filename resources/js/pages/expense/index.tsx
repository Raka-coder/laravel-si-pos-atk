import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import type { BreadcrumbItem } from '@/types';

interface ExpenseCategory {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Expense {
    id: number;
    name: string;
    amount: number;
    date: string;
    note: string | null;
    expense_category_id: number | null;
    user_id: number;
    category: ExpenseCategory | null;
    user: User;
    created_at: string;
    updated_at: string;
}

interface Props {
    [key: string]: unknown;
    expenses: {
        data: Expense[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: ExpenseCategory[];
    filters: {
        category_id: string | null;
        date_from: string | null;
        date_to: string | null;
    };
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function ExpenseIndex() {
    const { expenses, categories } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editExpense, setEditExpense] = useState<Expense | null>(null);
    const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

    const createForm = useForm({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        expense_category_id: '',
    });

    const editForm = useForm({
        name: '',
        amount: '',
        date: '',
        note: '',
        expense_category_id: '',
    });

    const deleteForm = useForm({});

    const handleCreate = () => {
        createForm.post('/expenses', {
            onSuccess: () => {
                createForm.reset();
                setIsOpen(false);
            },
        });
    };

    const handleEdit = (expense: Expense) => {
        setEditExpense(expense);
        editForm.setData({
            name: expense.name,
            amount: String(expense.amount),
            date: expense.date,
            note: expense.note || '',
            expense_category_id: expense.expense_category_id
                ? String(expense.expense_category_id)
                : '',
        });
    };

    const handleUpdate = () => {
        if (!editExpense) return;
        editForm.patch(`/expenses/${editExpense.id}`, {
            onSuccess: () => {
                editForm.reset();
                setEditExpense(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteExpense) return;
        deleteForm.delete(`/expenses/${deleteExpense.id}`, {
            onSuccess: () => {
                setDeleteExpense(null);
            },
        });
    };

    return (
        <>
            <Head title="Expenses" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Expenses</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Expense</DialogTitle>
                                <DialogDescription>
                                    Record a new expense.
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
                                        placeholder="Expense name"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        value={createForm.data.amount}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    <InputError
                                        message={createForm.errors.amount}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={createForm.data.date}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={createForm.errors.date}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={
                                            createForm.data.expense_category_id
                                        }
                                        onValueChange={(value) =>
                                            createForm.setData(
                                                'expense_category_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="note">
                                        Note (optional)
                                    </Label>
                                    <Input
                                        id="note"
                                        name="note"
                                        value={createForm.data.note}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'note',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Optional note"
                                    />
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
                                        ? 'Saving...'
                                        : 'Save'}
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
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Note
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {expenses.data.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            {formatDate(expense.date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {expense.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {expense.category?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 text-sm">
                                            {expense.note || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(expense)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteExpense(
                                                            expense,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No expenses found.
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
                open={!!editExpense}
                onOpenChange={(open) => !open && setEditExpense(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                        <DialogDescription>
                            Update the expense.
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
                            <Label htmlFor="edit-amount">Amount</Label>
                            <Input
                                id="edit-amount"
                                name="amount"
                                type="number"
                                value={editForm.data.amount}
                                onChange={(e) =>
                                    editForm.setData('amount', e.target.value)
                                }
                            />
                            <InputError message={editForm.errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-date">Date</Label>
                            <Input
                                id="edit-date"
                                name="date"
                                type="date"
                                value={editForm.data.date}
                                onChange={(e) =>
                                    editForm.setData('date', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                                value={editForm.data.expense_category_id}
                                onValueChange={(value) =>
                                    editForm.setData(
                                        'expense_category_id',
                                        value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-note">Note</Label>
                            <Input
                                id="edit-note"
                                name="note"
                                value={editForm.data.note}
                                onChange={(e) =>
                                    editForm.setData('note', e.target.value)
                                }
                            />
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

            {/* Delete Modal */}
            <Dialog
                open={!!deleteExpense}
                onOpenChange={(open) => !open && setDeleteExpense(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Expense</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {deleteExpense?.name}"? This action cannot be
                            undone.
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

ExpenseIndex.layout = {
    breadcrumbs: [
        {
            title: 'Expenses',
            href: '/expenses',
        },
    ] as BreadcrumbItem[],
};
