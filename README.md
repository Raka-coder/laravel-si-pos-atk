# Laravel POS (Point of Sale) with AI Integration 🚀

<div align="center">

[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React Version](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind Version](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

<p align="center">
  <img src="public/logo.svg" alt="Laravel POS Logo" width="80">
  <h3 align="center">Sistem POS Cerdas & Modern</h3>
  <p align="center">Solusi Point of Sale berbasis Cloud dengan Integrasi AI untuk Analisis Bisnis yang Lebih Akurat.</p>
</p>

---

## 📸 Preview
*(Tambahkan screenshot dashboard atau POS di sini)*
> **Note:** Gunakan file `public/og-image.svg` atau capture langsung dari aplikasi untuk visual yang lebih baik.

---

## ✨ Fitur Unggulan

- 🛒 **Point of Sale (POS):** 
  - Scan Barcode & Pencarian Produk Cepat.
  - Multi-payment (Tunai & Digital via Midtrans).
  - Kalkulasi Pajak & Diskon Real-time.
- 📦 **Inventory Management:**
  - Optimasi Gambar Produk otomatis saat upload.
  - Tracking Stok lengkap dengan *Stock Movement Log*.
  - *Automatic Barcode Generator* untuk setiap produk baru.
- 💸 **Financial Management:**
  - Pencatatan Pengeluaran Operasional harian.
  - Laporan Laba Rugi Otomatis (Omzet vs Expense).
  - Export laporan ke format Excel & PDF.
- 🤖 **AI Business Consultant:**
  - Chatbot berbasis **Gemini AI** untuk konsultasi performa bisnis.
  - Analisis tren penjualan dan saran strategi stok produk.
- 💳 **Seamless Payment Integration:**
  - Integrasi penuh dengan **Midtrans** (QRIS, E-Wallet, VA).
  - Webhook handler untuk sinkronisasi status pembayaran otomatis.

---

## 🛠️ Tech Stack & Requirements

### Requirements:
- **PHP** >= 8.4
- **Node.js** >= 20.x
- **MySQL** >= 8.0
- **Composer** & **NPM**

### Library Utama:
- **Backend:** Laravel 13, Fortify (Auth), Spatie Permission, Seotools.
- **Frontend:** React 19, Inertia.js v3, Tailwind CSS v4, Shadcn/UI, Lucide React.
- **Payment:** Midtrans PHP SDK.
- **AI:** Prism PHP (Gemini API Integration).
- **Export:** Maatwebsite Excel, DomPDF.

---

## 🚀 Instalasi Cepat

### 1. Clone & Install
```bash
git clone <repo-url>
cd <directory>

composer install
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```
Edit file `.env` dan sesuaikan konfigurasi database serta API Keys.

### 3. Storage Setup
Aplikasi ini menyimpan gambar produk dan logo toko di storage. Jalankan perintah berikut untuk membuat symbolic link:
```bash
php artisan storage:link
```

### 4. Database Migration & Seeding
```bash
php artisan migrate --seed
```

### 5. Jalankan Aplikasi
```bash
# Menggunakan script concurrently (Server + Vite + Queue + Pail)
composer run dev
```

---

## 🛣️ Daftar Route Utama

Sistem ini memiliki pembagian akses (RBAC) antara **Owner** dan **Kasir**. Berikut adalah beberapa endpoint utama:

### **Management (Owner Only)**
- `GET /users` - Manajemen User & Staff.
- `GET /product-categories` - Manajemen Kategori Produk.
- `GET /products` - Katalog Produk & Stok.
- `GET /shop-settings` - Pengaturan Identitas Toko & Pajak.
- `GET /reports/sales` - Laporan Penjualan & Ekspor Excel.
- `GET /reports/profit-loss` - Ringkasan Keuangan.

### **Operational (Owner & Kasir)**
- `GET /pos` - Antarmuka Kasir (Penjualan).
- `GET /transactions` - Riwayat Transaksi.
- `GET /chat` - AI Business Consultant (Chatbot).
- `GET /expenses` - Pencatatan Pengeluaran.
- `GET /dashboard` - Dashboard Statistik.

### **API & Webhook**
- `POST /midtrans/notification` - Endpoint Notifikasi Midtrans.
- `GET /api/dashboard/charts` - Data Chart Dashboard.

---

## 📡 Testing Pembayaran (Local with Ngrok)

Untuk menguji fitur pembayaran digital (Midtrans Webhook) di lingkungan lokal:

1. **Jalankan Ngrok:** `ngrok http 8000`
2. **Update APP_URL:** Salin URL Ngrok ke file `.env` (misal: `APP_URL=https://abcd.ngrok-free.app`).
3. **Konfigurasi Midtrans:** Isi **Payment Notification URL** di Dashboard Midtrans dengan `https://abcd.ngrok-free.app/midtrans/notification`.
4. **Test:** Lakukan transaksi di halaman POS via Midtrans dan selesaikan pembayaran di simulator.

---

## 🧪 Quality Control

```bash
# Menjalankan unit & feature tests
php artisan test

# Format kode PHP (Laravel Pint)
composer run lint

# Check Types & Frontend Linting
npm run types:check
npm run lint:check
```

---

## 📄 Lisensi
Project ini dilisensikan di bawah [MIT License](LICENSE).