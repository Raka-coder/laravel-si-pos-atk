import { Head, usePage, router } from '@inertiajs/react';
import {
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
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cartStore';
import type { BreadcrumbItem } from '@/types';

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
    const [amountPaid, setAmountPaid] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<
        'cash' | 'qris' | 'midtrans'
    >('cash');
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
        setPaymentMethod('cash');
        setAmountPaid(String(Math.ceil(total / 1000) * 1000));
    };

    const handleSelectQris = () => {
        setPaymentMethod('qris');
        // Always open QRIS popup when QRIS is selected
        setIsQrisPopupOpen(true);
    };

    const handleProcessPayment = async () => {
        // For Midtrans handle differently
        if (paymentMethod === 'midtrans') {
            if (!midtransClientKey) {
                setPaymentError(
                    'Midtrans belum dikonfigurasi. Cek Client Key di pengaturan toko.',
                );

                return;
            }

            setIsProcessing(true);
            setPaymentError(null);

            try {
                const response = await fetch('/transactions', {
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
                        payment_method: paymentMethod,
                        amount_paid: total,
                        change_amount: 0,
                        note: '',
                    }),
                });

                const data: MidtransTransactionResponse = await response.json();

                if (data.success && data.snap_token) {
                    const snapToken = data.snap_token;

                    localStorage.setItem(
                        'pending_transaction_id',
                        String(data.transaction_id),
                    );

                    if (!window.snap) {
                        if (data.redirect_url) {
                            window.location.href = data.redirect_url;

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
                            onSuccess: function (_result: unknown) {
                                console.log('Payment success:', _result);
                                setIsProcessing(false);
                                clearCart();
                                localStorage.removeItem(
                                    'pending_transaction_id',
                                );
                                router.visit(
                                    `/transactions/${data.transaction_id}`,
                                );
                            },
                            onPending: function (_result: unknown) {
                                console.log('Payment pending:', _result);
                                setIsProcessing(false);
                                clearCart();
                                localStorage.removeItem(
                                    'pending_transaction_id',
                                );
                                router.visit(
                                    `/transactions/${data.transaction_id}`,
                                );
                            },
                            onError: function (_result: unknown) {
                                console.log('Payment error:', _result);
                                setPaymentError(
                                    'Pembayaran gagal. Silakan coba lagi.',
                                );
                                setIsProcessing(false);
                                setIsPaymentOpen(true);
                            },
                            onClose: function () {
                                setPaymentError('Pembayaran dibatalkan.');
                                setIsProcessing(false);
                                setIsPaymentOpen(true);
                            },
                        });
                    }, 100);
                } else {
                    setPaymentError(data.error || 'Gagal memulai pembayaran');
                    setIsProcessing(false);
                }
            } catch {
                setPaymentError('Terjadi kesalahan. Silakan coba lagi.');
                setIsProcessing(false);
            }

            return;
        }

        // For cash or static qris payment
        if (paymentMethod === 'qris' && !shop.qris_image_path) {
            setPaymentError(
                'QR Code QRIS belum diunggah. Hubungi admin untuk upload QR Code di Pengaturan Toko.',
            );

            return;
        }

        const paid =
            paymentMethod === 'qris' ? total : parseFloat(amountPaid) || 0;

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
                payment_method: paymentMethod,
                amount_paid: paid,
                change_amount: paid - total,
                note: '',
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

    const changeAmount = parseFloat(amountPaid) - total;

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
                                <Trash2 className="mr-2 h-4 w-4" />
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
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                                    paymentMethod === 'cash'
                                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950'
                                        : 'border-border bg-background text-muted-foreground hover:border-green-300'
                                }`}
                            >
                                <BanknoteIcon />
                                <span className="text-sm font-medium">
                                    Tunai
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSelectQris}
                                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                                    paymentMethod === 'qris'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950'
                                        : 'border-border bg-background text-muted-foreground hover:border-blue-300'
                                }`}
                            >
                                <QrCodeIcon className="text-2xl" />
                                <span className="text-sm font-medium">
                                    QRIS
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('midtrans')}
                                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                                    paymentMethod === 'midtrans'
                                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950'
                                        : 'border-border bg-background text-muted-foreground hover:border-purple-300'
                                }`}
                            >
                                <CreditCardIcon className="text-2xl" />
                                <span className="text-sm font-medium">
                                    Midtrans
                                </span>
                            </button>
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
                        {paymentMethod === 'cash' && (
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Jumlah Bayar</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) =>
                                        setAmountPaid(e.target.value)
                                    }
                                    placeholder="Masukkan jumlah..."
                                />
                                {parseFloat(amountPaid) >= total && (
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
                        {paymentMethod === 'qris' && (
                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    Bayar dengan QRIS Static
                                </div>
                                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                    Scan QR Code dan pastikan pembayaran berhasil
                                    di aplikasi pelanggan.
                                </div>
                            </div>
                        )}

                        {/* Midtrans Info */}
                        {paymentMethod === 'midtrans' && (
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
                            onClick={handleProcessPayment}
                            disabled={
                                isProcessing ||
                                (paymentMethod === 'cash' &&
                                    parseFloat(amountPaid) < total)
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
                <SheetContent className="w-90 sm:max-w-none" side="right">
                    <SheetHeader className="pb-3">
                        <div className="flex items-center">
                            <SheetTitle>QRIS Payment</SheetTitle>
                            <Badge variant="secondary" className="text-xs ml-2">
                                Static QR
                            </Badge>
                        </div>
                        <SheetDescription>
                            Scan menggunakan e-wallet atau mobile banking
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col gap-4 overflow-y-auto py-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        {/* Amount - Compact */}
                        <div className="rounded-lg bg-primary/5 p-3 text-center">
                            <div className="text-xs font-medium text-muted-foreground">
                                Total
                            </div>
                            <div className="mt-0.5 text-2xl font-bold text-primary">
                                {formatCurrency(total)}
                            </div>
                        </div>

                        {/* QR Code - Compact */}
                        {shop.qris_image_path ? (
                            <div className="flex justify-center">
                                <div className="relative rounded-lg border bg-background p-2 shadow-sm">
                                    <img
                                        src={`/storage/${shop.qris_image_path}`}
                                        alt="QRIS Code"
                                        className="h-48 w-48 object-contain"
                                    />
                                    <Badge className="absolute -top-2 -right-2 h-6 px-2">
                                        QRIS
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/30 bg-destructive/5 py-10">
                                <QrCodeIcon className="mb-2 h-10 w-10 text-destructive/50" />
                                <div className="text-center">
                                    <div className="text-sm font-medium text-destructive">
                                        QR Code Belum Tersedia
                                    </div>
                                    <a
                                        href="/shop"
                                        className="mt-1 inline-block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                                    >
                                        Upload di Pengaturan Toko →
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Instructions - Compact */}
                        {shop.qris_image_path && (
                            <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                                <div className="text-xs font-semibold text-foreground">
                                    Cara Pembayaran:
                                </div>
                                <ol className="space-y-1 text-xs text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                            1
                                        </span>
                                        <span>Buka e-wallet atau mobile banking</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                            2
                                        </span>
                                        <span>Pilih scan QR</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                            3
                                        </span>
                                        <span>Scan QR code di atas</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                            4
                                        </span>
                                        <span>
                                            Pastikan nominal{' '}
                                            <span className="font-medium text-foreground">
                                                {formatCurrency(total)}
                                            </span>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                                            5
                                        </span>
                                        <span>Selesaikan pembayaran</span>
                                    </li>
                                </ol>
                            </div>
                        )}
                    </div>

                    <SheetFooter className="flex-col gap-3 border-t pt-4 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsQrisPopupOpen(false);
                                setPaymentMethod('cash');
                            }}
                            className="w-full sm:flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={() => {
                                setIsQrisPopupOpen(false);
                                handleProcessPayment();
                            }}
                            disabled={!shop.qris_image_path}
                            className="w-full sm:flex-1"
                        >
                            {!shop.qris_image_path ? (
                                'QR Belum Tersedia'
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    Sudah Bayar
                                </>
                            )}
                        </Button>
                    </SheetFooter>
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
