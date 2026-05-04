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
import { expenseCategorySchema } from '@/schemas/expense-category.schema';
import type { ExpenseCategoryForm } from '@/schemas/expense-category.schema';
import type { ExpenseCategory } from '@/types';

interface ExpenseCategoryFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    category: ExpenseCategory | null;
    onSubmit: (data: ExpenseCategoryForm) => void;
    isProcessing: boolean;
}

export function ExpenseCategoryFormDialog({
    isOpen,
    onOpenChange,
    category,
    onSubmit,
    isProcessing,
}: ExpenseCategoryFormDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExpenseCategoryForm>({
        resolver: zodResolver(expenseCategorySchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (category) {
            reset({ name: category.name });
        } else {
            reset({ name: '' });
        }
    }, [category, reset, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Edit Category' : 'Add Expense Category'}
                    </DialogTitle>
                    <DialogDescription>
                        {category
                            ? 'Update the category information.'
                            : 'Create a new category for your expenses.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Utilities"
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
                        onClick={handleSubmit(onSubmit)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            category ? 'Saving...' : 'Creating...'
                        ) : (
                            <>
                                {category && <Check className="mr-0.5 h-4 w-4" />}
                                {category ? 'Save Changes' : 'Create'}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
