# FASE 5: Reports - Walkthrough

## Overview

FASE 5 focuses on business reporting and analytics:

- ✅ Sales Report with date range filter
- ✅ Expenses Report with date range filter
- ✅ Profit & Loss Report (Gross Profit, Expenses, Net Profit)
- ✅ **Excel Export for Sales Report**
- ✅ **Excel Export for Expenses Report**
- ✅ Navigation menu for Reports

---

## Project Structure

```
example-app/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── ReportController.php
│   └── Exports/
│       ├── SalesReportExport.php
│       └── ExpensesReportExport.php
├── routes/
│   └── web.php
└── resources/
    └── js/
        └── pages/
            └── report/
                ├── sales.tsx
                ├── expenses.tsx
                └── profit-loss.tsx
```

---

## How to Run

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Open `http://localhost:8000/dashboard` and click "Reports" in the sidebar.

---

## Features Implemented

### 1. Sales Report

**Route:** `/reports/sales`

**Features:**

- Filter by date range (start_date, end_date)
- Summary cards: Total Revenue, Total Transactions, Gross Profit
- Transaction list with receipt number, cashier, payment method, total
- Pagination
- **Export Excel** - Download current filtered data as `.xlsx`

**Database Query:**

- Filters transactions by date range
- Calculates gross profit from (sell_price - buy_price) × quantity

### 2. Expenses Report

**Route:** `/reports/expenses`

**Features:**

- Filter by date range
- Summary card: Total Expenses
- Expense list with date, name, category, note, amount
- Pagination
- **Export Excel** - Download current filtered data as `.xlsx`

### 3. Profit & Loss Report

**Route:** `/reports/profit-loss`

**Features:**

- Filter by date range
- Summary cards:
    - Gross Profit (from sales)
    - Total Expenses
    - Net Profit (Gross Profit - Expenses)
- Daily breakdown table: Date, Sales, Expenses, Net

**Calculation:**

```
Gross Profit = Σ((sell_price - buy_price) × quantity)
Total Expenses = Σ(expenses.amount)
Net Profit = Gross Profit - Total Expenses
```

### 4. Navigation

Added "Reports" menu in sidebar that links to `/reports/sales`.

---

## Routes

| Method | URI                        | Description              |
| ------ | -------------------------- | ------------------------ |
| GET    | `/reports/sales`           | Sales report             |
| GET    | `/reports/sales/export`    | Export Sales to Excel    |
| GET    | `/reports/expenses`        | Expenses report          |
| GET    | `/reports/expenses/export` | Export Expenses to Excel |
| GET    | `/reports/profit-loss`     | Profit & Loss report     |

---

## Dependencies

- **maatwebsite/excel** (v3.1.68) - For Excel export functionality

---

## Testing Checklist

- [ ] View sales report with date filter
- [ ] View expenses report with date filter
- [ ] View profit & loss report
- [ ] Navigate between different report pages
- [ ] Verify calculations are correct
- [ ] **Export Sales Report to Excel** - Click "Export Excel" button
- [ ] **Export Expenses Report to Excel** - Click "Export Excel" button

---

## Excel Export Usage

1. **Sales Report**: Go to `/reports/sales`, select date range, click "Export Excel"
2. **Expenses Report**: Go to `/reports/expenses`, select date range, click "Export Excel"

File naming convention: `sales_report_YYYY-MM-DD_to_YYYY-MM-DD.xlsx`

---

## Next Steps

FASE 5 complete. Available next phases:

- **FASE 6**: Settings & Profile (Shop settings, User profile) - has access issue
- **FASE 7**: RBAC (User management, Roles, Permissions)
- **FASE 8**: Payment Gateway (Midtrans/QRIS integration)

---

## Known Issues

- FASE 6 Shop Settings page has "Page not found" error - needs investigation
