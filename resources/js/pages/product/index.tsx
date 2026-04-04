import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
}

interface Unit {
    id: number;
    name: string;
    short_name: string;
}

interface Product {
    id: number;
    product_code: string;
    barcode: string | null;
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
    [key: string]: unknown;
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    units: Unit[];
    filters: {
        search: string;
    };
}

export default function ProductIndex() {
    const { products, categories, units, filters } = usePage<Props>().props;

    const [isOpen, setIsOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/products',
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
        buy_price: '',
        sell_price: '',
        stock: '0',
        min_stock: '0',
        category_id: '',
        unit_id: '',
        is_active: true,
        image: null as File | null,
    });

    const editForm = useForm({
        product_code: '',
        name: '',
        buy_price: '',
        sell_price: '',
        stock: 0,
        min_stock: 0,
        category_id: '',
        unit_id: '',
        is_active: true,
        image: null as File | null,
        remove_image: false,
    });

    const deleteForm = useForm({});

    const handleCreate = () => {
        const formData = new FormData();
        formData.append('name', createForm.data.name);
        formData.append('buy_price', createForm.data.buy_price);
        formData.append('sell_price', createForm.data.sell_price);
        formData.append('stock', createForm.data.stock);
        formData.append('min_stock', createForm.data.min_stock);
        formData.append('category_id', createForm.data.category_id);
        formData.append('unit_id', createForm.data.unit_id);
        formData.append('is_active', createForm.data.is_active ? '1' : '0');

        if (createForm.data.image) {
            formData.append('image', createForm.data.image);
        }

        createForm.post('/products', {
            forceFormData: true,
            onSuccess: () => {
                createForm.reset();
                setImagePreview(null);
                setIsOpen(false);
            },
        });
    };

    const handleEdit = (product: Product) => {
        setEditProduct(product);
        editForm.setData({
            product_code: product.product_code,
            name: product.name,
            buy_price: String(product.buy_price),
            sell_price: String(product.sell_price),
            stock: product.stock,
            min_stock: product.min_stock,
            category_id: product.category_id ? String(product.category_id) : '',
            unit_id: product.unit_id ? String(product.unit_id) : '',
            is_active: product.is_active,
            image: null,
            remove_image: false,
        });
        setEditImagePreview(product.image ? `/storage/${product.image}` : null);
    };

    const handleUpdate = () => {
        if (!editProduct) {
            return;
        }

        const formData = new FormData();
        formData.append('name', editForm.data.name);
        formData.append('buy_price', editForm.data.buy_price);
        formData.append('sell_price', editForm.data.sell_price);
        formData.append('stock', String(editForm.data.stock));
        formData.append('min_stock', String(editForm.data.min_stock));
        formData.append('category_id', editForm.data.category_id);
        formData.append('unit_id', editForm.data.unit_id);
        formData.append('is_active', editForm.data.is_active ? '1' : '0');

        if (editForm.data.image) {
            formData.append('image', editForm.data.image);
        }

        if (editForm.data.remove_image) {
            formData.append('remove_image', '1');
        }

        // Add _method for PUT request (Laravel method spoofing)
        formData.append('_method', 'PUT');

        // Use router directly for PUT request with FormData
        router.post(`/products/${editProduct.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                editForm.setData('remove_image', false);
                setEditImagePreview(null);
                setEditProduct(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deleteProduct) {
            return;
        }

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
                            <Button size="lg">
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
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Product Image</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (file) {
                                                // Validate file size (max 2MB)
                                                if (
                                                    file.size >
                                                    2 * 1024 * 1024
                                                ) {
                                                    alert(
                                                        'Ukuran gambar tidak boleh lebih dari 2MB',
                                                    );

                                                    e.target.value = '';

                                                    return;
                                                }

                                                createForm.setData(
                                                    'image',
                                                    file,
                                                );

                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setImagePreview(
                                                        event.target
                                                            ?.result as string,
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Max size: 2MB. Format: JPG, PNG, GIF,
                                        WEBP. Image akan di-optimasi otomatis.
                                    </p>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-32 w-32 rounded-lg object-cover"
                                            />
                                        </div>
                                    )}

                                    <InputError
                                        message={createForm.errors.image}
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
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSearchTerm(e.target.value);
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Product Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="text-right">
                                    Buy
                                </TableHead>
                                <TableHead className="text-right">
                                    Sell
                                </TableHead>
                                <TableHead className="text-right">
                                    Stock
                                </TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                                <span className="text-xs text-muted-foreground">
                                                    No Image
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {product.product_code}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {product.category?.name || '-'}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {product.unit?.short_name || '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {formatCurrency(product.buy_price)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {formatCurrency(product.sell_price)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
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
                                    </TableCell>
                                    <TableCell className="text-center">
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
                                                                    product,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Edit Product</p>
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
                                                                setDeleteProduct(
                                                                    product,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Delete Product</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {products.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No products found. Create one to get
                                        started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {products.last_page >= 1 && (
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                products.current_page > 1
                                                    ? `?page=${products.current_page - 1}${filters.search ? `&search=${filters.search}` : ''}`
                                                    : undefined
                                            }
                                            className={
                                                products.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from(
                                        { length: products.last_page },
                                        (_, i) => i + 1,
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === products.last_page ||
                                                Math.abs(
                                                    page -
                                                        products.current_page,
                                                ) <= 2,
                                        )
                                        .map((page, index, array) => (
                                            <PaginationItem key={page}>
                                                {index > 0 &&
                                                page - array[index - 1] > 1 ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href={`?page=${page}${filters.search ? `&search=${filters.search}` : ''}`}
                                                        isActive={
                                                            page ===
                                                            products.current_page
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
                                                products.current_page <
                                                products.last_page
                                                    ? `?page=${products.current_page + 1}${filters.search ? `&search=${filters.search}` : ''}`
                                                    : undefined
                                            }
                                            className={
                                                products.current_page >=
                                                products.last_page
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
                            <Label htmlFor="edit-product_code">
                                Product Code
                            </Label>
                            <Input
                                id="edit-product_code"
                                name="product_code"
                                value={editForm.data.product_code}
                                disabled
                                className="bg-muted"
                            />
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
                        <div className="grid gap-2">
                            <Label htmlFor="edit-image">Product Image</Label>
                            {editImagePreview && (
                                <div className="mb-2 flex items-center gap-4">
                                    <img
                                        src={editImagePreview}
                                        alt="Current image"
                                        className="h-32 w-32 rounded-lg object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            editForm.setData(
                                                'remove_image',
                                                true,
                                            );
                                            setEditImagePreview(null);
                                        }}
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            )}
                            {!editImagePreview && (
                                <>
                                    <Input
                                        id="edit-image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (file) {
                                                // Validate file size (max 2MB)
                                                if (
                                                    file.size >
                                                    2 * 1024 * 1024
                                                ) {
                                                    alert(
                                                        'Ukuran gambar tidak boleh lebih dari 2MB',
                                                    );

                                                    e.target.value = '';

                                                    return;
                                                }

                                                editForm.setData('image', file);

                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setEditImagePreview(
                                                        event.target
                                                            ?.result as string,
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Max size: 2MB. Format: JPG, PNG, GIF,
                                        WEBP. Image akan di-optimasi otomatis.
                                    </p>
                                    <InputError
                                        message={editForm.errors.image}
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

ProductIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: '/products',
        },
    ] as BreadcrumbItem[],
};
