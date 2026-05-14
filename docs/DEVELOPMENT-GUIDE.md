# Development Guide - ATK-SYNC POS

## ⚠️ Penyebab Paling Sering Stuck (Hindari Ini)

```
❌ Tidak jelas flow transaksi
❌ Database berubah-ubah di tengah
❌ Semua logic di controller
❌ Tidak pakai version control
❌ Langsung integrasi payment dari awal
❌ Overthinking UI
```

---

## 🗓️ Tahapan Pengembangan (Fase-Based)

### **FASE 1: FOUNDATION** (Minggu 1-2)

> Goal: Aplikasi bisa jalan dengan fitur dasar

```
┌─────────────────────────────────────────────────────────┐
│  FASE 1: FOUNDATION                                     │
├─────────────────────────────────────────────────────────┤
│  ✓ Setup Laravel + Inertia + React                     │
│  ✓ Auth (Login/Logout) - Breeze                        │
│  ✓ CRUD Kategori & Unit                                 │
│  ✓ CRUD Products (tanpa gambar)                        │
│  ✓ Dashboard sederhana                                   │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Setup Project**

    ```bash
    composer create-project laravel/laravel atk-sync
    composer require inertiajs/inertia-laravel
    composer require laravel/breeze --dev
    ```

2. **Database Migrations**
    - `users` table (Laravel default + is_active, username)
    - `categories` table
    - `units` table
    - `products` table

3. **Models**
    - Category, Unit, Product (sederhana)

4. **Controllers & Routes**
    - Auth routes (Breeze)
    - Product resource controller
    - Category/Unit CRUD

5. **Frontend**
    - Login page (Breeze)
    - Dashboard sederhana (list products)
    - Product CRUD (modal/form sederhana)

#### ✅ Done Criteria:

- User bisa login/logout
- Tambah/edit/hapus produk
- Lihat daftar produk
- Tidak ada payment, tidak ada gambar

---

### **FASE 2: CORE TRANSACTION** (Minggu 3-4)

> Goal: Transaksi bisa dilakukan (cash only)

```
┌─────────────────────────────────────────────────────────┐
│  FASE 2: CORE TRANSACTION                              │
├─────────────────────────────────────────────────────────┤
│  ✓ POS Interface (kasir)                               │
│  ✓ Cart functionality (Zustand)                        │
│  ✓ Checkout cash                                        │
│  ✓ Receipt generation (PDF)                            │
│  ✓ Transaction history                                  │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Database Migrations**
    - `transactions` table
    - `transaction_items` table
    - `stock_movements` table

2. **Models**
    - Transaction (dengan items relationship)
    - StockMovement

3. **Services**
    - TransactionService (create, calculate totals)
    - CartStore (Zustand)

4. **POS Page**
    - Product list (grid)
    - Cart sidebar
    - Payment modal (cash only)
    - Print receipt

5. **Controllers**
    - TransactionController (index, store, show, receipt)
    - Use FormRequest untuk validation

#### ✅ Done Criteria:

- Kasir bisa pilih produk → masuk keranjang
- Checkout dengan uang cash
- Struk bisa dicetak
- Stok otomatis berkurang

#### ⚠️ PENTING -Jangan dulu:

- ❌ QRIS / Midtrans
- ❌ Diskon per item
- ❌ Return barang
- ❌ Laporan rumit

---

### **FASE 3: INVENTORY** (Minggu 5)

> Goal: Pastikan stok yang benar

```
┌─────────────────────────────────────────────────────────┐
│  FASE 3: INVENTORY                                     │
├─────────────────────────────────────────────────────────┤
│  ✓ Stock movement history                              │
│  ✓ Manual stock adjustment                             │
│  ✓ Low stock alert                                     │
│  ✓ Return barang                                       │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Enhance Models**
    - Add `min_stock` field
    - Add `HasStockMovement` trait

2. **Stock Page**
    - Movement history (datatable)
    - Add stock form (IN)
    - Remove stock form (OUT)
    - Adjustment form

3. **Return Flow**
    - Select transaction
    - Select items to return
    - Refund calculation

4. **Alerts**
    - Dashboard: produk di bawah min_stock
    - Notifikasi sederhana

#### ✅ Done Criteria:

- Semua pergerakan stok tercatat
- Bisa return barang
- Ada warning stok menipis

---

### **FASE 4: EXPENSES** (Minggu 6)

> Goal: Catat pengeluaran

```
┌─────────────────────────────────────────────────────────┐
│  FASE 4: EXPENSES                                      │
├─────────────────────────────────────────────────────────┤
│  ✓ Expense categories                                  │
│  ✓ CRUD expenses                                       │
│  ✓ Dashboard expense summary                           │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Database**
    - `expense_categories` table
    - `expenses` table

