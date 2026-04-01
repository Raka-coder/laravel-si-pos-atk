# FASE 7: RBAC & User Management

## Overview

FASE 7 implements Role-Based Access Control (RBAC) with User Management using Spatie Laravel Permission package.

## New Features

### 1. Roles & Permissions

- **Roles**: `owner` (Super Admin), `cashier` (Admin)
- **Permissions**: Medium granularity (view_users, create_users, edit_users, etc.)
- **Database Tables**: `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`

### 2. User Management (Owner Only)

- **CRUD Kasir**: Create, read, update, delete cashier accounts
- **Fields**: name, email, password, is_active
- **Features**:
    - Reset password kasir
    - Activate/deactivate kasir
    - Activity logging

### 3. Login with Role Selection

- Dropdown untuk pilih role (Owner / Cashier)
- Validasi user memiliki role yang dipilih
- Akun non-aktif tidak bisa login

### 4. Dashboard per Role

- **Owner**: Full dashboard (sales, revenue, expenses, low stock, products)
- **Cashier**: Simplified dashboard (sales & revenue only)

### 5. Sidebar Navigation per Role

- **Owner**: All menu items (Dashboard, POS, Transactions, Stock Movements, Products, Categories, Units, Expenses, Expense Categories, Reports, Manage User, Shop Settings)
- **Cashier**: Limited menu (Dashboard, POS, Transactions, Reports)

### 6. Edit Transaction (Cashier & Owner)

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

### 7. Settings Access per Role

- **Owner**: Full access (Profile, Security, Appearance)
- **Cashier**: Appearance only
- Redirect: `/settings` → Owner ke profile, Cashier ke appearance

## Changes Made

### Backend

#### New Files

- `app/Actions/Fortify/AttemptAuthentication.php` - Custom login authentication with role validation
- `app/Http/Controllers/User/UserController.php` - CRUD operations for kasir
- `app/Http/Requests/User/StoreUserRequest.php` - Validation for creating kasir
- `app/Http/Requests/User/UpdateUserRequest.php` - Validation for updating kasir

#### Modified Files

- `app/Models/User.php` - Added `HasRoles` trait
- `app/Providers/FortifyServiceProvider.php` - Added custom authentication
- `app/Http/Middleware/HandleInertiaRequests.php` - Added `isOwner` to shared data
- `bootstrap/app.php` - Registered Spatie middleware aliases (RoleMiddleware, PermissionMiddleware)
- `app/Http/Controllers/Transaction/TransactionController.php` - Added `update()` method for edit transaction
- `routes/settings.php` - Added `role:owner` middleware for profile & security routes

#### Database

- `2026_04_01_072303_create_permission_tables.php` - Spatie tables
- `2026_04_01_072326_add_is_active_to_users_table.php` - is_active column
- `2026_04_01_080614_create_shop_settings_table.php` - Shop settings table (FASE 6 fix)

#### Seeders

- `database/seeders/RolesAndPermissionsSeeder.php` - Creates roles, permissions, default users

### Frontend

#### New Files

- `resources/js/pages/users/index.tsx` - Kasir management page

#### Modified Files

- `resources/js/pages/auth/login.tsx` - Added role selection dropdown
- `resources/js/pages/dashboard.tsx` - Role-based dashboard rendering
- `resources/js/components/app-sidebar.tsx` - Role-based navigation
- `resources/js/types/auth.ts` - Added isOwner type
- `resources/js/pages/transaction/show.tsx` - Added edit transaction modal
- `resources/js/components/user-menu-content.tsx` - Settings link based on role

### Routes

- Owner-only routes: users CRUD, categories, units, products, expenses, stock-movements, shop settings, profile, security
- All authenticated routes: dashboard, pos, transactions, reports, appearance

## Default Users (After Seeding)

| Email                | Password | Role    |
| -------------------- | -------- | ------- |
| owner@atk-sync.com   | password | Owner   |
| cashier@atk-sync.com | password | Cashier |

## Test Credentials

1. **Owner Login**
    - Email: `owner@atk-sync.com`
    - Password: `password`
    - Role: Owner

2. **Cashier Login**
    - Email: `cashier@atk-sync.com`
    - Password: `password`
    - Role: Cashier

## Activity Log

Semua aksi user management di-log ke Laravel log:

- Create kasir
- Update kasir
- Delete kasir
- Reset password kasir
- Toggle active status
- Edit transaction (stock movements)

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

User aktif tapi field `is_active` = false. Hubungi administrator.

### Route Access Denied

Cashier tidak bisa akses route owner-only (products, categories, dll). Gunakan role yang sesuai.

### Error: "Class DB not found"

Perlu import `use Illuminate\Support\Facades\DB;` di controller.

### Error: Table 'shop_settings' not found

Jalankan migration: `php artisan migrate`

## Next Steps

- Enable email verification jika diperlukan
- Tambahkan lebih granular permissions
- Tambahkan audit trail dengan package lain (misal: spatie/laravel-activitylog)
