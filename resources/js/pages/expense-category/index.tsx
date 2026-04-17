import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
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

const expenseCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

type ExpenseCategoryForm = z.infer<typeof expenseCategorySchema>;

interface ExpenseCategory {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    [key: string]: unknown;
    categories: {
        data: ExpenseCategory[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string | null;
    };
}

export default function ExpenseCategoryIndex() {
    const { categories, filters } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<ExpenseCategory | null>(
        null,
    );
    const [deleteCategory, setDeleteCategory] =
        useState<ExpenseCategory | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    const [isCreateProcessing, setIsCreateProcessing] = useState(false);
    const [isEditProcessing, setIsEditProcessing] = useState(false);
    const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

    // Debounce search
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

            router.get('/expense-categories', params, {
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
        reset: createReset,
        formState: { errors: createErrors },
    } = useForm<ExpenseCategoryForm>({
        resolver: zodResolver(expenseCategorySchema),
        defaultValues: {
            name: '',
        },
    });

    const {
        register: editRegister,
        handleSubmit: editHandleSubmit,
        reset: editReset,
        formState: { errors: editErrors },
    } = useForm<ExpenseCategoryForm>({
        resolver: zodResolver(expenseCategorySchema),
    });

    const onCreateSubmit = (data: ExpenseCategoryForm) => {
        setIsCreateProcessing(true);
        router.post('/expense-categories', data, {
            onSuccess: () => {
                createReset();
                setIsOpen(false);
            },
            onFinish: () => setIsCreateProcessing(false),
        });
    };

    const handleEdit = (category: ExpenseCategory) => {
        setEditCategory(category);
        editReset({
            name: category.name,
        });
    };

    const onEditSubmit = (data: ExpenseCategoryForm) => {
        if (!editCategory) {
            return;
        }

        setIsEditProcessing(true);
        router.patch(`/expense-categories/${editCategory.id}`, data, {
            onSuccess: () => {
                editReset();
                setEditCategory(null);
            },
            onFinish: () => setIsEditProcessing(false),
        });
    };

    const handleDelete = () => {
        if (!deleteCategory) {
            return;
        }

        setIsDeleteProcessing(true);
        router.delete(`/expense-categories/${deleteCategory.id}`, {
            onSuccess: () => {
                setDeleteCategory(null);
            },
            onFinish: () => setIsDeleteProcessing(false),
        });
    };

    const getPaginationLink = (page: number) => {
        const params = new URLSearchParams();

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (page > 1) {
            params.set('page', page.toString());
        }

        return params.toString()
            ? `?${params.toString()}`
            : '/expense-categories';
    };

    return (
        <>
            <Head title="Expense Categories" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Expense Categories</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size={'lg'}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Expense Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Expense Category</DialogTitle>
                                <DialogDescription>
                                    Create a new expense category.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        {...createRegister('name')}
                                        placeholder="Category name"
                                    />
                                    <InputError
                                        message={createErrors.name?.message}
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
                                    {isCreateProcessing
                                        ? 'Creating...'
                                        : 'Create'}
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
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>{category.id}</TableCell>
                                        <TableCell>{category.name}</TableCell>
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
                                                                        category,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit Category</p>
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
                                                                    setDeleteCategory(
                                                                        category,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive-foreground" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Delete Category
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No categories found. Create one to
                                            get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {categories.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                categories.current_page > 1
                                                    ? getPaginationLink(
                                                          categories.current_page -
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                categories.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: categories.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === categories.last_page ||
                                                Math.abs(
                                                    page -
                                                        categories.current_page,
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
                                                            categories.current_page
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
                                                categories.current_page <
                                                categories.last_page
                                                    ? getPaginationLink(
                                                          categories.current_page +
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                categories.current_page >=
                                                categories.last_page
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
                open={!!editCategory}
                onOpenChange={(open) => !open && setEditCategory(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the expense category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" {...editRegister('name')} />
                            <InputError message={editErrors.name?.message} />
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
                            {isEditProcessing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog
                open={!!deleteCategory}
                onOpenChange={(open) => !open && setDeleteCategory(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {deleteCategory?.name}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" size={'lg'}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            size={'lg'}
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

ExpenseCategoryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Expense Categories',
            href: '/expense-categories',
        },
    ] as BreadcrumbItem[],
};
