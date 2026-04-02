# FASE 2: Core Transaction - Walkthrough

## Overview

FASE 2 bertujuan untuk membangun fitur inti transaksi POS:

- ✅ POS Interface (kasir)
- ✅ Cart functionality (Zustand)
- ✅ Checkout cash
- ✅ Receipt generation (PDF via DomPDF)
- ✅ Transaction history

---

## Dependencies yang Diinstall

| Package                   | Version | Description                 |
| ------------------------- | ------- | --------------------------- |
| `barryvdh/laravel-dompdf` | ^3.1    | PDF receipt generation      |
| `zustand`                 | latest  | State management untuk cart |

---

## Struktur Project

```
example-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Transaction/
│   │   │       └── TransactionController.php
│   │   └── Requests/
│   │       └── Transaction/
│   │           └── StoreTransactionRequest.php
│   ├── Models/
│   │   ├── Transaction.php
│   │   └── TransactionItem.php
│   └── Services/
│       └── TransactionService.php
├── database/
│   ├── factories/
│   │   ├── TransactionFactory.php
│   │   └── TransactionItemFactory.php
│   └── migrations/
│       ├── 2025_03_28_000004_create_transactions_table.php
│       └── 2025_03_28_000005_create_transaction_items_table.php
├── resources/
│   ├── js/
│   │   ├── pages/
│   │   │   ├── pos/index.tsx
│   │   │   └── transaction/
│   │   │       ├── index.tsx
│   │   │       └── show.tsx
│   │   └── stores/
│   │       └── cartStore.ts (Zustand)
│   └── views/
│       └── receipts/
│           └── transaction.blade.php
└── routes/web.php
```

---

## Cara Menjalankan Project

### 1. Setup Awal

```bash
cd example-app

# Install dependencies
composer install
npm install
```

### 2. Konfigurasi Database

Pastikan `.env` sudah terkonfigurasi:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Jalankan Development Server

```bash
# Terminal 1 - Backend
php artisan serve

# Terminal 2 - Frontend
npm run dev
```

### 5. Akses Aplikasi

Buka browser: `http://localhost:8000`

1. Login dengan akun yang sudah terdaftar
2. Klik menu **POS** di sidebar
3. Mulai transaksi!

---

## Fitur yang Diimplementasikan

### 1. POS Interface

**Route:** `GET /pos`

Halaman utama kasir dengan:

- **Product Grid** - Tampilan produk dengan gambar thumbnail (200x200px)
- **Search** - Pencarian produk berdasarkan nama atau barcode
- **Category Filter** - Filter produk berdasarkan kategori
- **Cart Sidebar** - Keranjang belanja di sisi kanan
- **Checkout** - Tombol untuk proses pembayaran

**Components:**

- Product grid dengan gambar produk (fallback "No Img" jika tidak ada gambar)
- Cart items dengan quantity adjustment (+/-)
- Payment modal dengan perhitungan kembalian
- Real-time totals (subtotal, tax, total)

### 2. Cart dengan Zustand

**File:** `resources/js/stores/cartStore.ts`

```typescript
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
    getItemsForBackend: () => Array<{...}>;
}
```

**Features:**

- Tambah produk ke keranjang
- Update quantity dengan batas stock
- Hapus item dari keranjang
- Clear seluruh keranjang
- Hitung subtotal, tax (11%), dan total otomatis

### 3. Checkout Cash

**Flow:**

1. Klik produk untuk tambahkan ke keranjang
2. Adjust quantity jika perlu
3. Klik tombol **Checkout**
4. Masukkan jumlah pembayaran
5. Sistem menghitung kembalian
6. Klik **Proses Pembayaran**
7. Redirect ke halaman detail transaksi

**Validasi:**

- Minimum 1 item di keranjang
- Jumlah pembayaran >= total
- Update stock produk secara otomatis

### 4. Receipt PDF

**Route:** `GET /transactions/receipt/{transaction}`

Menggunakan DomPDF untuk generate PDF receipt dengan format:

- Header toko (nama, alamat)
- Receipt number, tanggal, kasir
- Tabel item (nama, qty, harga, subtotal)
- Rincian pembayaran (subtotal, PPN, total)
- Jumlah pembayaran dan kembalian
- Footer terima kasih

### 5. Transaction History

**Route:** `GET /transactions`

Menampilkan:

- Tabel semua transaksi
- Kolom: Receipt No, Date, Kasir, Total, Payment, Status
- Link ke detail transaksi
- Link download PDF receipt

**Route:** `GET /transactions/{transaction}`

Halaman detail transaksi dengan:

- Info transaksi (receipt number, tanggal, kasir)
- Rincian pembayaran
- Tabel item yang dibeli
- Notes (jika ada)

---

## Database Schema

