import { zodResolver } from '@hookform/resolvers/zod';
import { Head, usePage, router } from '@inertiajs/react';
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

const unitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    short_name: z.string().min(1, 'Short name is required'),
});

type UnitForm = z.infer<typeof unitSchema>;

interface Unit {
    id: number;
    name: string;
    short_name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    [key: string]: unknown;
    units: {
        data: Unit[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function UnitIndex() {
    const { units, filters } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editUnit, setEditUnit] = useState<Unit | null>(null);
    const [deleteUnit, setDeleteUnit] = useState<Unit | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
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

        if (searchTerm === (filters.search || '')) {
            
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                '/units',
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
        reset: createReset,
        formState: { errors: createErrors },
    } = useForm<UnitForm>({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            name: '',
            short_name: '',
        },
    });

    const {
        register: editRegister,
        handleSubmit: editHandleSubmit,
        reset: editReset,
        formState: { errors: editErrors },
    } = useForm<UnitForm>({
        resolver: zodResolver(unitSchema),
    });

    const onCreateSubmit = (data: UnitForm) => {
        setIsCreateProcessing(true);
        router.post('/units', data, {
            onSuccess: () => {
                createReset();
                setIsOpen(false);
            },
            onFinish: () => setIsCreateProcessing(false),
        });
    };

    const handleEdit = (unit: Unit) => {
        setEditUnit(unit);
        editReset({
            name: unit.name,
            short_name: unit.short_name,
        });
    };

    const onEditSubmit = (data: UnitForm) => {
        if (!editUnit) {
            return;
        }

        setIsEditProcessing(true);
        router.patch(`/units/${editUnit.id}`, data, {
            onSuccess: () => {
                editReset();
                setEditUnit(null);
            },
            onFinish: () => setIsEditProcessing(false),
        });
    };

    const handleDelete = () => {
        if (!deleteUnit) {
            return;
        }

        setIsDeleteProcessing(true);
        router.delete(`/units/${deleteUnit.id}`, {
            onSuccess: () => {
                setDeleteUnit(null);
            },
            onFinish: () => setIsDeleteProcessing(false),
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

        return params.toString() ? `?${params.toString()}` : '/units';
    };

    return (
        <>
            <Head title="Units" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Units</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Unit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Unit</DialogTitle>
                                <DialogDescription>
                                    Create a new product unit.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        {...createRegister('name')}
                                        placeholder="Unit name (e.g., Pieces)"
                                    />
                                    <InputError
                                        message={createErrors.name?.message}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="short_name">
                                        Short Name
                                    </Label>
                                    <Input
                                        id="short_name"
                                        {...createRegister('short_name')}
                                        placeholder="Short name (e.g., pcs)"
                                    />
                                    <InputError
                                        message={
                                            createErrors.short_name?.message
                                        }
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
                                placeholder="Search units..."
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
                                        Short Name
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {units.data.map((unit) => (
                                    <TableRow key={unit.id}>
                                        <TableCell className="text-sm">
                                            {unit.id}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {unit.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {unit.short_name}
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
                                                                        unit,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit Unit</p>
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
                                                                    setDeleteUnit(
                                                                        unit,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive-foreground" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete Unit</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {units.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No units found. Create one to get
                                            started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {units.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                units.current_page > 1
                                                    ? getPaginationLink(
                                                          units.current_page -
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                units.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: units.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === units.last_page ||
                                                Math.abs(
                                                    page - units.current_page,
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
                                                            units.current_page
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
                                                units.current_page <
                                                units.last_page
                                                    ? getPaginationLink(
                                                          units.current_page +
                                                              1,
                                                      )
                                                    : undefined
                                            }
                                            className={
                                                units.current_page >=
                                                units.last_page
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
                open={!!editUnit}
                onOpenChange={(open) => !open && setEditUnit(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Unit</DialogTitle>
                        <DialogDescription>
                            Update the unit information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" {...editRegister('name')} />
                            <InputError message={editErrors.name?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-short_name">Short Name</Label>
                            <Input
                                id="edit-short_name"
                                {...editRegister('short_name')}
                            />
                            <InputError
                                message={editErrors.short_name?.message}
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
                open={!!deleteUnit}
                onOpenChange={(open) => !open && setDeleteUnit(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Unit</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteUnit?.name}
                            "? This action cannot be undone.
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

UnitIndex.layout = {
    breadcrumbs: [
        {
            title: 'Units',
            href: '/units',
        },
    ] as BreadcrumbItem[],
};
