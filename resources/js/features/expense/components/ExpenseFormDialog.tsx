import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { expenseSchema } from '@/schemas/expense.schema';
import type { ExpenseForm } from '@/schemas/expense.schema';
import type { Expense, ExpenseCategory } from '@/types/models';

interface ExpenseFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    expense?: Expense | null;
    onSubmit: (data: ExpenseForm) => void;
    isProcessing: boolean;
    categories: ExpenseCategory[];
}

export function ExpenseFormDialog({
    isOpen,
    onOpenChange,
    expense,
    onSubmit,
    isProcessing,
    categories,
}: ExpenseFormDialogProps) {
    const isEditMode = !!expense;
    const [isDateOpen, setIsDateOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors },
    } = useForm<ExpenseForm>({
        resolver: zodResolver(expenseSchema),
    });

    const dateValue = useWatch({ control, name: 'date' });
    const categoryId = useWatch({ control, name: 'expense_category_id' });

    useEffect(() => {
        if (isEditMode) {
            reset({
                name: expense.name,
                amount: String(expense.amount),
                date: expense.date,
                note: expense.note ?? '',
                expense_category_id: String(expense.expense_category_id),
            });
        } else {
            reset({
                name: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                note: '',
                expense_category_id: '',
            });
        }
    }, [expense, isEditMode, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Expense' : 'Add Expense'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the expense details.'
                            : 'Record a new expense.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Form Fields */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Expense Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Electricity Bill"
                            {...register('name')}
                        />
                        <InputError message={errors.name?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            onValueChange={(v) =>
                                setValue('expense_category_id', v)
                            }
                            value={categoryId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={String(cat.id)}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError
                            message={errors.expense_category_id?.message}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0"
                            {...register('amount')}
                        />
                        <InputError message={errors.amount?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <DropdownMenu
                            open={isDateOpen}
                            onOpenChange={setIsDateOpen}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateValue
                                        ? format(new Date(dateValue), 'PPP')
                                        : 'Pick a date'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={
                                        dateValue
                                            ? new Date(dateValue)
                                            : undefined
                                    }
                                    onSelect={(date) => {
                                        if (date) {
                                            setValue(
                                                'date',
                                                date
                                                    .toISOString()
                                                    .split('T')[0],
                                            );
                                            setIsDateOpen(false);
                                        }
                                    }}
                                    initialFocus
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <InputError message={errors.date?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="note">Note (Optional)</Label>
                        <Input
                            id="note"
                            placeholder="Additional info..."
                            {...register('note')}
                        />
                        <InputError message={errors.note?.message} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