2. **Models**
    - ExpenseCategory
    - Expense

3. **Controllers**
    - ExpenseCategoryController
    - ExpenseController

4. **Pages**
    - Expense list with filters
    - Expense form (modal)
    - Dashboard: total expense widget

#### ✅ Done Criteria:

- Bisa catat pengeluaran
- Filter by date & kategori
- Lihat total pengeluaran

---

### **FASE 5: REPORTS** (Minggu 7)

> Goal: Laporan bisnis

```
┌─────────────────────────────────────────────────────────┐
│  FASE 5: REPORTS                                      │
├─────────────────────────────────────────────────────────┤
│  ✓ Sales report                                        │
│  ✓ Profit calculation                                  │
│  ✓ Expense report                                      │
│  ✓ Dashboard charts (Recharts)                         │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Sales Report**
    - Filter by date range
    - Group by day/week/month
    - Total revenue, transaction count

2. **Profit Calculation**
    - Gunakan `price_buy_snapshot` dari transaction_items
    - Gross profit = Σ(sell - buy) × qty

3. **Charts**
    - Daily sales chart (7 hari terakhir)
    - Top products
    - Income vs Expense

4. **Export**
    - Excel export (Maatwebsite)

#### ✅ Done Criteria:

- Laporan penjualan per periode
- Laporan keuntungan
- Grafik di dashboard

---

### **FASE 6: SETTINGS & PROFILE** (Minggu 8)

> Goal: Konfigurasi toko

```
┌─────────────────────────────────────────────────────────┐
│  FASE 6: SETTINGS & PROFILE                           │
├─────────────────────────────────────────────────────────┤
│  ✓ Shop settings                                       │
│  ✓ Tax rate configuration                              │
│  ✓ User profile                                        │
│  ✓ Upload images                                       │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Shop Settings**
    - `shop_settings` table (singleton)
    - Settings page (form)
    - Apply tax_rate di transaksi

2. **User Profile**
    - Update profile
    - Change password

3. **Image Upload**
    - Laravel Storage
    - Product image upload
    - Shop logo

4. **Receipt Enhancement**
    - Custom footer
    - Paper size (58mm/80mm)
    - Logo di receipt

#### ✅ Done Criteria:

- Pengaturan toko tersimpan
- Pajak sesuai konfigurasi
- Gambar produk bisa diupload

---

### **FASE 7: RBAC** (Minggu 9)

> Goal: User management

```
┌─────────────────────────────────────────────────────────┐
│  FASE 7: RBAC                                         │
├─────────────────────────────────────────────────────────┤
│  ✓ Roles & Permissions (Spatie)                       │
│  ✓ User management                                     │
│  ✓ Route protection                                    │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Setup Spatie**

    ```bash
    composer require spatie/laravel-permission
    ```

2. **Roles**
    - SUPER_ADMIN/Owner (semua akses)
    - ADMIN/Kasir (POS only)

3. **Permissions**
    - products.view, products.create, products.update, products.delete
    - transactions.view, transactions.create
    - expenses.view, expenses.create
    - reports.view
    - users.view, users.create, users.update, users.delete
    - settings.update

4. **Middleware**
    - Role middleware
    - Permission middleware

5. **User Management Page**
    - List users
    - Create/edit user
    - Assign role
    - Activate/deactivate

#### ✅ Done Criteria:

- Setiap user punya role
- Akses dibatasi sesuai role
- Super admin bisa manage user

---

### **FASE 8: PAYMENT GATEWAY** (Minggu 10)

> Goal: Integrasi pembayaran digital

```
┌─────────────────────────────────────────────────────────┐
│  FASE 8: PAYMENT GATEWAY                               │
├─────────────────────────────────────────────────────────┤
│  ✓ Midtrans integration                                │
│  ✓ QRIS payment                                        │
│  ✓ Payment status tracking                             │
│  ✓ Webhook handling                                    │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Setup Midtrans**

    ```bash
    composer require midtrans/midtrans-php
    ```

2. **Enhance Transaction**
    - payment_method: cash | qris | midtrans
    - payment_status: waiting | paid | cancelled | refunded
    - payment_reference

3. **API Integration**
    - Create payment (Snap API)
    - Handle callback/webhook
    - Check payment status

4. **Frontend**
    - QRIS display (QR code)
    - Payment status polling
    - Cancel/refund UI

#### ✅ Done Criteria:

