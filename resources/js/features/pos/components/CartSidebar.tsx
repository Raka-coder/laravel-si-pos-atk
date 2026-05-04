import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import type { CartItem, CartState } from '@/stores/cartStore';

interface CartSidebarProps {
    cart: CartState;
    taxRate: number;
    handleClearCart: () => void;
    handleCheckout: () => void;
}

export function CartSidebar({
    cart,
    taxRate,
    handleClearCart,
    handleCheckout,
}: CartSidebarProps) {
    const {
        items,
        subtotal,
        taxAmount,
        total,
        removeItem,
        incrementQuantity,
        decrementQuantity,
    } = cart;

    return (
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
                        {items.map((item: CartItem) => (
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
                        <span>PPN ({taxRate}%)</span>
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
    );
}
