# Laporan Pengujian Blackbox (Blackbox Testing Report)
## Sistem Informasi Point of Sale (POS) - Example App

---

### 1. Dasar Teori & Metodologi

#### **1.1 Pengertian Blackbox Testing**
*Blackbox Testing* (Pengujian Kotak Hitam) adalah metode pengujian perangkat lunak yang berfokus pada fungsionalitas aplikasi tanpa harus mengetahui struktur kode internal, detail implementasi, atau jalur logika di dalamnya. Pengujian ini sepenuhnya didasarkan pada spesifikasi kebutuhan dan antarmuka pengguna (UI). Penguji hanya memberikan input dan memeriksa apakah output yang dihasilkan sesuai dengan yang diharapkan.

#### **1.2 Alasan Pemilihan Metode**
Metode *Blackbox Testing* dipilih untuk proyek POS ini berdasarkan alasan berikut:
1.  **Berorientasi Pengguna:** Mengingat aplikasi POS memiliki dua peran berbeda (Owner & Kasir), metode ini sangat efektif untuk memastikan alur kerja setiap role berjalan sesuai ekspektasi pengguna di lapangan.
2.  **Validasi Kebutuhan Bisnis:** Memudahkan verifikasi bahwa seluruh fitur yang tercantum dalam spesifikasi (seperti perhitungan transaksi, stok, dan laporan) telah berfungsi dengan benar dari sisi operasional.
3.  **Efisiensi Pengujian Fungsional:** Tidak memerlukan akses ke *source code* bagi tim penguji/QA, sehingga pengujian bisa dilakukan secara objektif berdasarkan tampilan yang akan digunakan oleh klien.
4.  **Keamanan Hak Akses:** Sangat cocok untuk menguji *Role-Based Access Control* (RBAC), memastikan Kasir tidak dapat mengakses fitur sensitif yang hanya boleh diakses oleh Owner.

---

### 2. Tabel Pengujian Fungsional

#### **A. Modul Autentikasi & Manajemen Profil**
| ID | Fitur | Aktor | Skenario Pengujian | Input (Data) | Hasil yang Diharapkan | Status |
|:---|:---|:---:|:---|:---|:---|:---:|
| AUTH-01 | Login | Semua | Login dengan kredensial valid | Email & Password terdaftar | Masuk ke Dashboard sesuai Role | Sukses |
| AUTH-02 | Login Gagal | Semua | Login dengan password salah | Email benar, Password salah | Muncul pesan "Credentials do not match" | Sukses |
| AUTH-03 | Logout | Semua | Keluar dari sistem | Klik tombol Logout | Sesi berakhir, kembali ke halaman login | Sukses |
| AUTH-04 | Update Profil | Semua | Mengubah informasi dasar user | Nama baru, Email baru | Data user di database terupdate | Sukses |
| AUTH-05 | Ubah Password | Semua | Mengganti password akun | Password lama & Password baru | Password terupdate, login berikutnya menggunakan yang baru | Sukses |

#### **B. Modul Master Data (Hanya Owner)**
| ID | Fitur | Aktor | Skenario Pengujian | Input (Data) | Hasil yang Diharapkan | Status |
|:---|:---|:---:|:---|:---|:---|:---:|
| MSTR-01 | Kelola Kategori | Owner | Menambah kategori produk baru | Nama: "Minuman Dingin" | Kategori tersimpan dan muncul di daftar | Sukses |
| MSTR-02 | Edit Kategori | Owner | Mengubah nama kategori | Nama: "Snack Ringan" | Nama kategori terupdate di seluruh produk terkait | Sukses |
| MSTR-03 | Kelola Satuan | Owner | Menambah satuan produk | Nama: "Pcs", "Box", "Rim" | Satuan muncul pada form tambah produk | Sukses |
| MSTR-04 | Tambah Produk | Owner | Menambah produk baru + Gambar | Nama, Kategori, Harga, Stok, File Gambar | Produk tersimpan, gambar teroptimasi di storage | Sukses |
| MSTR-05 | Product Code Generator | Owner | Generate kode unik produk | Klik tombol "Simpan" pada form | SKU/Product code unik terisi otomatis | Sukses |
| MSTR-06 | Update Stok | Owner | Menambah stok secara manual | Jumlah tambahan stok | Stok bertambah, log terekam di Stock Movement | Sukses |

