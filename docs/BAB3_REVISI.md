# BAB III TAHAP PELAKSANAAN

## 3.1 Penetapan Dasar Kegiatan Berdasarkan Kondisi Mitra

Penetapan dasar kegiatan Program Kreativitas Mahasiswa Pengabdian kepada Masyarakat (PKM-PM) ini berasal dari hasil pengamatan dan percakapan langsung dengan mitra UMKM Toko ATK. Berdasarkan hasil identifikasi awal yang telah dilakukan, teridentifikasi empat masalah utama yang dihadapi mitra dalam menjalankan operasional toko setiap hari. Pertama, pencatatan stok barang yang masih dilakukan secara manual dengan menggunakan buku catatan, sehingga mengakibatkan data stok seringkali tidak tepat dan sulit untuk mengetahui ketersediaan barang secara real-time. Kedua, lambatnya proses transaksi penjualan karena perhitungan masih menggunakan kalkulator secara manual, sehingga menyebabkan antrean panjang di kasir dan berisiko terjadinya kesalahan perhitungan. Ketiga, kurangnya sistem pencatatan keuangan yang terintegrasi, sehingga pemilik toko mengalami kesulitan dalam mengetahui laba-rugi usaha dengan akurat dan tepat waktu. Keempat, cara pembayaran yang hanya mengandalkan uang tunai, sehingga pelanggan yang menggunakan dompet digital tidak dapat melakukan transaksi dan toko kehilangan peluang penjualan yang potensial.

## 3.2 Langkah-Langkah Strategis Realisasi Gagasan

Pelaksanaan gagasan dilakukan melalui beberapa tahapan yang saling terintegrasi. Tahap pertama adalah tahap persiapan yang meliputi koordinasi antara tim dan dosen pendamping, penyiapan administrasi, serta studi literatur sebagai dasar pengembangan sistem. Tahap kedua adalah tahap analisis dan perancangan sistem yang mencakup penyusunan arsitektur sistem, perancangan database, desain antarmuka pengguna, serta pengaturan aspek keamanan. Tahap ketiga adalah tahap pengembangan sistem yang dibangun menggunakan Laravel sebagai framework backend, React untuk frontend, serta MySQL untuk penyimpanan data. Tahap keempat adalah tahap pengujian yang meliputi pengujian fungsional, keamanan, performa, serta User Acceptance Testing bersama mitra untuk memastikan sistem sesuai kebutuhan. Tahap kelima adalah tahap implementasi dan pelatihan yang meliputi instalasi sistem di toko mitra disertai pelatihan bagi pemilik dan karyawan agar dapat mengoperasikan sistem secara mandiri. Tahap keenam adalah tahap monitoring dan evaluasi yang dilakukan untuk memantau penggunaan sistem, mengidentifikasi kendala, serta mengumpulkan umpan balik dari mitra.

## 3.3 Solusi Inti Kegiatan (IPTEK yang Diterapkan)

Solusi utama yang diberikan dalam program PKM-PI ini adalah ATK-SYNC POS, yaitu sistem Point of Sale dan manajemen inventaris terintegrasi berbasis web. Sistem ini dibangun menggunakan arsitektur modern yang menggabungkan keunggulan backend dan frontend secara optimal, dengan pemilihan teknologi didasarkan pada kesesuaian kebutuhan fungsional dan kelayakan implementasi.

### 3.3.1 Arsitektur Sistem

Sistem menggunakan PHP 8.4 dengan framework Laravel 13 sebagai backend. Laravel dipilih karena menyediakan fitur bawaan untuk autentikasi, otorisasi, manajemen database, dan keamanan yang relevan untuk sistem POS. Untuk autentikasi dan otorisasi, sistem menggunakan Laravel Fortify dengan integrasi Spatie Laravel Permission untuk Role-Based Access Control (RBAC) yang mendukung dua level pengguna yaitu Superadmin dan Admin, serta two-factor authentication.

