# BAB 2 - ANALISIS KEBUTUHAN SISTEM

## 2.1 Kebutuhan Fungsional

Sistem Point of Sale (POS) ATK-SYNC dirancang untuk memenuhi berbagai kebutuhan operasional toko alat tulis dan perlengkapan kantor. Berdasarkan analisis terhadap kode sumber yang telah dikembangkan, sistem ini menyediakan sejumlah fungsionalitas utama yang dapat dikelompokkan ke dalam beberapa modul bisnis utama.

### 2.1.1 Manajemen Autentikasi dan Otorisasi

Sistem menyediakan mekanisme autentikasi yang komprehensif menggunakan Laravel Fortify. Pengguna dapat melakukan registrasi akun baru, login menggunakan kombinasi email dan kata sandi, serta melakukan reset kata sandi melalui tautan yang dikirimkan ke email. Untuk meningkatkan keamanan, sistem mendukung autentikasi dua faktor (2FA/TOTP) yang menghasilkan kode QR untuk dipindai menggunakan aplikasi autentikator, beserta kode pemulihan cadangan yang dapat digunakan apabila perangkat utama tidak tersedia.

Pengendalian akses berbasis peran (Role-Based Access Control) diimplementasikan menggunakan paket Spatie Laravel Permission. Sistem mendefinisikan dua peran utama yaitu pemilik toko (owner) yang memiliki akses penuh ke seluruh fitur, dan kasir (cashier) yang dibatasi hanya pada transaksi POS dan penampilan laporan. Terdapat 28 izin granular yang mengatur akses ke setiap modul sistem, mulai dari pengelolaan pengguna, produk, kategori, satuan, transaksi, pengeluaran, hingga laporan bisnis.

Pengguna yang dinonaktifkan akan diblokir secara otomatis pada tingkat autentikasi, sehingga tidak dapat mengakses sistem meskipun memiliki kredensial yang valid. Mekanisme throttling diterapkan untuk mencegah serangan brute force, dengan pembatasan 5 percobaan login per menit berdasarkan kombinasi email dan alamat IP.

### 2.1.2 Manajemen Pengguna

Fitur manajemen pengguna tersedia secara eksklusif untuk peran pemilik toko. Fungsionalitas ini mencakup operasi CRUD (Create, Read, Update, Delete) lengkap untuk pengelolaan akun pengguna dalam sistem. Setiap pengguna memiliki atribut nama, alamat email, dan kata sandi yang terenkripsi menggunakan bcrypt dengan 12 putaran hashing.

Pemilik toko dapat membuat akun pengguna baru beserta penugasan peran (owner atau cashier) pada saat pembuatan. Pembaruan data pengguna mencakup perubahan nama, email, dan peran. Sistem juga menyediakan fungsi pengaturan status aktif atau nonaktif pada setiap akun pengguna, serta kemampuan untuk mereset kata sandi pengguna atas nama mereka.

Untuk mencegah penyalahgunaan, sistem melindungi pengguna dari penghapusan atau penonaktifan akun mereka sendiri. Seluruh aktivitas pengelolaan pengguna dicatat dalam log aktivitas yang mencakup operasi pembuatan, pembaruan, penghapusan, dan perubahan status akun.

### 2.1.3 Manajemen Katalog Produk

Sistem menyediakan modul lengkap untuk pengelolaan katalog produk toko ATK. Setiap produk memiliki kode produk yang dihasilkan secara otomatis dengan format "PRD" diikuti enam digit angka berurutan (misalnya PRD000001), serta dukungan untuk kode batang (barcode) yang memungkinkan pemindaian produk menggunakan scanner barcode pada titik penjualan.

Atribut produk mencakup nama produk, kode produk, barcode, harga beli, harga jual, jumlah stok, batas minimum stok, gambar produk, status aktif atau nonaktif, serta relasi ke kategori dan satuan produk. Sistem menghasilkan kode produk secara thread-safe menggunakan mekanisme penguncian basis data (DB::lockForUpdate()) untuk mencegah kondisi balapan (race condition) saat pembuatan kode secara bersamaan.

Pengelolaan kategori produk dilakukan melalui operasi CRUD sederhana yang hanya memerlukan nama kategori. Demikian pula dengan satuan produk yang mendukung nama satuan dan singkatan (misalnya "pcs", "pack", "kg", "lusin"). Kedua entitas ini berfungsi sebagai klasifikasi dan standarisasi data produk dalam sistem.

