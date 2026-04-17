import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
        search: string | null;
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
    const { expenses, categories, filters } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editExpense, setEditExpense] = useState<Expense | null>(null);
    const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
    const [createDateOpen, setCreateDateOpen] = useState(false);
    const [editDateOpen, setEditDateOpen] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        // Only trigger router.get if search state is actually different from current filters in props
        // This prevents resetting to page 1 when navigating through pagination
        if (
            search === (filters.search || '') &&
            categoryId === (filters.category_id || 'all') &&
            dateFrom === (filters.date_from || '') &&
            dateTo === (filters.date_to || '')
        ) {
            return;
        }

        const timer = setTimeout(() => {
            const params: Record<string, string> = {};

            if (search) {
                params.search = search;
            }

            if (categoryId && categoryId !== 'all') {
                params.category_id = categoryId;
            }

            if (dateFrom) {
                params.date_from = dateFrom;
            }

            if (dateTo) {
                params.date_to = dateTo;
            }

            router.get('/expenses', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [
        search,
        categoryId,
        dateFrom,
        dateTo,
        filters.search,
        filters.category_id,
        filters.date_from,
        filters.date_to,
    ]);

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
        if (!editExpense) {
            return;
        }

        editForm.patch(`/expenses/${editExpense.id}`, {
            onSuccess: () => {
                editForm.reset();
                setEditExpense(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteExpense) {
            return;
        }

        deleteForm.delete(`/expenses/${deleteExpense.id}`, {
            onSuccess: () => {
                setDeleteExpense(null);
            },
        });
    };

    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (filters.category_id) {
            params.set('category_id', filters.category_id);
        }

        if (filters.date_from) {
            params.set('date_from', filters.date_from);
        }

        if (filters.date_to) {
            params.set('date_to', filters.date_to);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString() ? `?${params.toString()}` : '/expenses';
    };

    return (
        <>
            <Head title="Expenses" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Expenses</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size={'lg'}>
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
                                    <DropdownMenu
                                        open={createDateOpen}
                                        onOpenChange={setCreateDateOpen}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {createForm.data.date ? (
                                                    format(
                                                        new Date(
                                                            createForm.data
                                                                .date,
                                                        ),
                                                        'PPP',
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    createForm.data.date
                                                        ? new Date(
                                                              createForm.data
                                                                  .date,
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    createForm.setData(
                                                        'date',
                                                        date
                                                            ? format(
                                                                  date,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : '',
                                                    );
                                                    setCreateDateOpen(false);
                                                }}
                                                initialFocus
                                            />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                                    <Button variant="outline" size={'lg'}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    size={'lg'}
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
                    <div className="mb-4 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search expenses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.data.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(expense.date)}
                                    </TableCell>
                                    <TableCell>{expense.name}</TableCell>
                                    <TableCell>
                                        {expense.category?.name || '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(expense.amount)}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {expense.note || '-'}
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
                                                                    expense,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Edit Expense</p>
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
                                                                setDeleteExpense(
                                                                    expense,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive-foreground" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Delete Expense</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {expenses.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No expenses found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {expenses.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                expenses.current_page > 1
                                                    ? getPaginationLink(
                                                          expenses.current_page -
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                expenses.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: expenses.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === expenses.last_page ||
                                                Math.abs(
                                                    page -
                                                        expenses.current_page,
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
                                                            expenses.current_page
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
                                                expenses.current_page <
                                                expenses.last_page
                                                    ? getPaginationLink(
                                                          expenses.current_page +
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                expenses.current_page >=
                                                expenses.last_page
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
                            <DropdownMenu
                                open={editDateOpen}
                                onOpenChange={setEditDateOpen}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editForm.data.date ? (
                                            format(
                                                new Date(editForm.data.date),
                                                'PPP',
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={
                                            editForm.data.date
                                                ? new Date(editForm.data.date)
                                                : undefined
                                        }
                                        onSelect={(date) => {
                                            editForm.setData(
                                                'date',
                                                date
                                                    ? format(date, 'yyyy-MM-dd')
                                                    : '',
                                            );
                                            setEditDateOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                            <Button variant="outline" size={'lg'}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            size={'lg'}
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
