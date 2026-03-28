# FASE 3: Inventory - Walkthrough

## Overview

FASE 3 berfokus pada manajemen inventaris dengan:

- ✅ Stock Movement tracking
- ✅ Auto-logging saat transaksi
- ✅ Riwayat pergerakan stok
- ✅ Low stock alert di dashboard

---

## Struktur Project

```
example-app/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── StockMovement/
│   │           └── StockMovementController.php
│   ├── Models/
│   │   └── StockMovement.php
│   └── Services/
│       └── TransactionService.php (enhanced)
├── database/
│   └── migrations/
│       └── 2025_03_28_000006_create_stock_movements_table.php
└── resources/
    └── js/
        └── pages/
            └── stock-movement/
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

### 1. Stock Movement Table

**Migration:** `2025_03_28_000006_create_stock_movements_table.php`

| Column        | Type      | Description                       |
| ------------- | --------- | --------------------------------- |
| id            | bigint    | Primary key                       |
| movement_type | enum      | in, out, adjustment, sale, return |
| qty           | int       | Jumlah perubahan                  |
| stock_before  | int       | Stok sebelum perubahan            |
| stock_after   | int       | Stok setelah perubahan            |
| reason        | string    | Alasan perubahan                  |
| product_id    | bigint    | FK ke products                    |
| user_id       | bigint    | FK ke users                       |
| reference_id  | bigint    | FK ke transactions (nullable)     |
| created_at    | timestamp |                                   |
| updated_at    | timestamp |                                   |

### 2. Auto-Logging saat Sale

Setiap kali transaksi berhasil, otomatis membuat record stock movement:

```php
// TransactionService.php
foreach ($data['items'] as $item) {
    // ... create transaction item

    StockMovement::create([
        'movement_type' => 'sale',
        'qty' => $item['quantity'],
        'stock_before' => $stockBefore,
        'stock_after' => $product->stock,
        'reason' => 'Penjualan - ' . $transaction->receipt_number,
        'product_id' => $item['product_id'],
        'user_id' => $userId,
        'reference_id' => $transaction->id,
    ]);
}
```

### 3. Manual Stock Movement

Admin bisa menambah pergerakan stok manual:

- **Stock IN** - Tambah stok (pembelian dari supplier)
- **Stock OUT** - Kurangi stok (rusak/hilang)
- **Adjustment** - Koreksi stok (stock opname)

### 4. Dashboard Low Stock Alert

Dashboard menampilkan:

- Today's Sales (jumlah transaksi)
- Today's Revenue (total pendapatan)
- Low Stock (jumlah produk di bawah min_stock)
- Low Stock Table (detail produk yang perlu restock)

---

## Routes

| Method | URI                | Description            |
| ------ | ------------------ | ---------------------- |
| GET    | `/stock-movements` | Stock movement history |
| POST   | `/stock-movements` | Create new movement    |

---

## Movement Types

| Type         | Keterangan                 | Warna di UI |
| ------------ | -------------------------- | ----------- |
| `in`         | Stok masuk (pembelian)     | Hijau       |
| `out`        | Stok keluar (rusak/hilang) | Merah       |
| `adjustment` | Koreksi stok               | Biru        |
| `sale`       | Penjualan (auto)           | Orange      |
| `return`     | Return barang (auto)       | Ungu        |

---

## Testing Checklist

- [ ] Checkout di POS - cek stock movement tercatat
- [ ] Tambah manual stock IN
- [ ] Kurangi manual stock OUT
- [ ] Adjustment stok
- [ ] Lihat history stock movements
- [ ] Dashboard low stock alert muncul
- [ ] Stok produk berubah setelah manual movement

---

## Next Steps

FASE 3 selesai. Available next phases:

- **FASE 4**: Expenses (pengeluaran)
- **FASE 5**: Reports (laporan & charts)
- **FASE 6**: Settings & Profile
- **FASE 7**: RBAC (user management)
- **FASE 8**: Payment Gateway (Midtrans/QRIS)

---

## Catatan

- TypeScript errors di IDE tidak 影响 fungsi
- Stock movement sudah otomatis tercatat saat sale
- Manual movement bisa ditambahkan sewaktu-waktu