Unggahan gambar produk divalidasi secara ketat dengan batas ukuran maksimum 2 megabita, dukungan format JPG, JPEG, PNG, GIF, dan WEBP, serta batas dimensi maksimum 1920x1920 piksel. Gambar yang diunggah dioptimasi secara otomatis menjadi format WebP dengan resolusi 800x800 piksel dan kualitas 80 persen, serta dibuatkan versi thumbnail berukuran 200x200 piksel dengan kualitas 75 persen. Optimasi ini mengurangi ukuran gambar rata-rata hingga 93 persen dari sekitar 2,5 megabita menjadi kira-kira 180 kilobita.

### 2.1.4 Antarmuka Point of Sale (POS)

Antarmuka POS merupakan fitur inti sistem yang diakses melalui rute "/pos". Halaman ini menampilkan seluruh produk yang aktif dalam tampilan grid lengkap dengan gambar thumbnail, label kategori, dan satuan produk. State keranjang belanja dikelola secara klien menggunakan Zustand, sebuah pustaka manajemen state React yang ringan dan efisien.

Sistem mendukung pemindaian barcode untuk pencarian produk secara cepat, yang sangat berguna dalam lingkungan ritel dengan volume transaksi tinggi. Kalkulasi perhitungan dilakukan secara otomatis meliputi subtotal, jumlah diskon, pajak dengan tarif yang dapat dikonfigurasi (standar 11 persen PPN), total pembayaran, dan jumlah kembalian.

Metode pembayaran yang tersedia terdiri dari pembayaran tunai (cash) dan pembayaran digital melalui QRIS atau payment gateway Midtrans. Pada pembayaran tunai, stok produk berkurang secara langsung dan transaksi segera selesai. Sedangkan pada pembayaran QRIS/Midtrans, status transaksi awalnya tertunda (pending) dengan token Snap yang dihasilkan dalam waktu 30 menit, dan pengurangan stok baru dilakukan setelah konfirmasi pembayaran diterima melalui webhook atau pengalihan (redirect).

Setelah transaksi selesai, sistem menghasilkan bukti pembayaran (receipt) dalam format PDF menggunakan DomPDF. Ukuran kertas yang didukung adalah 58 milimeter dan 80 milimeter untuk printer termal, dengan catatan kaki (footer) yang dapat disesuaikan melalui pengaturan toko.

### 2.1.5 Manajemen Transaksi

Seluruh transaksi penjualan dicatat dalam sistem dengan nomor kwitansi yang dihasilkan secara otomatis menggunakan format "TRX-YYYYMMDD-XXXX" dengan penomoran yang direset setiap hari. Setiap transaksi mencatat nomor kwitansi, subtotal, jumlah diskon, jumlah pajak, total harga, metode pembayaran, status pembayaran, referensi pembayaran, jumlah uang yang diterima, jumlah kembalian, catatan, tanggal transaksi, dan identitas kasir.

Item transaksi (transaction_items) menyimpan informasi detail setiap baris produk yang dijual, mencakup nama produk, harga beli snapshot, harga jual, jumlah, diskon per item, dan subtotal. Penggunaan snapshot harga beli pada saat transaksi memungkinkan perhitungan laba kotor yang akurat secara historis tanpa terpengaruh oleh perubahan harga beli di masa depan.

Sistem menyediakan fitur pencarian transaksi berdasarkan nomor kwitansi atau nama kasir, serta penyaringan berdasarkan metode pembayaran. Transaksi yang telah dibuat dapat diedit ulang dengan mekanisme yang memulihkan stok lama dan mengurangi stok baru, disertai pencatatan alasan pengeditan dalam audit trail pergerakan stok. Tampilan bukti pembayaran ulang juga tersedia untuk mencetak kembali receipt dari transaksi yang telah selesai.

### 2.1.6 Manajemen Inventori dan Pergerakan Stok

Sistem mengelola pergerakan stok secara komprehensif dengan mencatat seluruh pergerakan masuk, keluar, penyesuaian, penjualan, dan pengembalian produk. Setiap catatan pergerakan stok merekam kondisi stok sebelum dan sesudah perubahan, jumlah perubahan, alasan, identitas pengguna yang melakukan, serta referensi ke transaksi terkait apabila perubahan dipicu oleh transaksi penjualan.

Pengurangan stok otomatis terjadi pada transaksi tunai yang berhasil diselesaikan. Untuk pembayaran melalui Midtrans/QRIS, pengurangan stok dilakukan secara tertunda hanya setelah konfirmasi pembayaran diterima, baik melalui webhook callback maupun pengalihan kembali dari payment gateway. Mekanisme ini memastikan integritas data stok dengan hanya mengurangi persediaan untuk pembayaran yang benar-benar terverifikasi.

