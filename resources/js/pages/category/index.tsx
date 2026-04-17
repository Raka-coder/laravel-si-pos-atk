import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
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

interface Category {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    [key: string]: unknown;
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function CategoryIndex() {
    const { categories, filters } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    // Debounce search
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/product-categories',
                { search: searchTerm },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const createForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
    });

    const deleteForm = useForm({});

    const handleCreate = () => {
        createForm.post('/product-categories', {
            onSuccess: () => {
                createForm.reset();
                setIsOpen(false);
            },
        });
    };

    const handleEdit = (category: Category) => {
        setEditCategory(category);
        editForm.setData('name', category.name);
    };

    const handleUpdate = () => {
        if (!editCategory) {
            return;
        }

        editForm.patch(`/product-categories/${editCategory.id}`, {
            onSuccess: () => {
                editForm.reset();
                setEditCategory(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteCategory) {
            return;
        }

        deleteForm.delete(`/product-categories/${deleteCategory.id}`, {
            onSuccess: () => {
                setDeleteCategory(null);
            },
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

        return params.toString()
            ? `?${params.toString()}`
            : '/product-categories';
    };

    return (
        <>
            <Head title="Product Categories" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Product Categories</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Add New Product Category
                                </DialogTitle>
                                <DialogDescription>
                                    Create a new product category.
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
                                        placeholder="Category name"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
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
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
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
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category) => (
                                    <TableRow
                                        key={category.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="text-sm">
                                            {category.id}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {category.name}
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
                                                                <Trash2 className="h-4 w-4" />
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

                    {/* Pagination */}
                    {categories.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            asChild
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
                                        >
                                            {categories.current_page > 1 ? (
                                                <Link
                                                    href={getPaginationLink(
                                                        categories.current_page -
                                                            1,
                                                    )}
                                                >
                                                    Previous
                                                </Link>
                                            ) : (
                                                <span>Previous</span>
                                            )}
                                        </PaginationPrevious>
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
                                                        asChild
                                                        href={getPaginationLink(
                                                            page,
                                                        )}
                                                        isActive={
                                                            page ===
                                                            categories.current_page
                                                        }
                                                    >
                                                        <Link
                                                            href={getPaginationLink(
                                                                page,
                                                            )}
                                                        >
                                                            {page}
                                                        </Link>
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            asChild
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
                                        >
                                            {categories.current_page <
                                            categories.last_page ? (
                                                <Link
                                                    href={getPaginationLink(
                                                        categories.current_page +
                                                            1,
                                                    )}
                                                >
                                                    Next
                                                </Link>
                                            ) : (
                                                <span>Next</span>
                                            )}
                                        </PaginationNext>
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
                            Update the category information.
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
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" size="lg">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            size="lg"
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
                            <Button variant="outline" size="lg">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            size="lg"
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

CategoryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: '/product-categories',
        },
    ] as BreadcrumbItem[],
};
