import { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Minus,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
    X,
} from 'lucide-react';
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
import { useCartStore } from '@/stores/cartStore';
import type { BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    barcode: string;
    name: string;
    buy_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
    is_active: boolean;
    category: { id: number; name: string } | null;
    unit: { id: number; name: string; short_name: string } | null;
}

interface Props {
    [key: string]: unknown;
    products: Product[];
    taxRate: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function POSIndex() {
    const { products, taxRate: initialTaxRate } = usePage<Props>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [amountPaid, setAmountPaid] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

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
    }, [items, initialTaxRate]);

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
        if (total <= 0) return;
        setIsPaymentOpen(true);
        setAmountPaid(String(Math.ceil(total / 1000) * 1000));
    };

    const handleProcessPayment = () => {
        const paid = parseFloat(amountPaid) || 0;

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
                payment_method: 'cash',
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
        if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
            clearCart();
        }
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
                                <button
                                    key={product.id}
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="flex flex-col items-center justify-center rounded-lg border border-sidebar-border/70 bg-background p-3 transition-colors hover:bg-accent disabled:opacity-50"
                                >
                                    <div className="w-full text-center">
                                        <div className="truncate font-medium">
                                            {product.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {product.category?.name ||
                                                'No Category'}
                                        </div>
                                        <div className="mt-1 text-lg font-bold text-primary">
                                            {formatCurrency(product.sell_price)}
                                        </div>
                                        <div
                                            className={`text-xs ${product.stock < product.min_stock ? 'text-red-500' : 'text-muted-foreground'}`}
                                        >
                                            Stok: {product.stock}{' '}
                                            {product.unit?.short_name}
                                        </div>
                                    </div>
                                </button>
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
                                                size="icon"
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
                                                    size="icon"
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
                                                    size="icon"
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
                                className="flex-1"
                                onClick={handleClearCart}
                                disabled={items.length === 0}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                            <Button
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
                            Masukkan jumlah pembayaran dari customer
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-muted p-4">
                            <div className="text-sm text-muted-foreground">
                                Total Pembayaran
                            </div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(total)}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Jumlah Bayar</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                placeholder="Masukkan jumlah..."
                            />
                        </div>

                        {parseFloat(amountPaid) >= total && (
                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900">
                                <div className="text-sm text-green-700 dark:text-green-300">
                                    Kembalian
                                </div>
                                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                                    {formatCurrency(Math.max(0, changeAmount))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsPaymentOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleProcessPayment}
                            disabled={
                                isProcessing || parseFloat(amountPaid) < total
                            }
                        >
                            {isProcessing
                                ? 'Memproses...'
                                : 'Proses Pembayaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
