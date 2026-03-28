import { create } from 'zustand';

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

interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    subtotal: number;
}

interface CartStore {
    items: CartItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    taxRate: number;
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    incrementQuantity: (productId: number) => void;
    decrementQuantity: (productId: number) => void;
    clearCart: () => void;
    calculateTotals: (taxRate: number) => void;
    getItemsForBackend: () => Array<{
        product_id: number;
        quantity: number;
        price_sell: number;
        price_buy_snapshot: number;
        subtotal: number;
    }>;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    taxRate: 11,

    addItem: (product: Product) => {
        const { items, calculateTotals, taxRate } = get();

        const existingItem = items.find(
            (item) => item.product.id === product.id,
        );

        if (existingItem) {
            if (existingItem.quantity >= product.stock) return;

            const updatedItems = items.map((item) =>
                item.product.id === product.id
                    ? {
                          ...item,
                          quantity: item.quantity + 1,
                          subtotal:
                              (item.quantity + 1) * item.product.sell_price,
                      }
                    : item,
            );
            set({ items: updatedItems });
        } else {
            const newItem: CartItem = {
                id: product.id,
                product,
                quantity: 1,
                subtotal: product.sell_price,
            };
            set({ items: [...items, newItem] });
        }

        calculateTotals(taxRate);
    },

    removeItem: (productId: number) => {
        const { items, calculateTotals, taxRate } = get();
        const updatedItems = items.filter(
            (item) => item.product.id !== productId,
        );
        set({ items: updatedItems });
        calculateTotals(taxRate);
    },

    updateQuantity: (productId: number, quantity: number) => {
        const { items, calculateTotals, taxRate } = get();

        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }

        const updatedItems = items.map((item) =>
            item.product.id === productId
                ? {
                      ...item,
                      quantity: Math.min(quantity, item.product.stock),
                      subtotal:
                          Math.min(quantity, item.product.stock) *
                          item.product.sell_price,
                  }
                : item,
        );
        set({ items: updatedItems });
        calculateTotals(taxRate);
    },

    incrementQuantity: (productId: number) => {
        const { items, calculateTotals, taxRate } = get();
        const item = items.find((i) => i.product.id === productId);

        if (item && item.quantity < item.product.stock) {
            get().updateQuantity(productId, item.quantity + 1);
        }
    },

    decrementQuantity: (productId: number) => {
        const { items } = get();
        const item = items.find((i) => i.product.id === productId);

        if (item) {
            if (item.quantity <= 1) {
                get().removeItem(productId);
            } else {
                get().updateQuantity(productId, item.quantity - 1);
            }
        }
    },

    clearCart: () => {
        set({
            items: [],
            subtotal: 0,
            taxAmount: 0,
            total: 0,
        });
    },

    calculateTotals: (taxRate: number) => {
        const { items } = get();

        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const taxAmount = Math.round(subtotal * (taxRate / 100));
        const total = subtotal + taxAmount;

        set({ subtotal, taxAmount, total, taxRate });
    },

    getItemsForBackend: () => {
        const { items } = get();

        return items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price_sell: item.product.sell_price,
            price_buy_snapshot: item.product.buy_price,
            subtotal: item.subtotal,
        }));
    },
}));
