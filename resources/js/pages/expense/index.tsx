import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Check, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

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

const expenseSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    date: z.string().min(1, 'Date is required'),
    note: z.string().optional(),
    expense_category_id: z.string().min(1, 'Category is required'),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

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
    const isFirstRender = useRef(true);

    const [isCreateProcessing, setIsCreateProcessing] = useState(false);
    const [isEditProcessing, setIsEditProcessing] = useState(false);
    const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (search === (filters.search || '')) {
            return;
        }

        const timer = setTimeout(() => {
            const params: Record<string, string> = {};

            if (search) {
                params.search = search;
            }

            router.get('/expenses', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const {
        register: createRegister,
        handleSubmit: createHandleSubmit,
        setValue: createSetValue,
        control: createControl,
        reset: createReset,
        formState: { errors: createErrors },
    } = useForm<ExpenseForm>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            name: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            note: '',
            expense_category_id: '',
        },
    });

    const {
        register: editRegister,
        handleSubmit: editHandleSubmit,
        setValue: editSetValue,
        control: editControl,
        reset: editReset,
        formState: { errors: editErrors },
    } = useForm<ExpenseForm>({
        resolver: zodResolver(expenseSchema),
    });

    const createFormData = useWatch({ control: createControl });
    const editFormData = useWatch({ control: editControl });

    const onCreateSubmit = (data: ExpenseForm) => {
        setIsCreateProcessing(true);
        router.post('/expenses', data, {
            onSuccess: () => {
                createReset();
                setIsOpen(false);
            },
            onFinish: () => setIsCreateProcessing(false),
        });
    };

    const handleEdit = (expense: Expense) => {
        setEditExpense(expense);
        editReset({
            name: expense.name,
            amount: String(expense.amount),
            date: expense.date,
            note: expense.note || '',
            expense_category_id: expense.expense_category_id
                ? String(expense.expense_category_id)
                : '',
        });
    };

    const onEditSubmit = (data: ExpenseForm) => {
        if (!editExpense) {
            return;
        }

        setIsEditProcessing(true);
        router.patch(`/expenses/${editExpense.id}`, data, {
            onSuccess: () => {
                editReset();
                setEditExpense(null);
            },
            onFinish: () => setIsEditProcessing(false),
        });
    };

    const handleDelete = () => {
        if (!deleteExpense) {
            return;
        }

        setIsDeleteProcessing(true);
        router.delete(`/expenses/${deleteExpense.id}`, {
            onSuccess: () => {
                setDeleteExpense(null);
            },
            onFinish: () => setIsDeleteProcessing(false),
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
                                <Plus className="mr-0.5 h-4 w-4" />
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
                                        {...createRegister('name')}
                                        placeholder="Expense name"
                                    />
                                    <InputError
                                        message={createErrors.name?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        {...createRegister('amount')}
                                        placeholder="0"
                                    />
                                    <InputError
                                        message={createErrors.amount?.message}
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
                                                <CalendarIcon className="mr-0.5 h-4 w-4" />
                                                {createFormData.date ? (
                                                    format(
                                                        new Date(
                                                            createFormData.date,
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
                                                    createFormData.date
                                                        ? new Date(
                                                              createFormData.date,
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(date) => {
                                                    createSetValue(
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
                                        message={createErrors.date?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={
                                            createFormData.expense_category_id
                                        }
                                        onValueChange={(value) =>
                                            createSetValue(
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
                                    <InputError
                                        message={
                                            createErrors.expense_category_id
                                                ?.message
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="note">
                                        Note (optional)
                                    </Label>
                                    <Input
                                        id="note"
                                        {...createRegister('note')}
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
                                    onClick={createHandleSubmit(onCreateSubmit)}
                                    disabled={isCreateProcessing}
                                >
                                    {isCreateProcessing ? (
                                        'Saving...'
                                    ) : (
                                        <>
                                            <Save className="mr-0.5 h-4 w-4" />
                                            Save
                                        </>
                                    )}
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
                            <Input id="edit-name" {...editRegister('name')} />
                            <InputError message={editErrors.name?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-amount">Amount</Label>
                            <Input
                                id="edit-amount"
                                type="number"
                                {...editRegister('amount')}
                            />
                            <InputError message={editErrors.amount?.message} />
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
                                        <CalendarIcon className="mr-0.5 h-4 w-4" />
                                        {editFormData.date ? (
                                            format(
                                                new Date(editFormData.date),
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
                                            editFormData.date
                                                ? new Date(editFormData.date)
                                                : undefined
                                        }
                                        onSelect={(date) => {
                                            editSetValue(
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
                            <InputError message={editErrors.date?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                                value={editFormData.expense_category_id}
                                onValueChange={(value) =>
                                    editSetValue('expense_category_id', value)
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
                            <InputError
                                message={
                                    editErrors.expense_category_id?.message
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-note">Note</Label>
                            <Input id="edit-note" {...editRegister('note')} />
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
                            onClick={editHandleSubmit(onEditSubmit)}
                            disabled={isEditProcessing}
                        >
                            {isEditProcessing ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Check className="mr-0.5 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
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

ExpenseIndex.layout = {
    breadcrumbs: [
        {
            title: 'Expenses',
            href: '/expenses',
        },
    ] as BreadcrumbItem[],
};
;