Fitur pergerakan stok manual memungkinkan pengguna dengan peran pemilik untuk mencatat stok masuk, stok keluar, dan penyesuaian stok secara manual dengan menyertakan alasan yang mendokumentasikan penyebab perubahan. Audit trail pergerakan stok yang lengkap memberikan kemampuan pelacakan historis yang berguna untuk investigasi selisih stok dan analisis pola pergerakan inventori.

Sistem juga menyediakan peringatan stok rendah (low stock alert) yang menampilkan produk-produk dengan jumlah stok di bawah batas minimum yang telah ditetapkan. Peringatan ini ditampilkan pada dasbor untuk memudahkan pemilik toko dalam mengidentifikasi produk yang perlu segera diisi ulang.

### 2.1.7 Manajemen Pengeluaran Bisnis

Modul pengeluaran bisnis dirancang untuk mencatat dan mengkategorikan seluruh pengeluaran operasional toko. Setiap pengeluaran dikaitkan dengan kategori pengeluaran yang telah didefinisikan sebelumnya, memungkinkan pengelompokan dan analisis biaya berdasarkan jenis pengeluaran.

Atribut pengeluaran mencakup pengguna yang mencatat, kategori pengeluaran, nama atau deskripsi pengeluaran, jumlah nominal, tanggal terjadinya, dan catatan tambahan. Sistem menyediakan operasi CRUD lengkap untuk pengelolaan pengeluaran beserta kategorinya.

Fitur penyaringan pengeluaran berdasarkan rentang tanggal dan kategori tersedia untuk memudahkan analisis pengeluaran dalam periode tertentu. Dasbor sistem menampilkan ringkasan pengeluaran hari ini dan pengeluaran bulanan sebagai indikator cepat kondisi keuangan toko.

### 2.1.8 Pelaporan dan Analisis Bisnis

Sistem menyediakan tiga jenis laporan utama yang mendukung pengambilan keputusan bisnis berdasarkan data yang terkumpul. Laporan penjualan memungkinkan penyaringan berdasarkan rentang tanggal dan menampilkan daftar transaksi yang terpaginasi beserta ringkasan total pendapatan, jumlah transaksi, dan laba kotor. Data penjualan dapat diekspor ke format Excel menggunakan paket Maatwebsite Laravel Excel untuk analisis lebih lanjut di luar sistem.

Laporan pengeluaran menyajikan daftar pengeluaran terpaginasi dengan penyaringan tanggal, ringkasan total pengeluaran, dan rincian pengeluaran berdasarkan kategori. Ekspor ke format Excel juga tersedia untuk laporan pengeluaran guna mendukung pelaporan keuangan yang lebih komprehensif.

Laporan laba rugi menggabungkan data dari transaksi penjualan dan pengeluaran bisnis untuk menghasilkan analisis keuntungan harian bersih. Perhitungan laba kotor didasarkan pada snapshot harga beli dan harga jual pada setiap item transaksi, sehingga mencerminkan margin keuntungan yang akurat tanpa distorsi dari perubahan harga di kemudian hari. Total pengeluaran dikurangkan dari laba kotor untuk menghasilkan laba bersih yang ditampilkan bersama dengan grafik harian penjualan dan pengeluaran menggunakan pustaka Recharts.

Dasbor sistem menampilkan statistik kunci meliputi jumlah penjualan hari ini, total pendapatan hari ini, jumlah total produk, jumlah produk dengan stok rendah, jumlah produk aktif, serta total pengeluaran hari ini dan bulan berjalan. Visualisasi grafik menggunakan Recharts menyajikan tren penjualan dan pengeluaran untuk memudahkan identifikasi pola bisnis dari waktu ke waktu.

### 2.1.9 Pengaturan Toko

Pengaturan toko mengadopsi pola singleton dengan satu baris konfigurasi yang menyimpan seluruh informasi dan preferensi toko. Data toko mencakup nama toko, alamat, email, nomor telepon, dan NPWP (Nomor Pokok Wajib Pajak) untuk keperluan perpajakan di Indonesia.

Konfigurasi payment gateway Midtrans mencakup Merchant ID, Client Key, Server Key, dan flag lingkungan produksi atau sandbox. Pengaturan ini dapat dikonfigurasi melalui antarmuka pengaturan toko atau melalui variabel lingkungan (.env), dengan prioritas pada pengaturan toko apabila keduanya tersedia.

