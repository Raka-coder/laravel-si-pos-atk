import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
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
import { categorySchema } from '@/schemas/category.schema';
import type { CategoryForm } from '@/schemas/category.schema';
import type { Category } from '@/types/models';

interface CategoryFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSubmit: (data: CategoryForm) => void;
    isProcessing: boolean;
}

export function CategoryFormDialog({
    isOpen,
    onOpenChange,
    category,
    onSubmit,
    isProcessing,
}: CategoryFormDialogProps) {
    const isEditMode = !!category;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CategoryForm>({
        resolver: zodResolver(categorySchema),
    });

    useEffect(() => {
        if (isEditMode) {
            reset({ name: category.name });
        } else {
            reset({ name: '' });
        }
    }, [category, isEditMode, reset]);

    const handleFormSubmit = (data: CategoryForm) => {
        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Category' : 'Add Category'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the category information.'
                            : 'Create a new category for your products.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Beverages"
                            {...register('name')}
                        />
                        <InputError message={errors.name?.message} />
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
                        onClick={handleSubmit(handleFormSubmit)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            isEditMode ? (
                                'Saving...'
                            ) : (
                                'Creating...'
                            )
                        ) : isEditMode ? (
                            <>
                                <Check className="mr-0.5 h-4 w-4" />
                                Save Changes
                            </>
                        ) : (
                            'Create'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