#### **C. Modul Kasir / Point of Sale (POS)**
| ID | Fitur | Aktor | Skenario Pengujian | Input (Data) | Hasil yang Diharapkan | Status |
|:---|:---|:---:|:---|:---|:---|:---:|
| POS-01 | Cari Produk | Semua | Mencari produk berdasarkan nama/SKU | Keyword: "buku" | Daftar produk terfilter sesuai keyword | Sukses |
| POS-02 | Keranjang Belanja | Semua | Menambah beberapa produk ke keranjang | Klik produk berkali-kali | Qty bertambah, subtotal terhitung otomatis | Sukses |
| POS-03 | Edit Item Keranjang | Semua | Mengubah Qty atau menghapus item | Ubah Qty jadi 5, klik Hapus | Total belanja terupdate secara realtime | Sukses |
| POS-04 | Pembayaran Tunai | Semua | Transaksi dengan uang pas/lebih | Nominal bayar >= Total | Transaksi sukses, kembalian dihitung benar | Sukses |
| POS-05 | Pembayaran Midtrans | Semua | Transaksi via QRIS/E-Wallet | Klik Bayar via Midtrans | Muncul Snap Popup Midtrans | Sukses |
| POS-06 | Pengurangan Stok | Semua | Validasi stok setelah transaksi | Selesaikan transaksi | Stok produk berkurang sesuai Qty yang dibeli | Sukses |
| POS-07 | Struk Belanja | Semua | Download bukti transaksi | Klik "Download Struk" | File PDF ter-generate dengan data yang benar | Sukses |

#### **D. Modul Manajemen Pengeluaran (Expense)**
| ID | Fitur | Aktor | Skenario Pengujian | Input (Data) | Hasil yang Diharapkan | Status |
|:---|:---|:---:|:---|:---|:---|:---:|
| EXP-01 | Kategori Biaya | Owner | Tambah kategori pengeluaran | Nama: "Listrik & Operasional" | Kategori tersimpan untuk klasifikasi biaya | Sukses |
| EXP-02 | Catat Pengeluaran | Semua | Mencatat biaya operasional | Nominal, Keterangan, Tgl | Pengeluaran tersimpan, mengurangi profit bersih | Sukses |

#### **E. Modul Laporan & Analitik (Hanya Owner)**
| ID | Fitur | Aktor | Skenario Pengujian | Input (Data) | Hasil yang Diharapkan | Status |
|:---|:---|:---:|:---|:---|:---|:---:|
| RPT-01 | Grafik Penjualan | Owner | Visualisasi data harian | Klik Dashboard | Grafik muncul sesuai tren data asli | Sukses |
| RPT-02 | Export Penjualan | Owner | Export data ke Excel | Filter Tanggal | File .xlsx terunduh berisi detail transaksi | Sukses |
| RPT-03 | Ringkasan Laba Rugi | Owner | Melihat total omzet vs biaya | Klik Laporan Ringkas | Muncul angka Pendapatan, Biaya, dan Profit | Sukses |

#### **F. Modul Chatbot AI & Pengaturan**
| ID | Fitur | Aktor | Skenario Pengujian | Input (Data) | Hasil yang Diharapkan | Status |
|:---|:---|:---:|:---|:---|:---|:---:|
| AI-01 | Konsultasi Data | Owner | Menanyakan data via Chat | "Berapa penghasilan hari/bulan ini?" | AI memberikan analisis data transaksi | Sukses |
| SET-01 | Keputusan Bisnis | Owner | Menanyakan Saran via Chat | "Bagaimana saran penjualan produk saat ini?" | Saran & balasan dijawab oleh chatbot | Sukses |

#### **G. Modul Manajemen User (Hanya Owner)**
| ID | Fitur | Aktor | Skenario Pengujian | Input (Data) | Hasil yang Diharapkan | Status |
|:---|:---|:---:|:---|:---|:---|:---:|
| USR-01 | Tambah User | Owner | Mendaftarkan akun kasir baru | Nama, Email, Role, Password | Akun baru tercipta dan bisa login | Sukses |
| USR-02 | Edit User | Owner | Mengubah informasi akun staff | Nama/Email baru, Role | Data user terupdate di database | Sukses |
| USR-03 | Reset Password | Owner | Mengatur ulang password staff | Password baru | Staff bisa login dengan password baru | Sukses |
| USR-04 | Toggle Aktif/Nonaktif | Owner | Menonaktifkan akses user | Klik Toggle Status | User yang dinonaktifkan tidak bisa login | Sukses |
| USR-05 | Hapus User | Owner | Menghapus akun yang tidak aktif | Klik Hapus | Data user terhapus dari sistem | Sukses |

