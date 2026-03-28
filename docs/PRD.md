# PRD - ATK-SYNC (POS Toko ATK)

## 1. Overview Proyek

### 1.1 Deskripsi

ATK-SYNC adalah sistem Point of Sale (POS) berbasis web untuk Toko ATK (Alat Tulis Kantor) yang dibangun dengan teknologi modern. Aplikasi ini mendukung pengelolaan produk, transaksi penjualan, inventaris, laporan bisnis, dan manajemen pengguna dengan sistem autentikasi yang aman.

### 1.2 Tujuan

- Memudahkan proses transaksi penjualan retail
- Mengelola inventaris produk secara real-time
- Menghasilkan laporan bisnis (penjualan, keuntungan, expenses)
- Multi-user dengan role-based access control (RBAC)

---

## 2. Spesifikasi Teknis

### 2.1 Stack Teknologi

| Layer                | Teknologi                            |
| -------------------- | ------------------------------------ |
| **Backend**          | Laravel 13                           |
| **Frontend**         | React 19 + Inertia.js (SSR)          |
| **Styling**          | Tailwind CSS v4                      |
| **Database**         | PostgreSQL / MySQL                   |
| **ORM**              | Laravel Eloquent                     |
| **Auth**             | Laravel Breeze / Jetstream (Inertia) |
| **State Management** | React Hooks + Zustand                |
| **Payment**          | Midtrans SDK PHP                     |
| **PDF**              | DomPDF / Snappy                      |
| **Excel/CSV**        | Laravel Excel                        |



### 2.3 Library per Fitur

| Fitur                | Library                                             |
| -------------------- | --------------------------------------------------- |
| **Auth & RBAC**      | Laravel Breeze (Inertia), Spatie laravel-permission |
| **Datatables**       | Yajra Laravel DataTables                            |
| **Payment Gateway**  | Midtrans SDK PHP                                    |
| **PDF Receipt**      | DomPDF + barryvdh/laravel-dompdf                    |
| **Excel Export**     | Maatwebsite Laravel Excel                           |
| **Image Upload**     | Laravel Storage + Intervention Image                |
| **API Token**        | Laravel Sanctum                                     |
| **State Management** | Zustand + React Query                               |
| **UI Components**    | Headless UI + Tailwind                              |
| **Charts**           | Recharts                                            |
| **Form Validation**  | React Hook Form + Zod                               |

### 2.4 Lingkungan Pengembangan

```bash
composer install
npm install
php artisan migrate
php artisan db:seed
npm run dev
```

### 2.5 Build & Deployment

```bash
composer dump-autoload
php artisan optimize:clear
npm run build
php artisan queue:restart
```

---

## 3. Fitur Sistem

### 3.1 Modul Autentikasi & Autorisasi

#### 3.1.1 Authentication (Laravel Breeze Inertia)

- **Login/Register** dengan email/password
- **Session management** via Laravel session
- **Password hashing** di tabel users (bcrypt)
- **Email verification** (Laravel built-in)

#### 3.1.2 Role-Based Access Control (RBAC)

**Package:** Spatie laravel-permission

| Role          | Deskripsi                         |
| ------------- | --------------------------------- |
| `SUPER_ADMIN` | Akses penuh ke semua fitur        |
| `ADMIN`       | Manage produk, transaksi, laporan |

**Implementasi:**

- Middleware `role` / `permission` dari Spatie
- Blade directives `@role`, `@can`, @endrole
- Policy classes untuk resource authorization
- Route protection via route middleware

---

### 3.2 Modul Produk & Katalog

#### 3.2.1 Kategori Produk (`categories` table)

- CRUD kategori produk
- Nama kategori (max 100 char)
- Timestamps

#### 3.2.2 Unit Produk (`units` table)

- CRUD unit (pcs, pack, lusin, kg, etc.)
- Nama unit dan singkatan
- Timestamps

#### 3.2.3 Produk (`products` table)

- **Field:**
    - `barcode` (unique, indexed)
    - `name` (max 255 char)
    - `buy_price` (harga beli)
    - `sell_price` (harga jual)
    - `stock` (jumlah stok)
    - `min_stock` (stok minimum - threshold notifikasi)
    - `image` (path gambar)
    - `is_active` (boolean)
    - `category_id`, `unit_id` (FK)