Tarif pajak bawaan ditetapkan sebesar 11 persen yang mencermatkan tarif PPN (Pajak Pertambahan Nilai) di Indonesia. Catatan kaki pada bukti pembayaran dapat disesuaikan dengan teks terima kasih atau informasi tambahan yang diinginkan pemilik toko. Ukuran kertas bukti pembayaran dapat dipilih antara 58 milimeter dan 80 milimeter sesuai dengan printer termal yang digunakan.

Logo toko dan gambar QRIS dapat diunggah melalui antarmuka pengaturan dan ditampilkan pada bukti pembayaran serta antarmuka POS untuk memudahkan identifikasi merek dan dukungan pembayaran digital.

### 2.1.10 Manajemen Profil dan Keamanan Pengguna

Setiap pengguna dapat mengelola profil pribadinya meliputi pembaruan nama dan alamat email, perubahan kata sandi, serta pengelolaan autentikasi dua faktor. Modul keamanan menyediakan antarmuka untuk mengaktifkan atau menonaktifkan 2FA, menampilkan kode QR untuk pemindaian menggunakan aplikasi autentikator, menampilkan kunci rahasia manual, serta menghasilkan ulang kode pemulihan cadangan.

Pembaruan kata sandi memerlukan konfirmasi kata sandi lama dan memenuhi kebijakan kompleksitas kata sandi yang berlaku. Pada lingkungan produksi, kata sandi harus memiliki panjang minimum 12 karakter, mengandung huruf besar dan kecil, angka, serta simbol, dan tidak ditemukan dalam basis data kebocoran kata sandi menggunakan pemeriksaan Have I Been Pwned.

Pengaturan penampilan (appearance) memungkinkan pengguna untuk memilih tema tampilan antarmuka yang disimpan dalam cookie peramban, memberikan pengalaman personal tanpa mempengaruhi preferensi pengguna lain dalam sistem.

## 2.2 Kebutuhan Non-Fungsional

### 2.2.1 Kebutuhan Perangkat Lunak

Sistem ATK-SYNC dibangun menggunakan teknologi web modern yang memastikan kinerja, keamanan, dan kemudahan pemeliharaan. Sisi peladen (backend) mengandalkan bahasa pemrograman PHP versi terbaru dengan kerangka kerja Laravel yang menyediakan struktur pengembangan yang terorganisir dan aman.

Basis data yang digunakan adalah MariaDB, sebuah sistem manajemen basis data relasional yang handal dan kompatibel penuh dengan MySQL. Untuk lingkungan pengembangan, sistem juga mendukung SQLite sebagai basis data ringan. Pengelolaan basis data dilakukan melalui antarmuka baris perintah (CLI) yang memberikan kendali penuh kepada administrator.

Antarmuka pengguna (frontend) dibangun sebagai aplikasi halaman tunggal (Single Page Application) menggunakan React dengan TypeScript, yang memberikan pengalaman pengguna yang responsif dan lancar tanpa perlu memuat ulang halaman secara penuh. Kerangka kerja Inertia.js berfungsi sebagai penghubung antara peladen dan antarmuka klien, memungkinkan tampilan yang cepat dan interaktif seperti aplikasi desktop.

Tampilan antarmuka dirancang menggunakan Tailwind CSS yang memberikan fleksibilitas tinggi dalam penataan gaya, dilengkapi dengan komponen siap pakai dari shadcn/ui dan Radix UI yang memastikan elemen antarmuka terlihat konsisten dan mudah diakses. Perpustakaan ikon dan notifikasi toast melengkapi pengalaman visual yang informatif bagi pengguna.

Untuk pembayaran digital, sistem terintegrasi dengan Midtrans sebagai payment gateway yang mendukung QRIS dan berbagai metode pembayaran elektronik lainnya. Fitur ekspor laporan ke format Excel dan CSV didukung oleh pustaka khusus yang menghasilkan berkas siap pakai untuk analisis lebih lanjut. Bukti pembayaran dicetak dalam format PDF yang disesuaikan dengan ukuran kertas printer termal.

Pengembangan sistem menggunakan perkakas bantu seperti Composer untuk pengelolaan pustaka PHP, Node.js dan npm untuk pengelolaan paket JavaScript, serta Git untuk sistem kontrol versi. Pengujian otomatis menggunakan PHPUnit memastikan seluruh fitur berfungsi sebagaimana mestinya, sementara pemformat kode otomatis menjaga konsistensi gaya penulisan di seluruh basis kode.

