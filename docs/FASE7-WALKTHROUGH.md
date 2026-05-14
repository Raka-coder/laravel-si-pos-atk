# FASE 7: RBAC & User Management

## Overview

FASE 7 implements Role-Based Access Control (RBAC) with User Management using Spatie Laravel Permission package.

## New Features

### 1. Roles & Permissions

- **Roles**: `owner` (Super Admin), `cashier` (Admin)
- **Permissions**: Medium granularity (view_users, create_users, edit_users, etc.)
- **Database Tables**: `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`

### 2. User Management (Owner Only)

- **CRUD User**: Create, read, update, delete user accounts (owner & cashier)
- **Fields**: name, email, password, is_active, role
- **Features**:
    - Reset password user
    - Activate/deactivate user via toggle
    - Select role (owner/cashier) saat create
    - Activity logging
    - Toggle status langsung berfungsi (fixed: sebelumnya ada bug pada mass-assignment)

### 3. User Status & Login Flow

- **is_active** field di tabel users mengontrol akses login
- User dengan `is_active = false` tidak bisa login
- Toggle status di table langsung mempengaruhi kemampuan login
- Checkbox di form create/edit menentukan status aktif/non-aktif
- Bug fix: `is_active` ditambahkan ke `$fillable` di User model agar bisa di-mass-assign

### 4. Login with Role Selection

- Dropdown untuk pilih role (Owner / Cashier)
- Validasi user memiliki role yang dipilih
- Akun non-aktif tidak bisa login
- Cek is_active sebelum authentication

### 5. Dashboard per Role

- **Owner**: Full dashboard (sales, revenue, expenses, low stock, products)
- **Cashier**: Simplified dashboard (sales & revenue only)

### 6. Sidebar Navigation per Role

- **Owner**: All menu items (Dashboard, POS, Transactions, Stock Movements, Products, Categories, Units, Expenses, Expense Categories, Reports, Manage User, Shop Settings)
- **Cashier**: Limited menu (Dashboard, POS, Transactions, Reports)

### 7. Edit Transaction (Cashier & Owner)

- Fitur edit transaksi untuk memperbaiki kesalahan input
- **Yang bisa diedit**:
    - Tambah/hapus item produk
    - Ubah quantity per item
    - Ubah harga per item
    - Ubah discount per item
    - Ubah catatan transaksi
- **Auto recalculate**: subtotal, tax, total
- **Stock adjustment**: otomatis kembalikan stok lama + kurangi stok baru
- **Log stock movements**: mencatat setiap perubahan stok saat edit

### 8. Settings Access per Role

- **Owner**: Full access (Profile, Security, Appearance)
- **Cashier**: Appearance only
- Redirect: `/settings` → Owner ke profile, Cashier ke appearance

## Changes Made

### Backend

#### Modified Files

- `app/Http/Controllers/User/UserController.php` - Full CRUD untuk semua user (owner & cashier)
    - Menampilkan semua user (tidak filter hanya cashier)
    - Role selector saat create/update
    - is_active dari request
    - Pencegahan hapus/nonaktifkan diri sendiri

- `app/Actions/Fortify/AttemptAuthentication.php` - Cek is_active sebelum login
    - Validasi is_active = true sebelum authentication

- `app/Models/User.php` - Added `is_active` ke fillable array
    - Memungkinkan mass-assignment untuk is_active field
    - Perbaikan bug: toggle status tidak berfungsi sebelumnya

#### Database

- `users` table: is_active column (sudah ada)

### Frontend

#### Modified Files

- `resources/js/pages/users/index.tsx` - User management dengan:
    - Role column di table
    - Status indicator (Active/Non-active)
    - Toggle button menggunakan ToggleRight/ToggleLeft icons
    - Checkbox is_active di form create & edit
    - Role selector di form

### Routes

- Owner-only routes: users CRUD, categories, units, products, expenses, stock-movements, shop settings, profile, security
- All authenticated routes: dashboard, pos, transactions, reports, appearance

## Default Users (After Seeding)

| Email                | Password | Role    | is_active  |
| -------------------- | -------- | ------- | ---------- |
| owner@atk-sync.com   | password | Owner   | 1 (Active) |
| cashier@atk-sync.com | password | Cashier | 1 (Active) |

## Test Credentials

1. **Owner Login**
    - Email: `owner@atk-sync.com`
    - Password: `password`
    - Role: Owner

2. **Cashier Login**
    - Email: `cashier@atk-sync.com`
    - Password: `password`
    - Role: Cashier

## User Management Flow

### Create User

1. Klik "Add User"
2. Isi: Name, Email, Password, Confirm Password
3. Pilih Role: Owner / Cashier
4. Centang/uncheck Active (default: checked/active)
5. Klik Create

### Edit User

1. Klik icon pencil pada row user
2. Ubah data yang diperlukan
3. Ubah role jika diperlukan
4. Centang/uncheck Active untuk mengubah status
5. Klik Save Changes

### Toggle Status

1. Klik toggle button (ToggleRight/ToggleLeft) pada row user
2. User langsung diaktifkan/nonaktifkan
3. User tidak bisa login jika non-aktif