- **Relasi:** Category (belongsTo), Unit (belongsTo)
- **Index:** barcode, category_id, is_active, name

#### 3.2.4 Fitur Produk

- CRUD dengan modal/form di Inertia page
- Datatable dengan Yajra DataTables (server-side)
- Pencarian produk (nama, barcode)
- Filter berdasarkan kategori
- Stock level monitoring (alert stok minim)
- Upload gambar ke storage/app/public/products

---

### 3.3 Modul Transaksi POS

#### 3.3.1 Transaksi (`transactions` table)

- **Field:**
    - `receipt_number` (unique, format: TRX-YYYYMMDD-XXXX)
    - `subtotal` (total sebelum diskon & pajak)
    - `discount_amount` (diskon transaksi)
    - `tax_amount` (pajak - berdasarkan tax_rate di settings)
    - `total_price` (total akhir)
    - `payment_method`: cash | qris | midtrans
    - `payment_status`: pending | paid | cancelled | refunded
    - `payment_reference` (ref payment Midtrans)
    - `amount_paid` (jumlah dibayarkan)
    - `change_amount` (kembalian)
    - `note` (catatan transaksi)
    - `transaction_date` (timestamp)
    - `user_id` (kasir)
- **Relasi:** User (belongsTo), TransactionItem (hasMany)

#### 3.3.2 Item Transaksi (`transaction_items` table)

- Snapshot `product_name` dan `price_buy_snapshot` (untuk hitung keuntungan)
- `price_sell` (harga saat transaksi)
- `quantity`, `discount_amount`, `subtotal`
- Denormalisasi untuk receipt history
- **Relasi:** Transaction (belongsTo), Product (belongsTo)

#### 3.3.3 Fitur Transaksi

- **POS Interface:** React SPA dengan Inertia
- Tambah produk ke keranjang (Zustand store)
- Qty adjustment, remove item
- Barcode scanner support
- **Perhitungan otomatis:** Subtotal, diskon, pajak, total, kembalian
- **Pembayaran:** Cash, QRIS (QR Code), Midtrans (VA/e-wallet)
- **Struk Digital:** Generate PDF via DomPDF
- **Print Struk:** Window.print() atau react-to-print
- **Riwayat Transaksi:** DataTables dengan filter date, payment method, status

---

### 3.4 Modul Inventaris

#### 3.4.1 Pergerakan Stok (`stock_movements` table)

- **Field:**
    - `movement_type`: in | out | adjustment | sale | return
    - `qty` (jumlah)
    - `stock_before`, `stock_after`
    - `reason` (alasan pergerakan)
    - `reference_id` (optional ref ke transaction_id untuk sale/return)
    - `product_id`, `user_id` (FK)
    - `created_at`
- **Trigger:** Events di Eloquent (creating, created)

#### 3.4.2 Fitur Inventaris

- **Stock Automatic:**
    - Saat Transaction paid → StockMovement (OUT) → Product.stock -=
    - Saat Return → StockMovement (RETURN) → Product.stock +=
- Manual stock adjustment dengan reason
- Riwayat pergerakan stok per produk (DataTables)
- Stock opname (bulk adjustment)

---

### 3.5 Modul Pengeluaran (Expenses)

#### 3.5.1 Kategori Pengeluaran (`expense_categories` table)

- CRUD kategori pengeluaran

#### 3.5.2 Pengeluaran (`expenses` table)

- **Field:**
    - `name` (nama pengeluaran)
    - `amount` (jumlah)
    - `date` (tanggal)
    - `note` (catatan)
    - `user_id`, `expense_category_id` (FK)
    - `created_at`, `updated_at`
- **Relasi:** User, ExpenseCategory

#### 3.5.3 Fitur Pengeluaran

- CRUD dengan modal Inertia
- Datatable dengan filter date range & kategori
- Total pengeluaran per periode (Dashboard widget)

---

### 3.6 Modul Laporan & Dashboard

#### 3.6.1 Dashboard (HomeController)

