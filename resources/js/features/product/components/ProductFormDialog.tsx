import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { productSchema } from '@/schemas/product.schema';
import type { ProductForm } from '@/schemas/product.schema';
import type { Category, Product, Unit } from '@/types/models';

interface ProductFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSubmit: (data: ProductForm, productId?: number) => void;
    isProcessing: boolean;
    categories: Category[];
    units: Unit[];
}

export function ProductFormDialog({
    isOpen,
    onOpenChange,
    product,
    onSubmit,
    isProcessing,
    categories,
    units,
}: ProductFormDialogProps) {
    const isEditMode = !!product;
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ProductForm>({
        resolver: zodResolver(productSchema),
    });

    useEffect(() => {
        if (isEditMode && product) {
            reset({
                name: product.name,
                buy_price: String(product.buy_price),
                sell_price: String(product.sell_price),
                stock: String(product.stock),
                min_stock: String(product.min_stock),
                category_id: String(product.category_id),
                unit_id: String(product.unit_id),
                is_active: product.is_active,
            });

            // Use timeout to avoid synchronous state update in effect
            setTimeout(() => {
                setImagePreview(
                    product.image ? `/storage/${product.image}` : null,
                );
            }, 0);
        } else {
            reset({
                name: '',
                buy_price: '',
                sell_price: '',
                stock: '0',
                min_stock: '5',
                category_id: '',
                unit_id: '',
                is_active: true,
            });

            setTimeout(() => {
                setImagePreview(null);
            }, 0);
        }
    }, [product, isEditMode, reset]);

    const handleFormSubmit = (data: ProductForm) => {
        onSubmit(data, product?.id);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size cannot exceed 2MB');
                e.target.value = '';

                return;
            }

            setValue('image', file);

            const reader = new FileReader();

            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };

            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Product' : 'Add Product'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the product information.'
                            : 'Create a new product for your inventory.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {isEditMode && (
                        <div className="grid gap-2">
                            <Label htmlFor="product_code">Product Code</Label>
                            <Input
                                id="product_code"
                                value={product?.product_code || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Coca Cola"
                            {...register('name')}
                        />
                        <InputError message={errors.name?.message} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category_id">Category</Label>
                            <Select
                                onValueChange={(v) =>
                                    setValue('category_id', v)
                                }
                                defaultValue={product?.category_id?.toString()}
                            >
                                <SelectTrigger id="category_id">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="unit_id">Unit</Label>
                            <Select
                                onValueChange={(v) => setValue('unit_id', v)}
                                defaultValue={product?.unit_id?.toString()}
                            >
                                <SelectTrigger id="unit_id">
                                    <SelectValue placeholder="Select Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem
                                            key={unit.id}
                                            value={unit.id.toString()}
                                        >
                                            {unit.name} ({unit.short_name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.unit_id?.message} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="buy_price">Buy Price</Label>
                            <Input
                                id="buy_price"
                                type="number"
                                {...register('buy_price')}
                            />
                            <InputError message={errors.buy_price?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sell_price">Sell Price</Label>
                            <Input
                                id="sell_price"
                                type="number"
                                {...register('sell_price')}
                            />
                            <InputError message={errors.sell_price?.message} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                {...register('stock')}
                            />
                            <InputError message={errors.stock?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="min_stock">Min Stock</Label>
                            <Input
                                id="min_stock"
                                type="number"
                                {...register('min_stock')}
                            />
                            <InputError message={errors.min_stock?.message} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image">Product Image</Label>
                        {imagePreview && (
                            <div className="mb-2 flex items-center gap-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-32 w-32 rounded-lg object-cover"
                                />
                                {isEditMode && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setValue('remove_image', true);
                                            setImagePreview(null);
                                        }}
                                    >
                                        Remove Image
                                    </Button>
                                )}
                            </div>
                        )}
                        {!imagePreview && (
                            <>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Max size: 2MB.
                                </p>
                                <InputError
                                    message={errors.image?.message as string}
                                />
                            </>
                        )}
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