### 2.2.2 Arsitektur dan Desain Sistem

Sistem dirancang dengan pemisahan tanggung jawab yang jelas antara komponen yang menangani permintaan pengguna, logika bisnis, dan pengelolaan data. Pendekatan ini memudahkan pengembangan, pengujian, dan pemeliharaan sistem karena setiap bagian memiliki peran yang terdefinisi dengan baik.

Logika bisnis yang kompleks dipisahkan ke dalam modul-modul khusus yang menangani tugas-tugas spesifik seperti pengelolaan transaksi, integrasi pembayaran, optimasi gambar, dan pembuatan kode produk. Pemisahan ini memudahkan pengembang untuk memahami dan memodifikasi sistem tanpa mengganggu komponen lain yang tidak terkait.

Validasi data masukan dilakukan sebelum data diproses lebih lanjut, memastikan bahwa hanya data yang lengkap dan benar yang masuk ke dalam sistem. Pendekatan ini menjaga integritas data dan mencegah kesalahan yang mungkin terjadi akibat masukan yang tidak valid.

Sistem menerapkan pola pencatatan riwayat harga pada setiap transaksi penjualan. Harga beli produk direkam pada saat transaksi terjadi, sehingga perhitungan laba tetap akurat meskipun harga beli berubah di masa depan. Hal ini memberikan gambaran keuntungan yang benar dan dapat diandalkan untuk pengambilan keputusan bisnis.

Pengaturan toko menggunakan pendekatan konfigurasi terpusat di mana seluruh informasi dan preferensi toko disimpan dalam satu tempat yang mudah diakses dan diperbarui oleh pemilik toko. Perubahan pengaturan langsung berlaku tanpa memerlukan konfigurasi teknis yang rumit.

Pencatatan riwayat aktivitas diterapkan secara konsisten, terutama pada pergerakan stok barang dan pengelolaan akun pengguna. Setiap perubahan dicatat lengkap dengan informasi siapa yang melakukan, kapan dilakukan, apa yang berubah, dan alasan di balik perubahan tersebut. Jejak audit ini sangat berguna untuk investigasi apabila terjadi selisih stok atau masalah lainnya.

### 2.2.3 Kebutuhan Keamanan

Keamanan sistem diimplementasikan secara berlapis untuk melindungi data dan transaksi dari ancaman yang berpotensi merugikan. Perlindungan terhadap pemalsuan permintaan (CSRF) diterapkan pada seluruh formulir dan aksi dalam sistem, memastikan bahwa setiap permintaan berasal dari pengguna yang sah.

Kata sandi pengguna diamankan menggunakan algoritma enkripsi satu arah yang kuat, sehingga meskipun data basis data berhasil diakses oleh pihak yang tidak berwenang, kata sandi tetap tidak dapat dibaca secara langsung. Sistem juga menerapkan batas percobaan login untuk mencegah serangan yang mencoba menebak kata sandi secara berulang-ulang.

Autentikasi dua faktor menambahkan lapisan keamanan tambahan dengan memerlukan kode verifikasi yang dihasilkan oleh aplikasi autentikator di perangkat pengguna. Kode ini berubah secara berkala dan hanya diketahui oleh pemilik perangkat, sehingga meskipun kata sandi diketahui pihak lain, akses tetap terlindungi.

Pemberitahuan pembayaran dari payment gateway diverifikasi menggunakan tanda tangan digital yang memastikan keaslian pesan dan mencegah manipulasi data transaksi. Verifikasi ini dilakukan dengan metode yang aman terhadap upaya pengecohkan waktu respons.

Pencegahan terhadap serangan penyisipan kode berbahaya (injeksi) diterapkan secara otomatis oleh kerangka kerja yang digunakan, baik untuk kueri basis data maupun tampilan halaman. Keluaran data dari pengguna selalu disaring sebelum ditampilkan, mencegah eksekusi kode yang tidak diinginkan di peramban pengguna lain.

Data sesi dan preferensi pengguna yang disimpan dalam cookie peramban dienkripsi untuk mencegah pembacaan atau modifikasi oleh pihak yang tidak berwenang. Hanya cookie yang menyimpan informasi non-sensitif seperti preferensi tampilan yang tidak dienkripsi.

Pada lingkungan produksi, kebijakan kata sandi yang ketat diterapkan dengan persyaratan panjang minimum, kombinasi jenis karakter, dan pemeriksaan terhadap basis data kebocoran kredensial yang dikenal secara publik. Hal ini memastikan pengguna memilih kata sandi yang kuat dan tidak mudah ditebak.