- **Kartu statistik:**
    - Total penjualan hari ini (Transaction paid sum)
    - Total transaksi hari ini (count)
    - Pendapatan bulan ini
    - Produk stok rendah (where stock < min_stock)
- **Grafik:** Penjualan harian/mingguan (Recharts - passed as props)
- **Tabel:** Produk terlaris (join transactions_items group by product)

#### 3.6.2 Laporan Penjualan

- Filter by date range (start_date, end_date)
- Rincian transaksi per item (DataTables)
- Total revenue, gross profit
- Export Excel via Maatwebsite

#### 3.6.3 Laporan Pengeluaran

- Total pengeluaran per periode
- Breakdown per kategori (group by category)
- Export Excel

#### 3.6.4 Laporan Laba/Rugi

- **Gross Profit:** Σ(sell_price - buy_price) \* qty (dari transaction_items)
- **Total Expenses:** Σ(expenses.amount)
- **Net Profit:** Gross Profit - Total Expenses

---

### 3.7 Modul Pengaturan

#### 3.7.1 Pengaturan Toko (`shop_settings` table)

- **Single-row table** (id = 1)
- **Field:**
    - `shop_name`, `address`, `email`, `phone`, `npwp`
    - `logo_path`, `qris_image_path`
    - `midtrans_merchant_id`
    - `tax_rate` (default 11% - PPN)
    - `receipt_footer` (text terima kasih di struk)
    - `paper_size`: mm_58 | mm_80
    - `updated_at`

#### 3.7.2 Fitur Pengaturan

- Edit via form Inertia
- Preview logo & QRIS image
- Konfigurasi tax rate
- Paper size selector
- Custom footer text

---

### 3.8 Modul User Management

#### 3.8.1 User Profile

- Profile dengan name, email
- Avatar upload (storage)
- Password change
- Role assignment (via Spatie)
- Aktif/non-aktif user (is_active boolean)

#### 3.8.2 Fitur User

- CRUD user (Super Admin only)
- Assign roles & permissions
- Aktifasi/non-aktivasi user
- Activity log (Laravel Log)

---

## 4. Arsitektur Data

### 4.1 Struktur Tabel

```
users (Laravel default + role_id)
  └─ transactions
  └─ stock_movements
  └─ expenses

categories
  └─ products

units
  └─ products

products
  └─ transaction_items
  └─ stock_movements

transactions
  └─ transaction_items

expense_categories
  └─ expenses

shop_settings (singleton)
```

### 4.2 Relasi Eloquent

```php
// User
User::class -> hasMany(Transaction::class)
User::class -> hasMany(StockMovement::class)
User::class -> hasMany(Expense::class)
User::class -> belongsToMany(Role::class, 'model_has_roles')

// Category
Category::class -> hasMany(Product::class)

// Unit
Unit::class -> hasMany(Product::class)

// Product
Product::class -> belongsTo(Category::class)
Product::class -> belongsTo(Unit::class)
Product::class -> hasMany(TransactionItem::class)
Product::class -> hasMany(StockMovement::class)

// Transaction
Transaction::class -> belongsTo(User::class)
Transaction::class -> hasMany(TransactionItem::class)

// TransactionItem
TransactionItem::class -> belongsTo(Transaction::class)
TransactionItem::class -> belongsTo(Product::class)

// ExpenseCategory
ExpenseCategory::class -> hasMany(Expense::class)

// Expense
Expense::class -> belongsTo(User::class)
Expense::class -> belongsTo(ExpenseCategory::class)
```

### 4.3 Alur Data Utama

1. **Transaksi Baru:**
    - Kasir input produk → TransactionItem created
    - Hitung subtotal, diskon, pajak, total
    - Pembayaran → Midtrans API
    - Status PAID → StockMovement (OUT) → Product.stock decrement
    - Transaction recorded with all items

2. **Return Barang:**
    - Admin input return → Transaction.payment_status = REFUNDED
    - StockMovement (RETURN) → Product.stock increment

3. **Stock Adjustment:**
    - Admin input adjustment reason
    - StockMovement (ADJUSTMENT) → Product.stock updated