### Delete User

1. Klik icon trash pada row user
2. Konfirmasi delete
3. Catatan: Tidak bisa menghapus diri sendiri

## Activity Log

Semua aksi user management di-log ke Laravel log:

- Create user (dengan role)
- Update user (data & role)
- Delete user
- Reset password user
- Toggle active status

## Permissions Detail

### Owner (All Permissions)

- view_users, create_users, edit_users, delete_users, activate_users, deactivate_users
- view_roles
- view_products, create_products, edit_products, delete_products
- view_categories, create_categories, edit_categories, delete_categories
- view_units, create_units, edit_units, delete_units
- create_transactions, view_transactions
- view_stock_movements
- view_expenses, create_expenses, edit_expenses, delete_expenses
- view_reports, export_reports
- view_settings, edit_shop_settings
- profile management, security (password, 2FA)

### Cashier (Limited Permissions)

- create_transactions, view_transactions
- view_reports
- appearance (theme)

## Feature Details

### User Status Logic

1. Saat login, sistem cek `is_active` pada user
2. Jika `is_active = false`, tampilkan error "Akun tidak aktif"
3. Toggle di management page langsung update status
4. Perubahan status langsung berlaku (user tidak bisa login jika non-aktif)

### Edit Transaction Flow

1. User klik tombol "Edit" pada transaksi yang statusnya `paid`
2. Modal edit muncul dengan semua item transaksi
3. User bisa:
    - Tambah item baru (pilih produk, harga, quantity)
    - Hapus item yang ada
    - Ubah quantity per item
    - Ubah harga per item
    - Ubah discount per item
    - Ubah catatan transaksi
4. Klik "Save Changes" → system:
    - Kembalikan stok produk lama (movement type: return)
    - Hapus semua item lama
    - Kurangi stok produk baru (movement type: sale)
    - Buat item baru dengan data yang diedit
    - Update total transaksi
5. Redirect ke halaman detail transaksi dengan pesan sukses

### Settings Menu Behavior

- **Owner**: Klik "Settings" di dropdown → ke `/settings/profile` (ada Profile, Security, Appearance tabs)
- **Cashier**: Klik "Settings" di dropdown → langsung ke `/settings/appearance`
- Route `/settings` redirect berdasarkan role

## Troubleshooting

### Login Error: "Akun ini bukan Owner/Cashier"

User tidak memiliki role yang dipilih. Pastikan email memiliki role yang sesuai.

### Login Error: "Akun Anda tidak aktif"

User aktif tapi field `is_active` = false. Hubungi administrator untuk mengaktifkan.

### Route Access Denied

Cashier tidak bisa akses route owner-only (products, categories, dll). Gunakan role yang sesuai.

### Error: "Tidak dapat menonaktifkan akun sendiri"

Sistem mencegah owner untuk menonaktifkan dirinya sendiri dari menu management.

### Toggle Button Tidak Merespons

Pastikan `is_active` ada di fillable array di `app/Models/User.php`. Jika toggle tidak update status:

1. Cek apakah user tersebut diri sendiri (tidak bisa toggle diri sendiri)
2. Cek log untuk error message
3. Refresh halaman setelah toggle

## Next Steps

- Enable email verification jika diperlukan
- Tambahkan lebih granular permissions
- Tambahkan audit trail dengan package lain (misal: spatie/laravel-activitylog)

## Product Code Feature

### Overview

Auto-generated unique product code dengan format "PRD" + 6 digit angka (PRD000001, PRD000002, dst).

### Features

- **Format**: PRD + 6 digit (contoh: PRD000001)
- **Unik**: Tidak mungkin duplikat
- **Tidak di-reuse**: Meskipun produk dihapus, nomor tidak digunakan kembali
- **Auto-generated**: Otomatis dibuat saat create produk baru

### Implementation

#### Database Migration

- Tabel: `products`
- Kolom: `product_code` (varchar 20, unique)
- Migration: `2026_04_04_053608_add_product_code_to_products_table.php`

#### Model

- `app/Models/Product.php`: Menambahkan event `creating` untuk auto-generate kode
- Menambahkan `product_code` ke fillable array

#### Service

- `app/Services/ProductCodeGenerator.php`:
    - Menggunakan database transaction dengan `lockForUpdate()` untuk prevent race condition
    - Mengambil nomor terakhir dari database dan increment
    - Format dengan zero-padding 6 digit

#### How It Works

1. Saat produk baru dibuat (POST /products), model Product触发 creating event
2. Jika `product_code` kosong, panggil ProductCodeGenerator
3. Generator mengunci tabel, ambil nomor terakhir, tambahkan 1
4. Format: PRD + 6 digit (contoh: PRD000001)
5. Simpan ke database

### Existing Products

Untuk produk yang sudah ada sebelumnya, jalankan perintah berikut di tinker:

```php
$products = App\Models\Product::all();
$generator = app(App\Services\ProductCodeGenerator::class);
foreach ($products as $product) {
    if (empty($product->product_code)) {
        $product->product_code = $generator->generate();
        $product->save();
    }
}
```