Database menggunakan MySQL yang dijalankan pada server hosting yang sama untuk efisiensi biaya dan kemudahan maintenance. Komunikasi frontend-backend menggunakan Inertia.js v3 yang memungkinkan integrasi seamless antara server-side rendering Laravel dengan client-side rendering React. Penyimpanan file dan gambar produk menggunakan Supabase Storage yang menyediakan free tier dengan kapasitas memadai dan CDN integration.

Sisi frontend dibangun dengan React 19 untuk membangun antarmuka pengguna yang responsif dan interaktif. Styling menggunakan Tailwind CSS v4 dengan integrasi shadcn/ui untuk komponen UI yang konsisten dan profesional. State management menggunakan Zustand, sedangkan visualisasi data dashboard menggunakan Recharts/Highchart.

### 3.3.2 Fitur Utama Sistem

Sistem ATK-SYNC POS terdiri dari delapan modul utama yang saling terintegrasi. Modul Point of Sale memungkinkan transaksi cepat dengan fitur pencarian barcode, keranjang belanja, perhitungan otomatis, serta pembayaran tunai dan QRIS. Modul pengelolaan inventaris menyediakan pencatatan stok real-time, notifikasi stok minimum, dan penyesuaian stok manual. Modul manajemen pengguna menangani autentikasi dan otorisasi dengan dua level akses. Modul notifikasi cerdas memberikan peringatan otomatis untuk stok menipis dan penurunan penjualan. Modul dashboard analitik menyajikan visualisasi tren penjualan dan performa bisnis. Modul laporan menyediakan laporan penjualan, laba-rugi, dan ekspor PDF/CSV. Modul pengeluaran mengelola pencatatan dan riwayat pengeluaran toko. Modul pengaturan mengelola profil toko dan konfigurasi QRIS.

### 3.3.3 Teknologi Pendukung

Pengembangan sistem didukung oleh beberapa library tambahan. Midtrans digunakan sebagai payment gateway untuk integrasi QRIS. Intervention Image untuk manipulasi gambar produk. Maatwebsite Excel untuk ekspor laporan format spreadsheet. Barryvdh DomPDF untuk pembuatan dokumen PDF. Laravel Wayfinder untuk type-safe route functions. Date-fns untuk formatting tanggal di frontend.

## 3.4 Rancangan Pengukuran Capaian Kegiatan

Pengukuran capaian dilakukan melalui enam parameter terukur dengan indikator spesifik.

### 3.4.1 Ketepatan Data Persediaan

Sasaran: data stok lebih tepat dari pencatatan manual. Indikator: perbedaan maksimal 2% antara sistem dan perhitungan fisik, pencatatan otomatis stock movements, notifikasi stok minimum berjalan sesuai ambang batas. Pengukuran: perbandingan mingguan.

### 3.4.2 Kemudahan Penyajian Laporan Keuangan

Sasaran: laporan dapat diakses kapan saja. Indikator: laporan tersedia dalam waktu kurang dari 3 detik, akurasi otomatis minimal 98%, ekspor PDF/CSV berfungsi.

### 3.4.3 Pemanfaatan Pembayaran Digital

Sasaran: metode pembayaran QRIS tersedia. Indikator: minimal 30% transaksi menggunakan QRIS per bulan, integrasi Midtrans berfungsi, tingkat keberhasilan transaksi 95%.

### 3.4.4 Kecepatan Transaksi Kasir

Sasaran: transaksi lebih cepat dari sistem manual. Indikator: waktu rata-rata maksimal 2 menit untuk 10 item, pencarian produk kurang dari 2 detik, pembayaran dan pencetakan struk maksimal 30 detik.

### 3.4.5 Keamanan Sistem

Sasaran: data terlindungi. Indikator: two-factor authentication berfungsi, RBAC berjalan sesuai peran, audit trail tersedia untuk setiap transaksi.

