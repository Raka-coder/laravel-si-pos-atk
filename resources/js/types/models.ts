export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface Category {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Unit {
    id: number;
    name: string;
    short_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    product_code?: string;
    barcode?: string;
    name: string;
    buy_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
    image?: string | null;
    is_active: boolean;
    category_id: number;
    unit_id: number;
    created_at?: string;
    updated_at?: string;
    category?: Category;
    unit?: Unit;
}

export interface TransactionItem {
    id: number;
    product_id: number;
    product_name?: string;
    quantity: number;
    price_sell: number;
    discount_amount?: number;
    subtotal?: number;
    product: Product;
}

export interface Transaction {
    id: number;
    receipt_number: string;
    subtotal?: number;
    discount_amount?: number;
    tax_amount?: number;
    total_price: number;
    amount_paid: number;
    change_amount: number;
    payment_method?: string;
    payment_status?: string;
    transaction_date: string;
    created_at: string;
    updated_at?: string;
    user?: {
        name: string;
    };
    items: TransactionItem[];
}

export interface Shop {
    id: number;
    shop_name: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    npwp: string | null;
    logo_path: string | null;
    qris_image_path: string | null;
    midtrans_merchant_id: string | null;
    tax_rate: number;
    receipt_footer: string | null;
    paper_size: string;
    created_at: string;
    updated_at: string;
}

export interface ExpenseCategory {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Expense {
    id: number;
    name: string;
    amount: number;
    date: string;
    note: string | null;
    expense_category_id: number | null;
    user_id: number;
    category?: ExpenseCategory | null;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    is_active?: boolean;
    role?: 'cashier' | 'owner' | string;
    created_at?: string;
    updated_at?: string;
}

export interface StockMovement {
    id: number;
    movement_type: string;
    qty: number;
    stock_before: number;
    stock_after: number;
    reason: string;
    created_at: string;
    product: Product;
    user: User;
    transaction?: Transaction | null;
}