---

## 5. Route & Controller

### 5.1 Route Structure (routes/web.php)

```php
// Auth (Breeze)
require __DIR__.'/auth.php';

// Dashboard
Route::get('/', fn() => inertia('Dashboard'))->name('dashboard');

// Products
Route::resource('products', ProductController::class);
Route::get('products/barcode/{barcode}', [ProductController::class, 'byBarcode']);

// Categories
Route::resource('categories', CategoryController::class);

// Units
Route::resource('units', UnitController::class);

// Transactions
Route::resource('transactions', TransactionController::class);
Route::get('transactions/receipt/{id}', [TransactionController::class, 'receipt']);

// Stock
Route::resource('stock-movements', StockMovementController::class);

// Expenses
Route::resource('expenses', ExpenseController::class);
Route::resource('expense-categories', ExpenseCategoryController::class);

// Reports
Route::get('reports/sales', [ReportController::class, 'sales']);
Route::get('reports/expenses', [ReportController::class, 'expenses']);
Route::get('reports/profit-loss', [ReportController::class, 'profitLoss']);
Route::get('reports/export', [ReportController::class, 'export']);

// Settings
Route::resource('settings', ShopSettingController::class)->only(['index', 'update']);

// Users
Route::resource('users', UserController::class)->middleware('role:SUPER_ADMIN');
```

### 5.2 Controller Methods

| Controller              | Methods                                                      |
| ----------------------- | ------------------------------------------------------------ |
| ProductController       | index, create, store, show, edit, update, destroy, byBarcode |
| TransactionController   | index, create, store, show, receipt, destroy                 |
| StockMovementController | index, store                                                 |
| ExpenseController       | index, create, store, edit, update, destroy                  |
| ReportController        | sales, expenses, profitLoss, export                          |

---

## 6. Frontend Pages (Inertia)

| Route                  | Page Component        | Description      |
| ---------------------- | --------------------- | ---------------- |
| `/login`               | Auth/Login            | Breeze generated |
| `/register`            | Auth/Register         | Breeze generated |
| `/`                    | Dashboard/Index       | Stats, charts    |
| `/pos`                 | POS/Index             | Kasir interface  |
| `/products`            | Product/Index         | DataTable + CRUD |
| `/products/create`     | Product/Create        | Form modal/page  |
| `/products/{id}/edit`  | Product/Edit          | Form modal/page  |
| `/categories`          | Category/Index        | CRUD             |
| `/units`               | Unit/Index            | CRUD             |
| `/transactions`        | Transaction/Index     | History          |
| `/transactions/{id}`   | Transaction/Show      | Detail + receipt |
| `/stock-movements`     | StockMovement/Index   | History          |
| `/expenses`            | Expense/Index         | CRUD             |
| `/expense-categories`  | ExpenseCategory/Index | CRUD             |
| `/reports/sales`       | Report/Sales          | Sales report     |
| `/reports/expenses`    | Report/Expenses       | Expense report   |
| `/reports/profit-loss` | Report/ProfitLoss     | P&L report       |
| `/settings`            | Setting/Index         | Shop config      |
| `/users`               | User/Index            | User management  |
| `/profile`             | Profile/Show          | User profile     |

---

## 7. Keamanan

- **Auth:** Laravel Breeze Inertia (bcrypt session)
- **RBAC:** Spatie laravel-permission middleware
- **CSRF:** Laravel CSRF token (Inertia auto-handle)
- **XSS:** Blade escaping auto
- **SQL Injection:** Eloquent parameter binding
- **Validation:** Laravel Form Request + Zod client-side
- **API:** Laravel Sanctum for SPA
- **Env:** .env tidak di-commit (gitignore)

---

## 8. Pengembangan Selanjutnya (Future)

- [ ] Export laporan ke Excel (Maatwebsite)
- [ ] Notifikasi stok rendah via WhatsApp
- [ ] Multi-outlet / warehouse
- [ ] Supplier management
- [ ] Purchase order (PO)
- [ ] Member/customer management
- [ ] QR Code barcode scanner
- [ ] Offline mode (PWA)
- [ ] Android/iOS app (API ready)
