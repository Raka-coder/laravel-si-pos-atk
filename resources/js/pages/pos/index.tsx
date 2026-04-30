import { zodResolver } from '@hookform/resolvers/zod';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Info,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
    BanknoteIcon,
    QrCodeIcon,
    CreditCardIcon,
    X,
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
    cancelMidtrans,
    store as storeTransaction,
} from '@/routes/transactions';
import { useCartStore } from '@/stores/cartStore';
import type { BreadcrumbItem } from '@/types';

const posPaymentSchema = z.object({
    payment_method: z.enum(['cash', 'qris', 'midtrans']),
    amount_paid: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Amount paid must be a positive number',
        }),
    note: z.string().optional(),
});

type PosPaymentForm = z.infer<typeof posPaymentSchema>;

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options: {
                    onSuccess: (result: unknown) => void;
                    onPending: (result: unknown) => void;
                    onError: (result: unknown) => void;
                    onClose: () => void;
                },
            ) => void;
        };
    }
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
    category: { id: number; name: string } | null;
    unit: { id: number; name: string; short_name: string } | null;
}

interface Shop {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    logo_path: string | null;
    qris_image_path: string | null;
    tax_rate: number;
}

interface Props {
    [key: string]: unknown;
    products: Product[];
    shop: Shop;
    taxRate: number;
    midtransClientKey?: string;
}

interface MidtransTransactionResponse {
    success: boolean;
    transaction_id: number;
    snap_token?: string;
    redirect_url?: string;
    error?: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function POSIndex() {
    const {
        products,
        shop,
        taxRate: initialTaxRate,
        midtransClientKey,
    } = usePage<Props>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isQrisPopupOpen, setIsQrisPopupOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);

    const {
        items,
        subtotal,
        taxAmount,
        total,
        addItem,
        removeItem,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        calculateTotals,
        getItemsForBackend,
    } = useCartStore();

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<PosPaymentForm>({
        resolver: zodResolver(posPaymentSchema),
        defaultValues: {
            payment_method: 'cash',
            amount_paid: '0',
            note: '',
        },
    });

    const paymentFormData = useWatch({ control }) as PosPaymentForm;

    useEffect(() => {
        calculateTotals(initialTaxRate);
    }, [items, initialTaxRate, calculateTotals]);

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.barcode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === null ||
            product.category?.id === selectedCategory;