### 3.4.6 Kepuasan Pengguna

Sasaran: mitra dapat mengoperasikan sistem. Indikator: 80% fitur digunakan dalam sebulan, tidak ada keluhan kritis, nilai kepuasan minimal 7/10.

## 3.5 Pihak-Pihak yang Terlibat

Implementasi aplikasi ATK-SYNC POS melibatkan kolaborasi beberapa pihak dengan peran spesifik. Tim Pelaksana PKM terdiri dari Raka Restu Saputra sebagai Ketua yang bertanggung jawab atas manajemen proyek, komunikasi dengan mitra, dan analisis kebutuhan sistem. Anggota tim meliputi Tazril DWI Aprila yang berfokus pada perancangan sistem dan desain antarmuka, Muhammad Ikhsan Fahriza yang bertanggung jawab pada pengujian dan quality assurance, serta Fauzan Iffat Chairullah yang menangani sosialisasi dan pelatihan kepada mitra.

Dosen Pembimbing Bapak Ir. Alam Rahmatulloh, S.T., M.T., MCE., IPM. berperan dalam memberikan bimbingan teknis dan akademik, memastikan kesesuaian kegiatan dengan tujuan program, serta memvalidasi laporan yang dihasilkan. Mitra usaha berupa Toko ATK setempat berperan sebagai pengguna akhir sistem dan pemberi umpan balik untuk pengembangan dan penyempurnaan sistem.

---

# LAMPIRAN 2. JUSTIFIKASI ANGGARAN KEGIATAN

## Tabel Rincian Anggaran Kegiatan

| No.    | Jenis Pengeluaran                          | Volume            | Harga Satuan (Rp) | Besaran Dana (Rp) |
| ------ | ------------------------------------------ | ----------------- | ----------------- | ----------------- |
| **1.** | **Bahan Habis Pakai**                      |                   |                   | **Rp 3.135.000**  |
| 1.1    | Laravel Cloud Hosting (Laravel Forge)      | 1 unit × 4 bulan  | Rp 500.000        | Rp 2.000.000      |
| 1.2    | MySQL Server (Local on Hosting)            | 1 unit × 4 bulan  | Rp 0              | Rp 0              |
| 1.3    | Domain .my.id                              | 1 unit × 1 tahun  | Rp 35.000         | Rp 35.000         |
| 1.4    | Midtrans - Integrasi Payment Gateway QRIS  | 1 paket setup     | Rp 300.000        | Rp 300.000        |
| 1.5    | Supabase Storage - File & Image Storage    | 1 unit × 4 bulan  | Rp 0              | Rp 0              |
| 1.6    | Figma Professional - UI/UX Design Tool     | 1 paket × 3 bulan | Rp 141.000        | Rp 423.000        |
| 1.7    | Laravel Herd Pro - Local Dev Environment   | 1 lisensi         | Rp 377.000        | Rp 377.000        |
|        | **Sub Total**                              |                   |                   | **Rp 3.135.000**  |
| **2.** | **Sewa dan Jasa**                          |                   |                   | **Rp 1.200.000**  |
| 2.1    | Canva Pro - Desain Konten Media Sosial     | 1 paket × 3 bulan | Rp 219.000        | Rp 657.000        |
| 2.2    | CapCut Pro - Editing Video Promosi         | 1 unit × 1 bulan  | Rp 103.000        | Rp 103.000        |
| 2.3    | Jasa Cetak Modul Pelatihan Mitra UMKM      | 5 eksemplar       | Rp 88.000         | Rp 440.000        |
|        | **Sub Total**                              |                   |                   | **Rp 1.200.000**  |
| **3.** | **Transportasi Lokal**                     |                   |                   | **Rp 1.350.000**  |
| 3.1    | Survei & koordinasi awal ke mitra toko ATK | 2 kali × 4 orang  | Rp 50.000         | Rp 400.000        |
| 3.2    | Koordinasi tim & sesi pengembangan sistem  | 4 kali × 5 orang  | Rp 40.000         | Rp 800.000        |
| 3.3    | Sosialisasi & demo ke mitra UMKM           | 1 kali × 3 orang  | Rp 50.000         | Rp 150.000        |
|        | **Sub Total**                              |                   |                   | **Rp 1.350.000**  |
| **4.** | **Lain-Lain**                              |                   |                   | **Rp 650.000**    |
| 4.1    | Pendaftaran Hak Cipta / HKI Produk         | 1 produk          | Rp 300.000        | Rp 300.000        |
| 4.2    | Biaya Iklan Media Sosial (Ads berbayar)    | 1 paket           | Rp 200.000        | Rp 200.000        |
| 4.3    | Cetak Banner Sosialisasi Digitalisasi UMKM | 1 item            | Rp 150.000        | Rp 150.000        |
|        | **Sub Total**                              |                   |                   | **Rp 650.000**    |
|        | **GRAND TOTAL**                            |                   |                   | **Rp 6.335.000**  |

