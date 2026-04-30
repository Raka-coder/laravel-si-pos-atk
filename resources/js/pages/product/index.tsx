import { zodResolver } from '@hookform/resolvers/zod';
import { Head, usePage, router } from '@inertiajs/react';
import { Check, Pencil, Plus, Search, Trash2, Eye } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import InputError from '@/components/input-error';
import { ProductDetailDialog } from '@/components/product-detail-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    buy_price: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Buy price must be a non-negative number',
        }),
    sell_price: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Sell price must be a non-negative number',
        }),
    stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Stock must be a non-negative number',
    }),
    min_stock: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Min stock must be a non-negative number',
        }),
    category_id: z.string().min(1, 'Category is required'),
    unit_id: z.string().min(1, 'Unit is required'),
    is_active: z.boolean(),
    image: z.any().optional(),
    remove_image: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

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
    const [showProduct, setShowProduct] = useState<Product | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(
        null,
    );
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
    }, [searchTerm, filters.search]);

    const {
        register: createRegister,
        handleSubmit: createHandleSubmit,
        setValue: createSetValue,
        control: createControl,
        reset: createReset,
        formState: { errors: createErrors },
    } = useForm<ProductForm>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            buy_price: '',
            sell_price: '',
            stock: '0',
            min_stock: '0',
            category_id: '',
            unit_id: '',
            is_active: true,
        },
    });

    const {
        register: editRegister,
        handleSubmit: editHandleSubmit,
        setValue: editSetValue,
        control: editControl,
        reset: editReset,
        formState: { errors: editErrors },
    } = useForm<ProductForm>({
        resolver: zodResolver(productSchema),
    });

    const createFormData = useWatch({ control: createControl });
    const editFormData = useWatch({ control: editControl });

    const onCreateSubmit = (data: ProductForm) => {
        setIsCreateProcessing(true);
        router.post('/products', data, {
            forceFormData: true,
            onSuccess: () => {
                createReset();
                setImagePreview(null);
                setIsOpen(false);
            },
            onFinish: () => setIsCreateProcessing(false),
        });
    };

    const handleEdit = (product: Product) => {
        setEditProduct(product);
        editReset({
            name: product.name,
            buy_price: String(product.buy_price),
            sell_price: String(product.sell_price),
            stock: String(product.stock),
            min_stock: String(product.min_stock),
            category_id: product.category_id ? String(product.category_id) : '',
            unit_id: product.unit_id ? String(product.unit_id) : '',
            is_active: product.is_active,
            remove_image: false,
        });
        setEditImagePreview(product.image ? `/storage/${product.image}` : null);
    };

    const onEditSubmit = (data: ProductForm) => {
        if (!editProduct) {
            return;
        }

        setIsEditProcessing(true);
        router.post(
            `/products/${editProduct.id}`,
            {
                _method: 'PUT',
                ...data,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    editReset();
                    setEditImagePreview(null);
                    setEditProduct(null);
                },
                onFinish: () => setIsEditProcessing(false),
            },
        );
    };

    const handleDelete = () => {
        if (!deleteProduct) {
            return;
        }

        setIsDeleteProcessing(true);
        router.delete(`/products/${deleteProduct.id}`, {
            onSuccess: () => {
                setDeleteProduct(null);
            },
            onFinish: () => setIsDeleteProcessing(false),
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
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

        return params.toString() ? `?${params.toString()}` : '/products';
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
                                <Plus className="mr-0.5 h-4 w-4" />
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
                                        {...createRegister('name')}
                                        placeholder="Product name"
                                    />
                                    <InputError
                                        message={createErrors.name?.message}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="buy_price">
                                            Buy Price
                                        </Label>
                                        <Input
                                            id="buy_price"
                                            type="number"
                                            {...createRegister('buy_price')}
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={
                                                createErrors.buy_price?.message
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="sell_price">
                                            Sell Price
                                        </Label>
                                        <Input
                                            id="sell_price"
                                            type="number"
                                            {...createRegister('sell_price')}
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={
                                                createErrors.sell_price?.message
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            {...createRegister('stock')}
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={
                                                createErrors.stock?.message
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="min_stock">
                                            Min Stock
                                        </Label>
                                        <Input
                                            id="min_stock"
                                            type="number"
                                            {...createRegister('min_stock')}
                                            placeholder="0"
                                        />
                                        <InputError
                                            message={
                                                createErrors.min_stock?.message
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
                                            value={createFormData.category_id}
                                            onValueChange={(value) =>
                                                createSetValue(
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
                                                createErrors.category_id
                                                    ?.message
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="unit_id">Unit</Label>
                                        <Select
                                            value={createFormData.unit_id}
                                            onValueChange={(value) =>
                                                createSetValue('unit_id', value)
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
                                            message={
                                                createErrors.unit_id?.message
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="create-is_active"
                                            checked={!!createFormData.is_active}
                                            onCheckedChange={(checked) =>
                                                createSetValue(
                                                    'is_active',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="create-is_active"
                                            className="cursor-pointer"
                                        >
                                            Product active
                                        </Label>
                                    </div>
                                    <InputError
                                        message={
                                            createErrors.is_active?.message
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Product Image</Label>
                                    <Input
                                        id="image"
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

                                                createSetValue('image', file);

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
                                        message={
                                            createErrors.image
                                                ?.message as string
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
                                    {isCreateProcessing ? (
                                        'Creating...'
                                    ) : (
                                        <>
                                            <Plus className="mr-0.5 h-4 w-4" />
                                            Create
                                        </>
                                    )}
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
                                <TableRow
                                    key={product.id}
                                    className="cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => setShowProduct(product)}
                                >
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
                                        <div
                                            className="flex items-center justify-end gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
                                                            <Trash2 className="h-4 w-4 text-destructive-foreground" />
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
                                                    ? getPaginationLink(
                                                          products.current_page -
                                                              1,
                                                      )
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
                                                        href={getPaginationLink(
                                                            page,
                                                        )}
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
                                                    ? getPaginationLink(
                                                          products.current_page +
                                                              1,
                                                      )
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
                                value={editProduct?.product_code || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" {...editRegister('name')} />
                            <InputError message={editErrors.name?.message} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-buy_price">
                                    Buy Price
                                </Label>
                                <Input
                                    id="edit-buy_price"
                                    type="number"
                                    {...editRegister('buy_price')}
                                />
                                <InputError
                                    message={editErrors.buy_price?.message}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-sell_price">
                                    Sell Price
                                </Label>
                                <Input
                                    id="edit-sell_price"
                                    type="number"
                                    {...editRegister('sell_price')}
                                />
                                <InputError
                                    message={editErrors.sell_price?.message}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-stock">Stock</Label>
                                <Input
                                    id="edit-stock"
                                    type="number"
                                    {...editRegister('stock')}
                                />
                                <InputError
                                    message={editErrors.stock?.message}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-min_stock">
                                    Min Stock
                                </Label>
                                <Input
                                    id="edit-min_stock"
                                    type="number"
                                    {...editRegister('min_stock')}
                                />
                                <InputError
                                    message={editErrors.min_stock?.message}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category_id">
                                    Category
                                </Label>
                                <Select
                                    value={editFormData.category_id}
                                    onValueChange={(value) =>
                                        editSetValue('category_id', value)
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
                                <InputError
                                    message={editErrors.category_id?.message}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-unit_id">Unit</Label>
                                <Select
                                    value={editFormData.unit_id}
                                    onValueChange={(value) =>
                                        editSetValue('unit_id', value)
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
                                <InputError
                                    message={editErrors.unit_id?.message}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="edit-is_active"
                                    checked={!!editFormData.is_active}
                                    onCheckedChange={(checked) =>
                                        editSetValue(
                                            'is_active',
                                            checked === true,
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="edit-is_active"
                                    className="cursor-pointer"
                                >
                                    Product active
                                </Label>
                            </div>
                            <InputError
                                message={editErrors.is_active?.message}
                            />
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
                                            editSetValue('remove_image', true);
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

                                                editSetValue('image', file);

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
                                        message={
                                            editErrors.image?.message as string
                                        }
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
                            onClick={editHandleSubmit(onEditSubmit)}
                            disabled={isEditProcessing}
                        >
                            {isEditProcessing ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Check className="mr-0.5 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
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
                            Are you sure you want to delete \"
                            {deleteProduct?.name}\"? This action cannot be
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
                            disabled={isDeleteProcessing}
                        >
                            {isDeleteProcessing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Product Detail Modal */}
            <ProductDetailDialog
                product={showProduct}
                open={!!showProduct}
                onOpenChange={(open) => !open && setShowProduct(null)}
            />
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