### transactions table

| Column            | Type          | Description                               |
| ----------------- | ------------- | ----------------------------------------- |
| id                | bigint        | Primary key                               |
| receipt_number    | varchar(50)   | Unique receipt number (TRX-YYYYMMDD-XXXX) |
| subtotal          | decimal(12,2) | Total sebelum tax                         |
| discount_amount   | decimal(12,2) | Diskon transaksi                          |
| tax_amount        | decimal(12,2) | PPN 11%                                   |
| total_price       | decimal(12,2) | Total akhir                               |
| payment_method    | enum          | cash, qris, midtrans                      |
| payment_status    | enum          | pending, paid, cancelled, refunded        |
| payment_reference | varchar       | Reference untuk payment gateway           |
| amount_paid       | decimal(12,2) | Jumlah yang dibayarkan                    |
| change_amount     | decimal(12,2) | Kembalian                                 |
| note              | text          | Catatan transaksi                         |
| transaction_date  | timestamp     | Tanggal transaksi                         |
| user_id           | bigint        | FK ke users (kasir)                       |
| created_at        | timestamp     |                                           |
| updated_at        | timestamp     |                                           |

**Indexes:**

- receipt_number (unique)
- transaction_date
- payment_status

### transaction_items table

| Column             | Type          | Description                     |
| ------------------ | ------------- | ------------------------------- |
| id                 | bigint        | Primary key                     |
| transaction_id     | bigint        | FK ke transactions              |
| product_id         | bigint        | FK ke products                  |
| product_name       | varchar(255)  | Snapshot nama produk            |
| price_buy_snapshot | decimal(12,2) | Snapshot harga beli             |
| price_sell         | decimal(12,2) | Harga saat transaksi            |
| quantity           | int           | Jumlah item                     |
| discount_amount    | decimal(12,2) | Diskon per item                 |
| subtotal           | decimal(12,2) | Total (price \* qty - discount) |

---

## Tax Configuration

**Default Tax Rate:** 11% (PPN Indonesia)

Konfigurasi di `app/Services/TransactionService.php`:

```php
public const TAX_RATE = 0.11;
```

Tax dihitung otomatis saat checkout:

```php
$taxAmount = round($subtotal * self::TAX_RATE);
$total = $subtotal + $taxAmount;
```

---

## Routes List

| Method | URI                                   | Description           |
| ------ | ------------------------------------- | --------------------- |
| GET    | `/pos`                                | POS Interface         |
| GET    | `/transactions`                       | Transaction history   |
| POST   | `/transactions`                       | Store new transaction |
| GET    | `/transactions/{transaction}`         | Transaction detail    |
| GET    | `/transactions/receipt/{transaction}` | Download PDF receipt  |

---

## Frontend Patterns

### Zustand Store

```typescript
import { create } from 'zustand';

export const useCartStore = create<CartStore>((set, get) => ({
    // ... state and methods
}));
```

### POS Page Structure

```tsx
export default function POSIndex() {
    const { products, taxRate } = usePage<Props>().props;
    const { items, addItem, removeItem, ... } = useCartStore();

    // ... handlers
}
```

### Payment Flow

1. User klik Checkout
2. Modal payment terbuka
3. User input jumlah pembayaran
4. Sistem hitung kembalian real-time
5. User klik Proses Pembayaran
6. POST ke `/transactions` dengan semua data
7. Backend:
    - Generate receipt number
    - Create transaction
    - Create transaction items
    - Decrement product stock
8. Redirect ke halaman detail

---

## Testing Checklist

- [ ] Tambah produk ke keranjang
- [ ] Update quantity produk
- [ ] Hapus produk dari keranjang
- [ ] Clear seluruh keranjang
- [ ] Search produk
- [ ] Filter produk berdasarkan kategori
- [ ] Checkout dengan jumlah pembayaran cukup
- [ ] Checkout dengan jumlah pembayaran kurang
- [ ] Lihat history transaksi
- [ ] Lihat detail transaksi
- [ ] Download PDF receipt
- [ ] Stock produk berkurang setelah checkout
- [ ] Tax 11% dihitung dengan benar

---

## Next Steps

FASE 2 selesai. Lanjut ke **FASE 3: Inventory**:

- Stock movement history
- Manual stock adjustment
- Low stock alert
- Return barang

---

## Catatan

- TypeScript errors di IDE tidak 影响 fungsi - hanya type constraint warning
- **Product images ditampilkan di POS** dengan thumbnail 200x200px
- QRIS/Midtrans payment belum diimplementasi (bisa di Fase 8)
- Diskon belum ada (sesuai request)
- Stock otomatis berkurang saat transaksi PAID
- **Setup storage link untuk melihat gambar:**
    ```bash
    php artisan storage:link
    ```