### 2.2.4 Kebutuhan Kinerja dan Skalabilitas

Kinerja sistem dioptimalkan melalui strategi pengindeksan pada kolom-kolom basis data yang sering digunakan untuk pencarian dan penyaringan. Indeks ini mempercepat proses pengambilan data secara signifikan, terutama ketika volume data telah bertambah besar seiring berjalannya waktu.

Pemuatan data yang saling terkait dilakukan secara efisien dengan mengambil seluruh data yang diperlukan dalam satu permintaan, daripada melakukan permintaan berulang yang dapat memperlambat respons sistem. Pendekatan ini menjaga kecepatan tampilan halaman meskipun data yang ditampilkan cukup kompleks.

Pembagian data ke dalam halaman-halaman (paginasi) diterapkan pada seluruh modul yang menampilkan daftar data. Jumlah data per halaman disesuaikan dengan kompleksitas informasi, sehingga halaman tetap ringan dan responsif. Pengguna dapat berpindah antar halaman dengan mudah untuk menelusuri data yang lebih banyak.

Optimasi gambar yang diunggah pengguna menghasilkan pengurangan ukuran berkas yang signifikan, yang mempercepat waktu pemuatan halaman dan menghemat penggunaan bandwidth. Antrean pekerjaan latar belakang memungkinkan tugas-tugas yang tidak perlu segera diselesaikan, seperti pengiriman email, diproses tanpa menghalangi respons kepada pengguna.

Pengemasan aset untuk lingkungan produksi menghasilkan berkas yang telah diminifikasi dan dioptimasi, mengurangi ukuran total yang perlu diunduh oleh peramban pengguna. Pengoptimalan ini berkontribusi pada pengalaman pengguna yang lebih cepat dan responsif.

### 2.2.5 Kebutuhan Lokalisasi dan Bahasa

Sistem dirancang khusus untuk pengguna di Indonesia dengan penyesuaian bahasa dan format yang sesuai dengan kebiasaan lokal. Seluruh teks antarmuka, termasuk label formulir, pesan kesalahan, dan notifikasi, ditulis dalam Bahasa Indonesia untuk memudahkan pemahaman pengguna.

Mata uang yang digunakan adalah Rupiah Indonesia (IDR) yang ditampilkan dalam format yang familiar bagi pengguna lokal. Sistem tidak mendukung pergantian mata uang karena dirancang untuk operasional satu toko di Indonesia.

Format tanggal mengikuti konvensi yang umum digunakan di Indonesia, sehingga mudah dibaca dan dipahami oleh pengguna. Perpustakaan penanganan tanggal memastikan konsistensi format di seluruh bagian sistem.

Dukungan perpajakan Indonesia diwakili oleh kolom Nomor Pokok Wajib Pajak (NPWP) pada pengaturan toko dan tarif pajak bawaan yang mencerminkan tarif Pajak Pertambahan Nilai (PPN) yang berlaku. Struk pembayaran dapat disesuaikan dengan catatan kaki yang sesuai dengan praktik bisnis ritel di Indonesia.

Standar pembayaran QR yang diintegrasikan ke dalam sistem mengikuti standar QRIS (Quick Response Code Indonesian Standard) yang dikelola oleh Bank Indonesia, memungkinkan pelanggan untuk membayar menggunakan berbagai aplikasi dompet digital dan perbankan yang mendukung standar tersebut.

### 2.2.6 Kebutuhan Pemeliharaan dan Kualitas Kode

Kualitas kode sumber dijaga melalui penggunaan perkakas otomatis yang memastikan konsistensi gaya penulisan di seluruh basis kode. Pemformat kode otomatis diterapkan baik untuk kode peladen maupun kode antarmuka, sehingga tidak terjadi perbedaan gaya antar pengembang yang bekerja pada proyek ini.

Pemeriksaan kualitas kode dijalankan secara otomatis sebelum setiap penyimpanan perubahan ke dalam repositori, mencegah masuknya kode yang tidak sesuai dengan standar yang telah ditetapkan. Pendekatan ini memastikan bahwa kualitas kode tetap terjaga sepanjang waktu tanpa memerlukan tinjauan manual yang intensif.

Pengujian fitur secara otomatis mencakup berbagai skenario penggunaan utama, termasuk proses masuk dan keluar sistem, fungsi dasbor, pengelolaan profil, mekanisme keamanan, dan integrasi dengan payment gateway. Pengujian ini berfungsi sebagai jaring pengaman yang mendeteksi apabila ada fitur yang terganggu akibat perubahan kode.

