import { Head, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface Unit {
    id: number;
    name: string;
    short_name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    [key: string]: unknown;
    units: Unit[];
}

export default function UnitIndex() {
    const { units } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editUnit, setEditUnit] = useState<Unit | null>(null);
    const [deleteUnit, setDeleteUnit] = useState<Unit | null>(null);

    const createForm = useForm({
        name: '',
        short_name: '',
    });

    const editForm = useForm({
        name: '',
        short_name: '',
    });

    const deleteForm = useForm({});

    const handleCreate = () => {
        createForm.post('/units', {
            onSuccess: () => {
                createForm.reset();
                setIsOpen(false);
            },
        });
    };

    const handleEdit = (unit: Unit) => {
        setEditUnit(unit);
        editForm.setData('name', unit.name);
        editForm.setData('short_name', unit.short_name);
    };

    const handleUpdate = () => {
        if (!editUnit) {
            return;
        }

        editForm.patch(`/units/${editUnit.id}`, {
            onSuccess: () => {
                editForm.reset();
                setEditUnit(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteUnit) {
            return;
        }

        deleteForm.delete(`/units/${deleteUnit.id}`, {
            onSuccess: () => {
                setDeleteUnit(null);
            },
        });
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
                                        name="name"
                                        value={createForm.data.name}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Unit name (e.g., Pieces)"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="short_name">
                                        Short Name
                                    </Label>
                                    <Input
                                        id="short_name"
                                        name="short_name"
                                        value={createForm.data.short_name}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'short_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Short name (e.g., pcs)"
                                    />
                                    <InputError
                                        message={createForm.errors.short_name}
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
                                {units.map((unit) => (
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
                                                <Button
                                                    variant="ghost"
                                                    size="lg"
                                                    onClick={() =>
                                                        handleEdit(unit)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="lg"
                                                    onClick={() =>
                                                        setDeleteUnit(unit)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {units.length === 0 && (
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
                            <Label htmlFor="edit-short_name">Short Name</Label>
                            <Input
                                id="edit-short_name"
                                name="short_name"
                                value={editForm.data.short_name}
                                onChange={(e) =>
                                    editForm.setData(
                                        'short_name',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError message={editForm.errors.short_name} />
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

UnitIndex.layout = {
    breadcrumbs: [
        {
            title: 'Units',
            href: '/units',
        },
    ] as BreadcrumbItem[],
};
