# Pembahasan Fitur dan Modul Sistem POS

Dokumen ini menjelaskan secara rinci mengenai fitur-fitur dan modul yang telah diimplementasikan dalam pengembangan sistem Point of Sales (POS). Pemilihan dan perancangan setiap modul didasarkan pada kebutuhan operasional usaha retail dan perdagangan secara umum.

## 1. Modul Autentikasi dan Keamanan

### 1.1 Sistem Autentikasi

Modul autentikasi berfungsi sebagai gerbang utama dalam mengamankan akses terhadap sistem. Sistem ini mengimplementasikan beberapa mekanisme autentikasi yang komprehensif untuk menjaga keamanan data dan transaksi.

**Fitur Utama:**

- **Login**: Sistem autentikasi berbasis kredensial yang terintegrasi dengan Laravel Fortify. Menggunakan email dan password sebagai credentials utama.
- **Registrasi**: Fitur pendaftaran pengguna baru dengan validasi email. Setiap pengguna baru akan diberikan role secara default berdasarkan konfigurasi sistem.
- **Password Reset**: Mekanisme pemulihan kata sandi melalui link reset yang dikirim via email.
- **Email Verification**: Verifikasi alamat email pengguna untuk memastikan kevalidan data kontak.

### 1.2 Keamanan Tingkat Lanjut

Untuk meningkatkan keamanan akun pengguna, sistem mengimplementasikan fitur keamanan tambahan sebagai berikut:

- **Two-Factor Authentication (2FA)**: Sistem autentikasi dua faktor menggunakan aplikasi authenticator (TOTP). Pengguna dapat mengaktifkan 2FA melalui pengaturan keamanan. Setiap login memerlukan kode 6 digit dari aplikasi authenticator.
- **Password Confirmation**: Konfirmasi kata sandi untuk tindakan sensitif seperti penghapusan akun.
- **Session Management**: Pengelolaan sesi login yang aman dengan timeout konfigurasi.

## 2. Modul Dashboard dan Analitik

Modul dashboard berfungsi sebagai pusat informasi dan analisis data penjualan. Sistem menyediakan dua jenis dashboard yang berbeda berdasarkan peran pengguna.

### 2.1 Owner Dashboard

Dashboard untuk pemilik usaha memberikan gambaran lengkap mengenai kondisi bisnis secara real-time.

**Kartu Indikator Kinerja:**

- Total penjualan hari ini (jumlah transaksi)
- Pendapatan hari ini
- Pendapatan bulanan
- Laba bersih bulanan (pendapatan dikurangi pengeluaran)
- Total pengeluaran hari ini dan bulan berjalan
- Jumlah produk dengan stok rendah
- Total produk aktif

**Visualisasi Data (Grafik dan Chart):**

- Grafik tren pendapatan 30 hari terakhir
- Perbandingan pendapatan bulanan (6 bulan)
- Metode pembayaran yang digunakan
- Produk terlaris
- Pendapatan berdasarkan kategori produk
- Penjualan per jam (jam sibuk)

**Fitur Peringatan:**

- Notifikasi produk dengan stok di bawah batas minimum

### 2.2 Cashier Dashboard

Dashboard untuk kasir dirancang lebih sederhana dengan fokus pada aktivitas penjualan harian.

**Kartu Indikator Kinerja:**

- Total penjualan hari ini
- Pendapatan hari ini
- Rata-rata nilai transaksi
- Jam sibuk (jam dengan penjualan tertinggi)

**Visualisasi Data:**

- Grafik penjualan per jam
- Metode pembayaran hari ini
- Produk terlaris hari ini

## 3. Modul Point of Sales (Kasir)

Modul POS merupakan inti dari sistem yang digunakan untuk melakukan transaksi penjualan. Modul ini dirancang dengan antarmuka yang intuitif untuk mempercepat proses kasir.

### 3.1 Antarmuka Kasir

