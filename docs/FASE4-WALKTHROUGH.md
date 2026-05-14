# FASE 4: Expenses - Walkthrough

## Overview

FASE 4 berfokus pada manajemen pengeluaran (expenses):

- ✅ Expense categories CRUD
- ✅ Expenses CRUD
- ✅ Dashboard expense summary
- ✅ Filter by date & category

---

## Struktur Project

```
example-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Expense/
│   │   │   │   └── ExpenseController.php
│   │   │   └── ExpenseCategory/
│   │   │       └── ExpenseCategoryController.php
│   │   └── Requests/
│   │       ├── Expense/
│   │       │   ├── StoreExpenseRequest.php
│   │       │   └── UpdateExpenseRequest.php
│   │       └── ExpenseCategory/
│   │           ├── StoreExpenseCategoryRequest.php
│   │           └── UpdateExpenseCategoryRequest.php
│   └── Models/
│       ├── Expense.php
│       └── ExpenseCategory.php
├── database/
│   └── migrations/
│       ├── 2025_03_28_000007_create_expense_categories_table.php
│       └── 2025_03_28_000008_create_expenses_table.php
└── resources/
    └── js/
        └── pages/
            ├── expense-category/
            │   └── index.tsx
            └── expense/
                └── index.tsx
```

---

## Cara Menjalankan

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Buka `http://localhost:8000/dashboard`

---

## Fitur yang Diimplementasikan

### 1. Expense Categories

**Database:** `expense_categories`

| Column     | Type         | Description   |
| ---------- | ------------ | ------------- |
| id         | bigint       | Primary key   |
| name       | varchar(100) | Category name |
| created_at | timestamp    |               |
| updated_at | timestamp    |               |

**Routes:**
| Method | URI | Description |
|--------|-----|-------------|
| GET | `/expense-categories` | List categories |
| POST | `/expense-categories` | Create category |
| PUT/PATCH | `/expense-categories/{id}` | Update category |
| DELETE | `/expense-categories/{id}` | Delete category |

### 2. Expenses

**Database:** `expenses`

| Column              | Type          | Description                         |
| ------------------- | ------------- | ----------------------------------- |
| id                  | bigint        | Primary key                         |
| user_id             | bigint        | FK ke users                         |
| expense_category_id | bigint        | FK ke expense_categories (nullable) |
| name                | varchar(255)  | Expense name                        |
| amount              | decimal(15,2) | Jumlah pengeluaran                  |
| date                | date          | Tanggal pengeluaran                 |
| note                | text          | Catatan (nullable)                  |
| created_at          | timestamp     |                                     |
| updated_at          | timestamp     |                                     |

**Indexes:**

- user_id
- expense_category_id
- date

**Routes:**
| Method | URI | Description |
|--------|-----|-------------|
| GET | `/expenses` | List expenses |
| POST | `/expenses` | Create expense |
| PUT/PATCH | `/expenses/{id}` | Update expense |
| DELETE | `/expenses/{id}` | Delete expense |

### 3. Dashboard Widget

Dashboard menampilkan:

- Today's Sales (jumlah transaksi)
- Today's Revenue (pendapatan hari ini)
- Today's Expenses (pengeluaran hari ini)
- Low Stock (produk di bawah min_stock)
- Total Products

---

## Testing Checklist

- [ ] Create expense category
- [ ] Edit expense category
- [ ] Delete expense category
- [ ] Create expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] View expenses list
- [ ] Dashboard shows today's expenses

---

## Next Steps

FASE 4 selesai. Available next phases:

- **FASE 5**: Reports (laporan & charts)
- **FASE 6**: Settings & Profile
- **FASE 7**: RBAC (user management)
- **FASE 8**: Payment Gateway (Midtrans/QRIS)

---

## Catatan

- TypeScript errors di IDE tidak 影响 fungsi
- Filter by date dan category sudah tersedia di expenses page
- Expense summary sudah ada di dashboard