Dokumentasi pengembangan tersimpan secara terstruktur dan mencakup catatan untuk setiap fase pengembangan yang telah dilalui. Dokumentasi ini menyediakan referensi teknis dan konteks historis yang bermanfaat bagi pengembang yang bergabung dengan proyek di kemudian hari atau perlu memahami alasan di balik keputusan teknis yang telah diambil.

## 2.3 Spesifikasi Perangkat Keras dan Perangkat Lunak

### 2.3.1 Spesifikasi Perangkat Lunak

Pengembangan sistem ATK-SYNC menggunakan perangkat lunak yang dirancang untuk lingkungan pengembangan modern berbasis Linux. Sistem operasi yang digunakan adalah Linux Ubuntu berbasis KDE Neon, sebuah distribusi Linux yang menyediakan lingkungan desktop KDE Plasma dengan fondasi Ubuntu yang stabil. Lingkungan ini menyediakan perkakas pengembangan native dan kompatibilitas penuh dengan stack LAMP (Linux, Apache/Nginx, MySQL/MariaDB, PHP) yang diperlukan oleh aplikasi Laravel.

Integrated Development Environment (IDE) yang digunakan adalah Zed Editor, sebuah editor kode berkinerja tinggi yang dibangun dengan bahasa Rust. Zed menyediakan fitur penyelesaian kode cerdas, navigasi basis kode, dan integrasi Git yang diperlukan untuk pengembangan efisien. Dukungan native untuk PHP, TypeScript, dan JavaScript dalam Zed memungkinkan pengalaman pengembangan yang lancar tanpa perlu plugin tambahan yang berat.

Sistem manajemen basis data yang digunakan adalah MariaDB dengan antarmuka Command Line Interface (CLI) untuk administrasi dan kueri basis data secara langsung. MariaDB dipilih sebagai server basis data relasional yang kompatibel penuh dengan MySQL, menyediakan engine penyimpanan InnoDB untuk dukungan transaksi dan integritas referensial, serta kinerja yang optimal untuk aplikasi web skala menengah.

Perangkat lunak tambahan yang diperlukan meliputi Composer sebagai manajer dependensi PHP, Node.js dan npm sebagai manajer paket JavaScript, serta Git untuk sistem kontrol versi dan kolaborasi pengembangan. Laravel Sail tersedia sebagai opsi pengembangan berbasis Docker yang menyediakan lingkungan terkontainerisasi untuk konsistensi antar lingkungan pengembangan.

Tabel berikut merangkum spesifikasi perangkat lunak pengembangan secara lengkap.

| No | Perangkat Lunak | Versi | Keterangan |
|----|-----------------|-------|------------|
| 1 | Sistem Operasi | KDE Neon (Ubuntu-based) | Distribusi Linux dengan desktop KDE Plasma |
| 2 | IDE / Editor | Zed Editor | Editor kode berkinerja tinggi berbasis Rust |
| 3 | Bahasa Pemrograman | PHP | Versi 8.4 atau lebih tinggi |
| 4 | Framework Backend | Laravel | Versi 13.0 |
| 5 | Server Basis Data | MariaDB | Versi 10.6 atau lebih tinggi |
| 6 | Manajemen Basis Data | MariaDB CLI | Antarmuka baris perintah untuk administrasi |
| 7 | Runtime JavaScript | Node.js | Versi 20 atau lebih tinggi |
| 8 | Manajer Paket JS | npm | Versi 10 atau lebih tinggi |
| 9 | Manajer Dependensi PHP | Composer | Versi 2.7 atau lebih tinggi |
| 10 | Kontrol Versi | Git | Versi 2.40 atau lebih tinggi |
| 11 | Bundler Aset | Vite | Versi 8.0 |
| 12 | Framework Frontend | React | Versi 19.2 |
| 13 | Library SPA Bridge | Inertia.js | Versi 3.0 |
| 14 | CSS Framework | Tailwind CSS | Versi 4.0 |
| 15 | Payment Gateway SDK | Midtrans PHP | Versi 2.6 |
| 16 | Export Library | Maatwebsite Excel | Versi 3.1 |
| 17 | PDF Library | DomPDF (barryvdh) | Versi 3.1 |
| 18 | Image Processing | Intervention Image | Versi 4.0 |
| 19 | Testing Framework | PHPUnit | Versi 12 |
| 20 | Code Formatter PHP | Laravel Pint | Versi 1.27 |
| 21 | Code Formatter JS | Prettier | Versi 3 |
| 22 | Linter JS | ESLint | Versi 9 |
| 23 | Git Hooks | Husky | Versi 9 |
| 24 | Docker (Opsional) | Laravel Sail | Versi 1.53 |
| 25 | Tunneling | ngrok | Versi terbaru | Pengujian webhook payment gateway (Midtrans) dari lingkungan lokal |

