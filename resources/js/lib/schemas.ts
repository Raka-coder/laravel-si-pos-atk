import { z } from 'zod';

export const shopSettingsSchema = z.object({
    shop_name: z.string().min(1, 'Nama toko wajib diisi').max(255),
    address: z.string().optional(),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    phone: z.string().optional(),
    npwp: z.string().optional(),
    logo: z.unknown().optional(),
    qris_image: z.unknown().optional(),
    remove_logo: z.boolean().optional(),
    remove_qris: z.boolean().optional(),
    midtrans_merchant_id: z.string().optional(),
    midtrans_client_key: z.string().optional(),
    midtrans_server_key: z.string().optional(),
    midtrans_is_production: z.boolean().optional(),
    tax_rate: z.coerce.number().min(0).max(100, 'Pajak maksimal 100%'),
    receipt_footer: z.string().optional(),
    paper_size: z.enum(['mm_58', 'mm_80']),
});

export type ShopSettingsFormData = z.infer<typeof shopSettingsSchema>;

export const categorySchema = z.object({
    name: z.string().min(1, 'Nama kategori wajib diisi').max(255),
    description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const unitSchema = z.object({
    name: z.string().min(1, 'Nama unit wajib diisi').max(255),
    abbreviation: z.string().max(50).optional(),
});

export type UnitFormData = z.infer<typeof unitSchema>;

export const expenseCategorySchema = z.object({
    name: z.string().min(1, 'Nama kategori wajib diisi').max(255),
    description: z.string().optional(),
    type: z.enum(['income', 'expense']),
});

export type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>;

export const expenseSchema = z.object({
    date: z.string().min(1, 'Tanggal wajib diisi'),
    amount: z.coerce.number().min(1, 'Jumlah wajib diisi'),
    description: z.string().optional(),
    category_id: z.coerce.number().min(1, 'Kategori wajib dipilih'),
    notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const productSchema = z.object({
    name: z.string().min(1, 'Nama produk wajib diisi').max(255),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    category_id: z.coerce.number().min(1, 'Kategori wajib dipilih'),
    unit_id: z.coerce.number().min(1, 'Unit wajib dipilih'),
    price_buy: z.coerce.number().min(0, 'Harga beli tidak boleh negatif'),
    price_sell: z.coerce.number().min(0, 'Harga jual tidak boleh negatif'),
    stock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
    min_stock: z.coerce.number().min(0, 'Stok minimal tidak boleh negatif'),
    description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const userSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi').max(255),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter').optional(),
    password_confirmation: z.string().optional(),
    role: z.enum(['admin', 'cashier']),
    is_active: z.boolean(),
});

export type UserFormData = z.infer<typeof userSchema>;

export const stockMovementSchema = z.object({
    product_id: z.coerce.number().min(1, 'Produk wajib dipilih'),
    quantity: z.coerce.number().min(1, 'Jumlah wajib diisi'),
    type: z.enum(['in', 'out']),
    notes: z.string().optional(),
});

export type StockMovementFormData = z.infer<typeof stockMovementSchema>;