- Bisa bayar dengan QRIS
- Status pembayaran tercatat
- Auto-update saat payment success

---

### **FASE 9: POLISHING** (Minggu 11-12)

> Goal: Perbaikan & optimasi

```
┌─────────────────────────────────────────────────────────┐
│  FASE 9: POLISHING                                     │
├─────────────────────────────────────────────────────────┤
│  ✓ Error handling                                      │
│  ✓ Loading states                                      │
│  ✓ Responsive design                                   │
│  ✓ Performance optimization                            │
│  ✓ Testing                                             │
│  ✓ Documentation                                       │
└─────────────────────────────────────────────────────────┘
```

#### Tech Tasks:

1. **Error Handling**
    - Global exception handler
    - Try-catch di controllers
    - User-friendly error messages

2. **UX Improvements**
    - Loading spinners
    - Toast notifications (Sonner)
    - Empty states
    - Confirmations

3. **Responsive**
    - Mobile-friendly POS
    - Tablet support

4. **Performance**
    - Query optimization (eager loading)
    - Indexes
    - Caching

5. **Testing**
    - Basic feature tests
    - Critical flow tests

6. **Deployment**
    - Production setup
    - Environment config

---

## 📊 Ringkasan Timeline

| Fase   | Durasi   | Goal                        |
| ------ | -------- | --------------------------- |
| FASE 1 | 2 minggu | Foundation (auth, products) |
| FASE 2 | 2 minggu | Core transaction (cash)     |
| FASE 3 | 1 minggu | Inventory management        |
| FASE 4 | 1 minggu | Expenses                    |
| FASE 5 | 1 minggu | Reports & Charts            |
| FASE 6 | 1 minggu | Settings & Profile          |
| FASE 7 | 1 minggu | RBAC                        |
| FASE 8 | 1 minggu | Payment Gateway             |
| FASE 9 | 2 minggu | Polishing & Deploy          |

**Total: ~12 minggu** (3 bulan)

---

## 🎯 Prinsip Dasar

### 1. Satu Fase Selesai, Baru ke Fase Berikutnya

- Jangan loncat-loncat fitur
- Setiap fase harus menghasilkan fitur yang WORKS
- Test manual dulu sebelum lanjut

### 2. Database FIX di Fase 1 & 2

- Semua tabel utama dibuat di Fase 1-2
- Fase berikutnya hanya menambah kolom/tabel minor
- Kalau perlu ubah struktur, itu tanda ada yang salah di planning

### 3. Controller Harus Tipis

- Logic ada di Service class
- Controller hanya: validate → call service → return response

### 4. Version Control dari Hari 1

```bash
git init
git add .
git commit -m "Initial commit"
```

### 5. Payment Belakangan

- Fokus ke core business: transaksi & stok
- Cash only dulu
- Payment gateway di Fase 8 (bukan awal!)

### 6. UI Sederhana Dulu

- Functional > Beautiful
- Pakai Tailwind + Headless UI
- Jangan spent waktu untuk custom design

---

## 🔧 Setup Awal (Sebelum Fase 1)

```bash
# 1. Create project
composer create-project laravel/laravel atk-sync
cd atk-sync

# 2. Install Inertia
composer require inertiajs/inertia-laravel
npm install @inertiajs/react

# 3. Install Breeze (Auth)
composer require laravel/breeze --dev
php artisan breeze:install inertia --typescript

# 4. Setup database
# Edit .env dengan credentials DB

# 5. Test awal
php artisan migrate
npm run dev
```

---

## ⚡ Quick Command Reference

```bash
# Development
npm run dev          # Frontend
php artisan serve   # Backend

# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan make:migration create_products_table

# Resources
php artisan make:model Product -m
php artisan make:controller ProductController --resource
php artisan make:request StoreProductRequest

# Test
php artisan test
```

---

## ✅ Setiap Hari

1. **Commit kecil-kecil** - Setiap fitur kecil = 1 commit
2. **Test manual** - Cek fitur sebelum commit
3. **Check error log** - `php artisan logs` atau storage/logs
4. **Review code sendiri** - Sebelum push ke remote

---

## 🚀 Mulai Dari Mana?

Langsung ke **FASE 1**!

Jangan:

- ❌ Pikirin payment gateway
- ❌ Bikin semua fitur sekaligus

Contoh:

- **Hari 1-2**: Setup + Auth
- **Hari 3-4**: Products CRUD
- **Hari 5**: Dashboard sederhana
- **Minggu 2**: POS interface

Fokus ke **FUNGSIONAL** dulu. Beautiful bisa belakangan.
