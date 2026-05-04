import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { stockMovementSchema } from '@/lib/schemas';
import type { Product } from '@/types';

type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

interface StockMovementFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    products: Product[];
    onSubmit: (data: StockMovementFormValues) => void;
    isProcessing: boolean;
}

export function StockMovementFormDialog({
    isOpen,
    onOpenChange,
    products,
    onSubmit,
    isProcessing,
}: StockMovementFormDialogProps) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors },
    } = useForm<StockMovementFormValues>({
        resolver: zodResolver(stockMovementSchema),
        defaultValues: {
            product_id: '',
            movement_type: 'in',
            qty: '1',
            reason: '',
        },
    });

    const formData = useWatch({ control });

    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Stock Movement</DialogTitle>
                    <DialogDescription>
                        Tambah pergerakan stok produk secara manual.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="product_id">Product</Label>
                        <Select
                            value={formData.product_id}
                            onValueChange={(value) => setValue('product_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem
                                        key={product.id}
                                        value={String(product.id)}
                                    >
                                        {product.name} (Stok: {product.stock})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.product_id?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="movement_type">Movement Type</Label>
                        <Select
                            value={formData.movement_type}
                            onValueChange={(value) =>
                                setValue('movement_type', value as any)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="in">Stock IN (Tambah)</SelectItem>
                                <SelectItem value="out">
                                    Stock OUT (Kurangi)
                                </SelectItem>
                                <SelectItem value="adjustment">
                                    Adjustment (Koreksi)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.movement_type?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="qty">Quantity</Label>
                        <Input
                            id="qty"
                            type="number"
                            min="1"
                            {...register('qty')}
                        />
                        <InputError message={errors.qty?.message} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Input
                            id="reason"
                            {...register('reason')}
                            placeholder="Alasan perubahan stok"
                        />
                        <InputError message={errors.reason?.message} />
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
    );
}