Halaman kasir menampilkan beberapa komponen utama:

- **Area Produk**: Daftar produk yang tersedia dengan pencarian berdasarkan barcode atau nama.
- **Keranjang Belanja**: Daftar item yang akan dibeli dengan fasilitas perubahan jumlah.
- **Informasi Pembeli**: Bagian untuk mencatat nama atau nomor telepon pembeli (opsional).

### 3.2 Fitur Keranjang

Sistem keranjang belanja memiliki kemampuan manajemen item yang lengkap:

- **Penambahan Item**: Dapat dilakukan melalui klik produk atau pemindaian barcode.
- **Pengubahan Jumlah**: Fasilitas increment dan decrement jumlah item.
- **Penghapusan Item**: Penghapusan item dari keranjang.
- **Perhitungan Otomatis**: Subtotal, pajak (11%), dan total dihitung secara real-time.
- **Batasan Stok**: Sistem mencegah penambahan jumlah melebihi stok tersedia.

### 3.3 Proses Transaksi

Setelah items ditambahkan ke keranjang, kasir dapat menyelesaikan transaksi dengan:

- Pemilihan metode pembayaran (Tunai, QRIS, Debit, Kredit)
- Input jumlah pembayaran dari顾客
- Pencetakan struk transaksi
- Pengurangan stok otomatis

## 4. Modul Transaksi

Modul transaksi mengelola semua data penjualan yang terjadi dalam sistem.

### 4.1 Daftar Transaksi

Halaman daftar transaksi menampilkan semua transaksi yang pernah dilakukan dengan fitur:

- Pencarian berdasarkan kode transaksi, nama pembeli, atau tanggal
- Filter berdasarkan rentang tanggal
- Detail transaksi lengkap
- Pencetakan ulang struk

### 4.2 Detail Transaksi

Setiap transaksi menyimpan informasi lengkap meliputi:

- Kode dan tanggal transaksi
- Data kasir yang melayani
- Daftar item yang dibeli dengan harga masing-masing
- Subtotal, pajak, dan total
- Metode pembayaran
- Status keberhasilan transaksi

## 5. Modul Produk

Modul produk digunakan untuk mengelola data inventaris barang dagangan.

### 5.1 Manajemen Produk

Fitur manajemen produk meliputi:

- **Tambah Produk**: Penambahan produk baru dengan input barcode, nama, harga beli, harga jual, stok, batas minimum stok, kategori, dan unit.
- **Edit Produk**: Perubahan data produk yang sudah ada.
- **Hapus Produk**: Penghapusan produk dari sistem.
- **Status Produk**: Produk dapat diaktifkan atau dinonaktifkan tanpa dihapus.

### 5.2 Manajemen Kategori

Kategori digunakan untuk mengelompokkan produk berdasarkan jenisnya.

- **Tambah Kategori**: Penambahan kategori baru.
- **Edit Kategori**: Perubahan nama kategori.
- **Hapus Kategori**: Penghapusan kategori (produk terkait akan kehilangan kategori).

### 5.3 Manajemen Unit

Unit digunakan untuk menentukan satuan ukuran produk.

- **Tambah Unit**: Penambahan unit baru (contoh: pcs, kg, liter).
- **Edit Unit**: Perubahan nama dan singkatan unit.
- **Hapus Unit**: Penghapusan unit (produk terkait akan kehilangan unit).

## 6. Modul Stok dan Pergerakan Stok

Modul ini mengelola pergerakan stok produk untuk keperluan audit dan pencatatan.

### 6.1 Pergerakan Stok

Sistem mencatat semua pergerakan stok:

- **Penambahan Stok**: Dari transaksi pembelian atau penyesuaian.
- **Pengurangan Stok**: Dari transaksi penjualan.
- **Penyesuaian Stok**: Koreksi jumlah stok secara manual.

### 6.2 Riwayat Pergerakan

