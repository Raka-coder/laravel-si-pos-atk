# FASE 6: Settings & Profile - Walkthrough

## Overview

FASE 6 focuses on shop configuration and user profile management:

- ✅ Shop Settings with full configuration
- ✅ Image upload for logo and QRIS with edit/remove capability
- ✅ Tax rate configuration connected to POS and receipts
- ✅ Paper size selection for receipts
- ✅ Receipt footer text customization
- ✅ Shop name, address, and logo connected to receipts
- ✅ Fix floating point price calculations (no more 0.01 decimals)
- ✅ Profile already available at `/settings/profile`

---

## Project Structure

```
example-app/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Settings/
│   │           └── ShopSettingController.php
│   ├── Models/
│   │   └── ShopSetting.php
│   └── Services/
│       └── TransactionService.php (updated to use shop tax_rate)
├── routes/
│   └── web.php
├── resources/
│   ├── js/
│   │   └── pages/
│   │       └── shop/
│   │           └── index.tsx
│   └── views/
│       └── receipts/
│           └── transaction.blade.php (updated)
└── docs/
    └── FASE6-WALKTHROUGH.md
```

---

## How to Run

```bash
# Terminal 1
php artisan serve

# Running for preview images
php artisan storage:link

# Terminal 2
npm run dev
```

Open `http://localhost:8000/dashboard` and click "Shop Settings" in the sidebar.

---

## Features Implemented

### 1. Shop Settings

**Route:** `/shop-settings`

**Database:** `shop_settings` table (already exists)

| Column               | Type         | Description                 |
| -------------------- | ------------ | --------------------------- |
| id                   | bigint       | Primary key                 |
| shop_name            | varchar(255) | Shop name                   |
| address              | text         | Shop address                |
| email                | varchar(255) | Shop email                  |
| phone                | varchar(50)  | Shop phone                  |
| logo_path            | varchar      | Logo image path             |
| qris_image_path      | varchar      | QRIS image path             |
| midtrans_merchant_id | varchar(100) | Midtrans merchant ID        |
| tax_rate             | decimal(5,2) | Tax rate (default 11%)      |
| receipt_footer       | text         | Footer text on receipt      |
| paper_size           | varchar(20)  | Paper size (mm_58 or mm_80) |
| created_at           | timestamp    |                             |
| updated_at           | timestamp    |                             |

**Features:**

- Shop information (name, address, email, phone)
- ✅ **NPWP field removed** - simplified form
- ✅ **Image upload** - logo and QRIS with edit/remove (trash icon)
- ✅ **Tax rate** - dynamically used in POS and receipts
- ✅ **Paper size** - affects receipt width (58mm or 80mm)
- ✅ **Receipt footer** - custom text on receipts
- Auto-create default shop settings on first access

### 2. Integration with POS & Receipts

**Connected Features:**

| Feature            | Integration                      | File                        |
| ------------------ | -------------------------------- | --------------------------- |
| **Shop Logo**      | Displayed on receipt header      | `transaction.blade.php`     |
| **Shop Name**      | Displayed on receipt header      | `transaction.blade.php`     |
| **Address/Phone**  | Displayed on receipt header      | `transaction.blade.php`     |
| **Tax Rate**       | Used in POS checkout calculation | `TransactionService.php`    |
| **Paper Size**     | Determines receipt width         | `TransactionController.php` |
| **Receipt Footer** | Custom thank you message         | `transaction.blade.php`     |

**Files Modified:**

- `app/Services/TransactionService.php` - Uses `ShopSetting::getShop()->tax_rate`
- `app/Http/Controllers/TransactionController.php` - Passes shop data to POS and receipt
- `resources/views/receipts/transaction.blade.php` - Uses shop data for logo, header, footer
- `resources/js/stores/cartStore.ts` - Fix floating point prices

### 3. Receipt Structure

**Receipt (Struk) now displays:**

```
┌─────────────────────┐
│   [LOGO]            │  ← From shop_settings
│   Shop Name         │  ← From shop_settings
│   Address          │  ← From shop_settings
│   Phone            │  ← From shop_settings
├─────────────────────┤
│ No: TRX-20260401-0001
│ Kasir: Admin
│ Tanggal: 01/04/2026
├─────────────────────┤
│ Item    Qty  Harga   │
│ Product  2   10.000│
│ Product  1   15.000│
├─────────────────────┤
│ Subtotal: Rp 25.000 │
│ PPN (11%): Rp 2.750│  ← From shop_settings
│ TOTAL: Rp 27.750    │
├─────────────────────┤
│ Bayar: Rp 30.000    │
│ Kembalian: Rp 2.250 │
├─────────────────────┤
│ Terima kasih atas   │  ← From shop_settings
│ kunjungan Anda!    │
└─────────────────────┘
```

### 4. Price Calculation Fix

**Issue:** Floating point math causing 0.01 differences

```
Before: 10000 + 1100.01 = 11100.01  ❌
After:  Math.round() → 10000 + 1100 = 11100  ✅
```

**Solution:** Added `Math.round()` in `cartStore.ts`:

- `addItem()` - rounds subtotal
- `updateQuantity()` - rounds subtotal
- `calculateTotals()` - rounds all totals

### 5. Profile Settings

**Route:** `/settings/profile`

Already available with features:

- Update name and email
- Email verification
- Delete account

### 6. Other Settings Pages

Existing pages:

- `/settings/security` - Password change, 2FA
- `/settings/appearance` - Theme preference

---

## Routes

| Method | URI              | Description          |
| ------ | ---------------- | -------------------- |
| GET    | `/shop-settings` | View shop settings   |
| PUT    | `/shop-settings` | Update shop settings |

---

## Testing Checklist

- [ ] View shop settings page
- [ ] Upload logo image → appears on receipt
- [ ] Remove logo image (click trash icon)
- [ ] Upload QRIS image
- [ ] Remove QRIS image (click trash icon)
- [ ] Change tax rate (e.g., 11% → 10%) → verify in POS
- [ ] Change paper size (58mm / 80mm)
- [ ] Add custom receipt footer text
- [ ] **Create a POS transaction** - verify NO 0.01 decimals
- [ ] **Download receipt PDF** - verify logo, shop name, address, footer appear
- [ ] Save settings and verify persistence

---

## Next Steps

FASE 6 complete. Available next phases:

- **FASE 7**: RBAC (User management, Roles, Permissions)
- **FASE 8**: Payment Gateway (Midtrans/QRIS integration)

---

## Notes

- Shop settings auto-creates on first access if not exists
- Image upload limited to 2MB per file
- Tax rate dynamically fetched from `shop_settings` table
- Paper size affects receipt print width (58mm or 80mm)
- NPWP field was removed as per requirement
- Receipt uses dynamic data: logo, shop_name, address, phone, tax_rate, paper_size, receipt_footer
- All prices in POS are now integers (no floating point errors)