## Rekap Sumber Dana

| Sumber Dana      | Jumlah (Rp)      |
| ---------------- | ---------------- |
| Belmawa          | Rp 5.685.000     |
| Perguruan Tinggi | Rp 650.000       |
| Instansi Lain    | Rp 0             |
| **Jumlah**       | **Rp 6.335.000** |

## Penjelasan Rinci Anggaran

### 1. Bahan Habis Pakai (Maksimum 60%)

Item-item dalam kategori bahan habis pakai mencakup seluruh kebutuhan teknologi yang diperlukan untuk pengembangan, implementasi, dan operasional sistem selama periode pelaksanaan program. Laravel Cloud Hosting melalui Laravel Forge dipilih karena menyediakan infrastruktur yang sudah teroptimasi untuk deployment aplikasi Laravel dengan konfigurasi server yang aman dan performa yang terjamin. MySQL Server dijalankan secara lokal pada hosting yang sama sehingga tidak memerlukan biaya tambahan untuk database cloud terpisah. Domain .my.id dipilih sebagai alternatif yang lebih ekonomis dibandingkan .id untuk mengakses sistem melalui internet. Integrasi Midtrans diperlukan untuk memfasilitasi pembayaran QRIS. Supabase Storage digunakan untuk penyimpanan gambar produk secara cloud dengan free tier yang memadai. Figma diperlukan untuk desain antarmuka pengguna yang profesional. Laravel Herd Pro digunakan sebagai lingkungan pengembangan lokal yang terintegrasi untuk mempercepat proses development dan testing sistem.

### 2. Sewa dan Jasa (Maksimum 15%)

Kategori sewa dan jasa mencakup biaya kreatif untuk pembuatan materi promosi dan pelatihan. Canva Pro dan CapCut Pro digunakan untuk membuat konten media sosial yang menarik dan informatif. Jasa cetak modul pelatihan diperlukan untuk memberikan panduan tertulis kepada mitra dalam mengoperasikan sistem.

### 3. Transportasi Lokal (Maksimum 30%)

Biaya transportasi dialokasikan untuk perjalanan tim melaksanakan survei awal, koordinasi pengembangan sistem, serta sosialisasi dan demontrasi kepada mitra. Perhitungan dilakukan berdasarkan jarak lokasi mitra dengan kampus dan jumlah anggota tim yang berangkat.

### 4. Lain-Lain (Maksimum 15%)

Item-item lain mencakup biaya pendaftaran hak cipta untuk melindungi kekayaan intelektual produk, biaya iklan berbayar untuk memperluas jangkauan promosi program, dan cetak banner untuk kegiatan sosialisasi langsung.

---

_Dokumen ini disusun berdasarkan kondisi actual project Laravel POS yang dikembangkan dengan teknologi terkini sesuai dengan package versions yang tertera pada composer.json dan package.json._
