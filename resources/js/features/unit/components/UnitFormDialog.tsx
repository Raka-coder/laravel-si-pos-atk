import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { unitSchema } from '@/schemas/unit.schema';
import type { UnitForm } from '@/schemas/unit.schema';
import type { Unit } from '@/types/models';

interface UnitFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    unit?: Unit | null;
    onSubmit: (data: UnitForm) => void;
    isProcessing: boolean;
}

export function UnitFormDialog({
    isOpen,
    onOpenChange,
    unit,
    onSubmit,
    isProcessing,
}: UnitFormDialogProps) {
    const isEditMode = !!unit;
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UnitForm>({
        resolver: zodResolver(unitSchema),
    });

    useEffect(() => {
        if (isEditMode) {
            reset({ name: unit.name, short_name: unit.short_name });
        } else {
            reset({ name: '', short_name: '' });
        }
    }, [unit, isEditMode, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Unit' : 'Add Unit'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the unit information.'
                            : 'Create a new measurement unit for your products.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Kilogram"
                            {...register('name')}
                        />
                        <InputError message={errors.name?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="short_name">Short Name</Label>
                        <Input
                            id="short_name"
                            placeholder="e.g. Kg"
                            {...register('short_name')}
                        />
                        <InputError message={errors.short_name?.message} />
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
                        onClick={handleSubmit(onSubmit)}
                        disabled={isProcessing}
                    >
                        {isProcessing
                            ? isEditMode
                                ? 'Saving...'
                                : 'Creating...'
                            : isEditMode
                              ? 'Save Changes'
                              : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