        return matchesSearch && matchesCategory && product.stock > 0;
    });

    const categories = [
        ...new Map(products.map((p) => [p.category?.id, p.category])).values(),
    ].filter(Boolean);

    const handleAddToCart = (product: Product) => {
        addItem(product);
    };

    const handleCheckout = () => {
        if (total <= 0) {
            return;
        }

        setIsPaymentOpen(true);
        setValue('payment_method', 'cash');
        setValue('amount_paid', String(Math.ceil(total / 1000) * 1000));
    };

    const handleSelectQris = () => {
        setValue('payment_method', 'qris');
        setIsQrisPopupOpen(true);
    };

    const onPaymentSubmit = async (data: PosPaymentForm) => {
        if (data.payment_method === 'midtrans') {
            if (!midtransClientKey) {
                setPaymentError(
                    'Midtrans belum dikonfigurasi. Cek Client Key di pengaturan toko.',
                );

                return;
            }

            setIsProcessing(true);
            setPaymentError(null);

            try {
                const response = await fetch(storeTransaction.url(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        items: getItemsForBackend(),
                        subtotal,
                        discount_amount: 0,
                        tax_amount: taxAmount,
                        total_price: total,
                        payment_method: data.payment_method,
                        amount_paid: total,
                        change_amount: 0,
                        note: data.note || '',
                    }),
                });

                const resData: MidtransTransactionResponse =
                    await response.json();

                if (resData.success && resData.snap_token) {
                    const snapToken = resData.snap_token;
                    const transactionId = resData.transaction_id;

                    if (!window.snap) {
                        if (resData.redirect_url) {
                            window.location.assign(resData.redirect_url);

                            return;
                        }

                        setPaymentError(
                            'Snap belum siap. Muat ulang halaman lalu coba lagi.',
                        );
                        setIsProcessing(false);

                        return;
                    }

                    setIsPaymentOpen(false);

                    window.setTimeout(() => {
                        window.snap?.pay(snapToken, {
                            onSuccess: function () {
                                setIsProcessing(false);
                                clearCart();
                                router.visit(
                                    `/transactions/${resData.transaction_id}`,
                                );
                            },
                            onPending: function () {
                                setIsProcessing(false);
                                clearCart();
                                router.visit(
                                    `/transactions/${resData.transaction_id}`,
                                );
                            },
                            onError: function () {
                                setPaymentError(
                                    'Pembayaran gagal. Silakan coba lagi.',
                                );
                                fetch(
                                    cancelMidtrans.url({
                                        transaction: transactionId,
                                    }),
                                    {
                                        method: 'DELETE',
                                        headers: {
                                            'X-CSRF-TOKEN':
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]',
                                                    )
                                                    ?.getAttribute('content') ||
                                                '',
                                        },
                                    },
                                ).catch(() => null);
                                setIsProcessing(false);
                                setIsPaymentOpen(true);
                            },
                            onClose: function () {
                                setPaymentError('Pembayaran dibatalkan.');
                                fetch(
                                    cancelMidtrans.url({
                                        transaction: transactionId,
                                    }),
                                    {
                                        method: 'DELETE',
                                        headers: {
                                            'X-CSRF-TOKEN':
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]',
                                                    )
                                                    ?.getAttribute('content') ||
                                                '',
                                        },
                                    },
                                ).catch(() => null);
                                setIsProcessing(false);
                                setIsPaymentOpen(true);
                            },
                        });
                    }, 100);
                } else {
                    setPaymentError(
                        resData.error || 'Gagal memulai pembayaran',
                    );
                    setIsProcessing(false);
                }
            } catch {
                setPaymentError('Terjadi kesalahan. Silakan coba lagi.');
                setIsProcessing(false);
            }

            return;
        }

        if (data.payment_method === 'qris' && !shop.qris_image_path) {
            setPaymentError(
                'QR Code QRIS belum diunggah. Hubungi admin untuk upload QR Code di Pengaturan Toko.',
            );

            return;
        }

        const paid =
            data.payment_method === 'qris'
                ? total
                : parseFloat(data.amount_paid) || 0;

        if (paid < total) {
            alert('Jumlah pembayaran kurang!');

            return;
        }

        setIsProcessing(true);

        router.post(
            '/transactions',
            {
                items: getItemsForBackend(),
                subtotal,
                discount_amount: 0,
                tax_amount: taxAmount,
                total_price: total,
                payment_method: data.payment_method,
                amount_paid: paid,
                change_amount: paid - total,
                note: data.note || '',
            },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsPaymentOpen(false);
                    clearCart();
                },
            },
        );
    };

    const handleClearCart = () => {
        setIsClearCartDialogOpen(true);
    };

    const confirmClearCart = () => {
        clearCart();
        setIsClearCartDialogOpen(false);
    };

    const changeAmount = parseFloat(paymentFormData.amount_paid) - total;

    return (
        <>
            <Head title="POS - Point of Sale" />

            <div className="flex h-full flex-1 gap-4 overflow-hidden rounded-xl p-4">
                {/* Product Grid */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Search and Filters */}
                    <div className="mb-4 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button
                            variant={
                                selectedCategory === null
                                    ? 'default'
                                    : 'outline'
                            }
                            size="lg"
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </Button>
                        {categories.map((category: any) => (
                            <Button
                                key={category?.id}
                                variant={
                                    selectedCategory === category?.id
                                        ? 'default'
                                        : 'outline'
                                }
                                size="lg"
                                onClick={() =>
                                    setSelectedCategory(category?.id)
                                }
                            >
                                {category?.name}
                            </Button>
                        ))}
                    </div>

                    {/* Products */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {filteredProducts.map((product) => (
                                <Button
                                    key={product.id}
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock <= 0}
                                    variant="outline"
                                    className="flex h-auto flex-col items-center justify-center rounded-lg border border-sidebar-border/70 bg-background p-3 transition-colors hover:bg-accent disabled:opacity-50"
                                >
                                    <div className="mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted-foreground/10">
                                                <span className="text-xs text-muted-foreground">
                                                    No Img
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full text-center">
                                        <div className="truncate font-medium">
                                            {product.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {product.category?.name ||
                                                'No Category'}
                                        </div>
                                        <div className="mt-1 font-bold text-primary">
                                            {formatCurrency(product.sell_price)}
                                        </div>
                                        <div
                                            className={`text-xs ${product.stock < product.min_stock ? 'text-red-500' : 'text-muted-foreground'}`}
                                        >
                                            Stok: {product.stock}{' '}
                                            {product.unit?.short_name}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                Tidak ada produk ditemukan
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart Sidebar */}
                <div className="flex w-80 flex-col rounded-xl border border-sidebar-border/70 bg-background">
                    <div className="flex items-center justify-between border-b p-4">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="font-semibold">Keranjang</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {items.length} items
                        </span>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                Keranjang kosong
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div
                                        key={item.product.id}
                                        className="flex flex-col gap-2 rounded-lg border p-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="truncate font-medium">
                                                    {item.product.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatCurrency(
                                                        item.product.sell_price,
                                                    )}{' '}
                                                    x {item.quantity}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="lg"
                                                className="h-6 w-6"
                                                onClick={() =>
                                                    removeItem(item.product.id)
                                                }
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        decrementQuantity(
                                                            item.product.id,
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-12 text-center">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        incrementQuantity(
                                                            item.product.id,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="font-semibold">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="border-t p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>PPN ({initialTaxRate}%)</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1"
                                onClick={handleClearCart}
                                disabled={items.length === 0}
                            >
                                <Trash2 className="mr-0.5 h-4 w-4" />
                                Clear
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleCheckout}
                                disabled={items.length === 0}
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pembayaran</DialogTitle>
                        <DialogDescription>
                            Pilih metode pembayaran
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Payment Method Selection */}
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setValue('payment_method', 'cash')
                                }
                                className={cn(
                                    'flex h-auto flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent',
                                    paymentFormData.payment_method === 'cash'
                                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                        : 'border-border text-muted-foreground',
                                )}
                            >
                                <BanknoteIcon className="h-6 w-6" />
                                <span className="text-center text-xs leading-tight font-bold tracking-wider uppercase">
                                    Tunai
                                </span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSelectQris}
                                className={cn(
                                    'flex h-auto flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent',
                                    paymentFormData.payment_method === 'qris'
                                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                        : 'border-border text-muted-foreground',
                                )}
                            >
                                <QrCodeIcon className="h-6 w-6" />
                                <span className="text-center text-xs leading-tight font-bold tracking-wider uppercase">
                                    QRIS
                                </span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setValue('payment_method', 'midtrans')
                                }
                                className={cn(
                                    'flex h-auto flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent',
                                    paymentFormData.payment_method ===
                                        'midtrans'
                                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                        : 'border-border text-muted-foreground',
                                )}
                            >
                                <CreditCardIcon className="h-6 w-6" />
                                <span className="text-center text-xs leading-tight font-bold tracking-wider uppercase">
                                    Midtrans
                                </span>
                            </Button>
                        </div>

                        {/* Total Display */}
                        <div className="rounded-lg bg-muted p-4">
                            <div className="text-sm text-muted-foreground">
                                Total Pembayaran
                            </div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(total)}
                            </div>
                        </div>

                        {/* Cash Payment Fields */}
                        {paymentFormData.payment_method === 'cash' && (
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Jumlah Bayar</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    {...register('amount_paid')}
                                    placeholder="Masukkan jumlah..."
                                />
                                <InputError
                                    message={errors.amount_paid?.message}
                                />
                                {parseFloat(paymentFormData.amount_paid) >=
                                    total && (
                                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900">
                                        <div className="text-sm text-green-700 dark:text-green-300">
                                            Kembalian
                                        </div>
                                        <div className="text-lg font-bold text-green-700 dark:text-green-300">
                                            {formatCurrency(
                                                Math.max(0, changeAmount),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* QRIS Static Info */}
                        {paymentFormData.payment_method === 'qris' && (
                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    Bayar dengan QRIS Static
                                </div>
                                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                    Scan QR Code dan pastikan pembayaran
                                    berhasil di aplikasi pelanggan.
                                </div>
                            </div>
                        )}

                        {/* Midtrans Info */}
                        {paymentFormData.payment_method === 'midtrans' && (
                            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                                <div className="text-sm text-purple-700 dark:text-purple-300">
                                    Bayar dengan Midtrans
                                </div>
                                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                                    Klik "Proses Pembayaran" untuk membuka Snap
                                    popup (Kartu, GoPay, ShopeePay, dll)
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {paymentError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                                {paymentError}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setIsPaymentOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleSubmit(onPaymentSubmit)}
                            disabled={
                                isProcessing ||
                                (paymentFormData.payment_method === 'cash' &&
                                    parseFloat(paymentFormData.amount_paid) <
                                        total)
                            }
                        >
                            {isProcessing
                                ? 'Memproses...'
                                : 'Proses Pembayaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QRIS Image Sheet - Compact & Professional */}
            <Sheet open={isQrisPopupOpen} onOpenChange={setIsQrisPopupOpen}>
                <SheetContent className="p-0 sm:max-w-md" side="right">
                    <div className="flex h-full flex-col">
                        <SheetHeader className="border-b p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <SheetTitle className="text-xl font-black tracking-tight">
                                        QRIS Payment
                                    </SheetTitle>
                                    <SheetDescription>
                                        Scan using e-wallet atau mobile banking
                                    </SheetDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="h-6 rounded-md border-primary/20 bg-primary/5 px-2 text-[10px] font-bold tracking-widest text-primary uppercase"
                                >
                                    Static QR
                                </Badge>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-4 p-4">
                                {/* Amount - Enhanced */}
                                <div className="rounded-2xl text-center">
                                    <div className="mb-1 text-[10px] font-semibold text-muted-foreground uppercase">
                                        Total Amount Due
                                    </div>
                                    <div className="text-3xl font-black text-foreground tabular-nums">
                                        {formatCurrency(total)}
                                    </div>
                                </div>

                                {/* QR Code Area */}
                                <div className="flex flex-col items-center gap-6">
                                    {shop.qris_image_path ? (
                                        <div className="group relative">
                                            <div className="absolute -inset-4 rounded-[2.5rem] bg-primary/5 opacity-50 blur-2xl" />
                                            <div className="relative rounded-2xl border-4 border-background bg-background p-4 shadow-2xl">
                                                <img
                                                    src={`/storage/${shop.qris_image_path}`}
                                                    alt="QRIS Code"
                                                    className="h-56 w-56 object-contain"
                                                />
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                                                    <Badge className="h-6 rounded-full px-4 text-[10px] font-bold tracking-widest uppercase shadow-lg">
                                                        QRIS
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-muted/30 py-16">
                                            <div className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
                                                <QrCodeIcon className="h-10 w-10 text-muted-foreground/40" />
                                            </div>
                                            <div className="space-y-1 text-center">
                                                <p className="text-sm font-bold text-foreground">
                                                    QR Code Not Available
                                                </p>
                                                <p className="mx-auto max-w-50 text-xs text-muted-foreground">
                                                    Please upload your QRIS code
                                                    in the shop settings to
                                                    enable this method.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Instructions - Refined */}
                                {shop.qris_image_path && (
                                    <div className="space-y-2 pt-4">
                                        <h4 className="flex items-center gap-2 text-xs font-bold tracking-widest text-foreground uppercase">
                                            <Info className="h-4 w-4 text-primary" />
                                            Payment Steps
                                        </h4>
                                        <div className="grid gap-2">
                                            {[
                                                'Buka aplikasi e-wallet atau mobile banking',
                                                'Pilih menu "Scan QR" atau "Bayar"',
                                                'Scan QR Code yang muncul di atas',
                                                `Pastikan nominal sesuai: ${formatCurrency(total)}`,
                                                'Selesaikan transaksi di aplikasi Anda',
                                            ].map((step, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 rounded-xl border border-border/30 bg-muted/30 p-2"
                                                >
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-xs leading-snug font-medium text-foreground/80">
                                                        {step}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t p-4">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => {
                                        setIsQrisPopupOpen(false);
                                        setValue('payment_method', 'cash');
                                    }}
                                    className="w-full text-[11px] font-bold tracking-wider uppercase sm:flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="lg"
                                    variant="default"
                                    onClick={handleSubmit(onPaymentSubmit)}
                                    disabled={
                                        !shop.qris_image_path || isProcessing
                                    }
                                    className="w-full text-[11px] font-bold tracking-wider uppercase shadow-lg shadow-primary/20 sm:flex-1"
                                >
                                    {!shop.qris_image_path ? (
                                        'QR Not Available'
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-0.5 h-4 w-4" />
                                            Sudah Bayar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Clear Cart Confirmation Dialog */}
            <AlertDialog
                open={isClearCartDialogOpen}
                onOpenChange={setIsClearCartDialogOpen}
            >
                <AlertDialogContent>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 h-6 w-6"
                        onClick={() => setIsClearCartDialogOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Cart</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to clear the cart? All items
                            will be removed and this action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmClearCart}>
                            Clear
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

POSIndex.layout = {
    breadcrumbs: [
        {
            title: 'POS',
            href: '/pos',
        },
    ] as BreadcrumbItem[],
};
