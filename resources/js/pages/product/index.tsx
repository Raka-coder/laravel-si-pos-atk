import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import type { BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    short_name: string;
}

interface Product {
    id: number;
    barcode: string;
    name: string;
    buy_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
    image: string | null;
    is_active: boolean;
    category_id: number | null;
    unit_id: number | null;
    category: Category | null;
    unit: Unit | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    products: Product[];
    categories: Category[];
    units: Unit[];
}

export default function ProductIndex() {
    const { products, categories, units } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

    const createForm = useForm({
        barcode: '',
        name: '',
        buy_price: '',
        sell_price: '',
        stock: '0',
        min_stock: '0',
        category_id: '',
        unit_id: '',
        is_active: true,
    });

    const editForm = useForm({
        barcode: '',
        name: '',
        buy_price: '',
        sell_price: '',
        stock: 0,
        min_stock: 0,
        category_id: '',
        unit_id: '',
        is_active: true,
    });

    const deleteForm = useForm({});

    const handleCreate = () => {
        createForm.post('/products', {
            onSuccess: () => {
                createForm.reset();
                setIsOpen(false);
            },
        });
    };

    const handleEdit = (product: Product) => {
        setEditProduct(product);
        editForm.setData({
            barcode: product.barcode,
            name: product.name,
            buy_price: String(product.buy_price),
            sell_price: String(product.sell_price),
            stock: product.stock,
            min_stock: product.min_stock,
            category_id: product.category_id ? String(product.category_id) : '',
            unit_id: product.unit_id ? String(product.unit_id) : '',
            is_active: product.is_active,
        });
    };

    const handleUpdate = () => {
        if (!editProduct) return;
        editForm.patch(`/products/${editProduct.id}`, {
            onSuccess: () => {
                editForm.reset();
                setEditProduct(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteProduct) return;
        deleteForm.delete(`/products/${deleteProduct.id}`, {
            onSuccess: () => {
                setDeleteProduct(null);
            },
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(value);
    };

    return (
        <>
            <Head title="Products" />

            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Products</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>
                                    Create a new product in the inventory.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="barcode">Barcode</Label>
                                    <Input
                                        id="barcode"
                                        name="barcode"
                                        value={createForm.data.barcode}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'barcode',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Product barcode"
                                    />
                                    <InputError
                                        message={createForm.errors.barcode}
                                    />
                                </div>
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
                                        placeholder="Product name"
                                    />
                                    <InputError
                                        message={createForm.errors.name}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="buy_price">
                                            Buy Price
                                        </Label>
                                        <Input
                                            id="buy_price"
                                            name="buy_price"
                                            type="number"
                                            value={createForm.data.buy_price}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'buy_price',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={
                                                createForm.errors.buy_price
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="sell_price">
                                            Sell Price
                                        </Label>
                                        <Input
                                            id="sell_price"
                                            name="sell_price"
                                            type="number"
                                            value={createForm.data.sell_price}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'sell_price',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={
                                                createForm.errors.sell_price
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            value={createForm.data.stock}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'stock',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={createForm.errors.stock}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_stock">
                                            Min Stock
                                        </Label>
                                        <Input
                                            id="min_stock"
                                            name="min_stock"
                                            type="number"
                                            value={createForm.data.min_stock}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'min_stock',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={
                                                createForm.errors.min_stock
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category_id">
                                            Category
                                        </Label>
                                        <Select
                                            value={createForm.data.category_id}
                                            onValueChange={(value) =>
                                                createForm.setData(
                                                    'category_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={String(
                                                            category.id,
                                                        )}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                createForm.errors.category_id
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="unit_id">Unit</Label>
                                        <Select
                                            value={createForm.data.unit_id}
                                            onValueChange={(value) =>
                                                createForm.setData(
                                                    'unit_id',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem
                                                        key={unit.id}
                                                        value={String(unit.id)}
                                                    >
                                                        {unit.name} (
                                                        {unit.short_name})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={createForm.errors.unit_id}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
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
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Barcode
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Unit
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Buy
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Sell
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Stock
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 font-mono text-sm">
                                            {product.barcode}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {product.category?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {product.unit?.short_name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {formatCurrency(product.buy_price)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {formatCurrency(product.sell_price)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <span
                                                className={
                                                    product.stock <
                                                    product.min_stock
                                                        ? 'font-medium text-red-500'
                                                        : ''
                                                }
                                            >
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-medium ${
                                                    product.is_active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                }`}
                                            >
                                                {product.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(product)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteProduct(
                                                            product,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No products found. Create one to get
                                            started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog
                open={!!editProduct}
                onOpenChange={(open) => !open && setEditProduct(null)}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update the product information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-barcode">Barcode</Label>
                            <Input
                                id="edit-barcode"
                                name="barcode"
                                value={editForm.data.barcode}
                                onChange={(e) =>
                                    editForm.setData('barcode', e.target.value)
                                }
                            />
                            <InputError message={editForm.errors.barcode} />
                        </div>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-buy_price">
                                    Buy Price
                                </Label>
                                <Input
                                    id="edit-buy_price"
                                    name="buy_price"
                                    type="number"
                                    value={editForm.data.buy_price}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'buy_price',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={editForm.errors.buy_price}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-sell_price">
                                    Sell Price
                                </Label>
                                <Input
                                    id="edit-sell_price"
                                    name="sell_price"
                                    type="number"
                                    value={editForm.data.sell_price}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'sell_price',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={editForm.errors.sell_price}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-stock">Stock</Label>
                                <Input
                                    id="edit-stock"
                                    name="stock"
                                    type="number"
                                    value={editForm.data.stock}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'stock',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                />
                                <InputError message={editForm.errors.stock} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-min_stock">
                                    Min Stock
                                </Label>
                                <Input
                                    id="edit-min_stock"
                                    name="min_stock"
                                    type="number"
                                    value={editForm.data.min_stock}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'min_stock',
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                />
                                <InputError
                                    message={editForm.errors.min_stock}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category_id">
                                    Category
                                </Label>
                                <Select
                                    value={editForm.data.category_id}
                                    onValueChange={(value) =>
                                        editForm.setData('category_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-unit_id">Unit</Label>
                                <Select
                                    value={editForm.data.unit_id}
                                    onValueChange={(value) =>
                                        editForm.setData('unit_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem
                                                key={unit.id}
                                                value={String(unit.id)}
                                            >
                                                {unit.name} ({unit.short_name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
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
                open={!!deleteProduct}
                onOpenChange={(open) => !open && setDeleteProduct(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {deleteProduct?.name}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
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

ProductIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
    ],
} satisfies BreadcrumbItem[];