Setiap produk memiliki riwayat pergerakan stok lengkap meliputi:

- Tanggal pergerakan
- Tipe pergerakan (masuk/keluar/penyesuaian)
- Jumlah perubahan
- Alasan pergerakan
- Operator yang melakukan

## 7. Modul Pengeluaran

Modul pengelolaan pengeluaran untuk mencatat seluruh biaya operasional usaha.

### 7.1 Kategori Pengeluaran

Sebelum mencatat pengeluaran, pengguna dapat membuat kategori biaya seperti:

- Biaya listrik
- Biaya air
- Gaji karyawan
- Biaya sewa
- Biaya Maintenance
- Lainnya

### 7.2 Pencatatan Pengeluaran

Fitur pencatatan pengeluaran meliputi:

- **Tambah Pengeluaran**: Pencatatan pengeluaran baru dengan tanggal, kategori, jumlah, dan deskripsi.
- **Edit Pengeluaran**: Koreksi data pengeluaran.
- **Hapus Pengeluaran**: Penghapusan catatan pengeluaran.

## 8. Modul Laporan

Modul laporan menyediakan data analitik untuk pengambilan keputusan bisnis.

### 8.1 Laporan Penjualan

Laporan penjualan memberikan informasi:

- Total penjualan per periode
- Tren penjualan
- Produk terlaris
- Metode pembayaran paling populer

### 8.2 Laporan Laba/Rugi

Laporan laba/rugi menghitung:

- Total pendapatan penjualan
- Total harga beli barang terjual (COGS)
- Total pengeluaran operasional
- Laba bersih (pendapatan - COGS - pengeluaran)

### 8.3 Laporan Pengeluaran

Laporan expenditures memberikan detail:

- Pengeluaran per kategori
- Perbandingan antar periode
- Total pengeluaranbulanan

## 9. Modul Pengguna

Modul pengelolaan pengguna dengan sistem role-based access control.

### 9.1 Manajemen Pengguna

Administrator dapat mengelola pengguna:

- **Tambah Pengguna**: Penambahan pengguna baru dengan role (Owner/Cashier).
- **Edit Pengguna**: Perubahan data pengguna.
- **Hapus Pengguna**: Penghapusan pengguna dari sistem.

### 9.2 Role dan Izin

Sistem membedakan dua role utama:

- **Owner**: Akses penuh ke semua modul termasuk laporan dan pengaturan.
- **Cashier**: Hanya akses ke dashboard kasir, POS, dan transaksi.

## 10. Modul Pengaturan

Modul pengaturan untuk konfigurasi sistem sesuai kebutuhan usaha.

### 10.1 Pengaturan Toko

Pengaturan umum toko:

- Nama toko
- Alamat
- Nomor telepon
- Footer struk (pesan tambahan pada struk)

### 10.2 Pengaturan Profil

Pengguna dapat mengubah:

- Nama
- Email
- Password

### 10.3 Pengaturan Tampilan

Pengaturan antarmuka pengguna:

- Mode gelap/terang (dark mode)
- Warna tema aplikasi

## 11. Modul AI Chatbot

Integrasi asisten virtual untuk membantu pengguna.

### 11.1 Fitur Chatbot

Chatbot dengan kecerdasan buatan memberikan kemampuan:

- Jawaban pertanyaan tentang sistem
- Informasi produk dan inventaris
- Ringkasan penjualan
- Saran produk berdasarkan tren

### 11.2 Riwayat Percakapan

Sistem menyimpan histori percakapan untuk keperluan evaluasi dan peningkatan layanan.

## 12. Kesimpulan

Sistem POS ini mengimplementasikan modul-modul yang komprehensif untuk mendukung operasional usaha retail. Dari autentikasi hingga laporan, setiap modul dirancang dengan prinsip kegunaan dan efisiensi kerja. Integrasi antar modul memastikan alur data yang smooth dari transaksi hingga laporan analitik.