---

### 3. Analisis Hasil Pengujian

Berdasarkan rangkaian pengujian yang telah dilakukan terhadap seluruh modul aplikasi, didapatkan hasil bahwa sistem Point of Sale (POS) ini telah berfungsi sesuai dengan standar operasional yang diharapkan. Pada modul autentikasi dan **Manajemen User**, sistem keamanan mampu memvalidasi kredensial pengguna dengan tepat serta membagi akses menu berdasarkan peran (RBAC) secara konsisten. Fitur pengelolaan akun staff oleh Owner berjalan dengan baik, memungkinkan kontrol penuh terhadap siapa saja yang memiliki akses ke dalam sistem, termasuk kemampuan untuk menonaktifkan akun secara instan jika diperlukan.

Pada aspek manajemen inventaris, fitur penambahan produk yang dilengkapi dengan optimasi gambar dan *automatic barcode generation* berjalan dengan stabil. Sinkronisasi stok antara modul master data dan modul transaksi (POS) terbukti akurat, di mana setiap transaksi yang berhasil secara otomatis memicu pengurangan stok di database dan mencatat pergerakannya pada *stock movement log*. Hal ini meminimalisir risiko ketidaksinkronan data stok fisik dan digital.

Fitur transaksi (POS) menunjukkan performa yang responsif, baik dalam pencarian produk maupun kalkulasi keranjang belanja secara *real-time*. Integrasi dengan gerbang pembayaran Midtrans juga telah diverifikasi dapat menampilkan *popup payment* dengan benar, memberikan fleksibilitas metode pembayaran bagi pelanggan. Sementara itu, fitur pelaporan memberikan output data yang valid dalam format Excel, yang memudahkan pemilik toko (Owner) dalam melakukan audit keuangan bulanan. Terakhir, kehadiran Chatbot AI memberikan nilai tambah yang signifikan karena mampu mengekstraksi data penjualan menjadi informasi strategis melalui percakapan alami.

---

### 4. Evaluasi Hasil Pengujian

Meskipun secara fungsional sistem telah memenuhi seluruh skenario pengujian, terdapat beberapa poin evaluasi yang dapat dijadikan dasar pengembangan sistem di masa mendatang:

1.  **Poin Kekuatan (Strengths):**
    *   **Integritas Data:** Sistem sangat kuat dalam menjaga relasi data stok, transaksi, dan pengeluaran secara *real-time*.
    *   **User Experience:** Antarmuka yang bersih dan alur transaksi yang intuitif memudahkan adaptasi bagi pengguna baru (kasir).
    *   **Fitur AI:** Integrasi AI memberikan kemampuan analisis yang biasanya tidak ditemukan pada sistem POS konvensional di kelasnya.

2.  **Poin Kelemahan & Peluang Perbaikan (Opportunities):**
    *   **Mekanisme Pencetakan Struk:** Saat ini sistem masih menggunakan metode unduh PDF yang memerlukan beberapa langkah tambahan untuk mencetak. Diperlukan implementasi *Direct Printing* atau *Silent Printing* menggunakan protokol ESC/POS agar lebih efisien di lingkungan kasir yang sibuk.
    *   **Offline Capability:** Aplikasi sepenuhnya bergantung pada koneksi internet. Evaluasi menunjukkan perlunya fitur *Local Storage* atau *PWA* (Progressive Web App) agar transaksi tetap bisa dicatat saat terjadi gangguan jaringan.
    *   **Optimasi Database:** Seiring bertambahnya data transaksi hingga ribuan entri per bulan, diperlukan optimasi pada *query* laporan agar performa grafik dashboard tetap ringan.

---

### 5. Kesimpulan Akhir
Berdasarkan seluruh skenario pengujian yang telah dilaksanakan, sistem informasi POS ini telah dinyatakan **Lulus Uji** secara fungsional. Seluruh fitur utama mulai dari operasional kasir hingga pelaporan manajerial oleh owner telah berjalan sinkron dengan basis data dan aturan bisnis yang ditetapkan.