### 2.3.2 Spesifikasi Perangkat Keras

> **Catatan:** Bagian ini disediakan sebagai template untuk diisi berdasarkan kebutuhan dan ketersediaan perangkat keras aktual. Silakan sesuaikan nilai-nilai di bawah ini dengan spesifikasi perangkat keras yang Anda gunakan atau rencanakan.

#### A. Perangkat Keras Pengembangan (Development Machine)

| No | Komponen | Spesifikasi Minimum | Spesifikasi yang Direkomendasikan | Keterangan |
|----|----------|---------------------|------------------------------------|------------|
| 1 | Prosesor (CPU) | ... | ... | ... |
| 2 | Memori (RAM) | ... | ... | ... |
| 3 | Penyimpanan (Storage) | ... | ... | SSD direkomendasikan untuk kinerja I/O basis data |
| 4 | Sistem Operasi | ... | ... | KDE Neon (Ubuntu-based) Linux 64-bit |
| 5 | Koneksi Internet | ... | ... | Diperlukan untuk instalasi dependensi dan payment gateway testing |

#### B. Perangkat Keras Server Produksi (Production Server)

| No | Komponen | Spesifikasi Minimum | Spesifikasi yang Direkomendasikan | Keterangan |
|----|----------|---------------------|------------------------------------|------------|
| 1 | Prosesor (CPU) | ... | ... | ... |
| 2 | Memori (RAM) | ... | ... | ... |
| 3 | Penyimpanan (Storage) | ... | ... | SSD untuk kinerja basis data optimal |
| 4 | Jaringan (Network) | ... | ... | ... |
| 5 | Sistem Operasi | ... | ... | Linux (Ubuntu Server / Debian / CentOS) |

#### C. Perangkat Keras Titik Penjualan (POS Hardware)

| No | Komponen | Spesifikasi Minimum | Spesifikasi yang Direkomendasikan | Keterangan |
|----|----------|---------------------|------------------------------------|------------|
| 1 | Komputer Kasir / Tablet | ... | ... | Perangkat dengan peramban web modern |
| 2 | Scanner Barcode | ... | ... | Scanner USB atau Bluetooth yang mendukung kode batang 1D/2D |
| 3 | Printer Termal | ... | ... | Printer termal 58mm atau 80mm dengan dukungan ESC/POS |
| 4 | Laci Uang (Cash Drawer) | ... | ... | Laci uang yang terhubung ke printer atau komputer kasir |
| 5 | Monitor Layar Sentuh | ... | ... | Opsional, untuk interaksi kasir yang lebih intuitif |
| 6 | Koneksi Internet | ... | ... | Diperlukan untuk sinkronisasi data dan pembayaran QRIS |

#### D. Perangkat Keras Tambahan

| No | Komponen | Spesifikasi Minimum | Spesifikasi yang Direkomendasikan | Keterangan |
|----|----------|---------------------|------------------------------------|------------|
| 1 | Router / Firewall | ... | ... | Untuk keamanan jaringan toko |
| 2 | UPS (Uninterruptible Power Supply) | ... | ... | Cadangan daya untuk mencegah kehilangan data saat pemadaman |
| 3 | Backup Storage | ... | ... | Penyimpanan eksternal atau cloud untuk pencadangan basis data |
| 4 | ... | ... | ... | ... |

---

> **Petunjuk Pengisian Template Hardware:**
> 
> 1. Ganti tanda "..." dengan spesifikasi aktual perangkat keras yang Anda gunakan atau rencanakan
> 2. Untuk pengembangan, disarankan minimal 8 GB RAM dan prosesor multi-core modern (Intel Core i5 generasi ke-10 atau setara)
> 3. Untuk server produksi, sesuaikan dengan jumlah transaksi yang diharapkan (untuk toko kecil-menengah, minimal 4 GB RAM dan 2 CPU core sudah memadai)
> 4. Untuk perangkat POS, pastikan kompatibilitas scanner barcode dan printer termal dengan sistem operasi yang digunakan
> 5. Tambahkan atau hapus baris sesuai kebutuhan spesifik lingkungan Anda
