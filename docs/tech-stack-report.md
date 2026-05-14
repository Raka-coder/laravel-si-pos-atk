# Pembahasan Tech Stack Sistem POS

Dokumen ini menjelaskan rincian teknologi (tech stack) yang digunakan dalam pengembangan sistem Point of Sales (POS). Pemilihan teknologi didasarkan pada kebutuhan akan performa, keamanan, dan efisiensi pengembangan.

## 1. Daftar Teknologi (Tech Stack)

Berikut adalah ringkasan teknologi yang digunakan dalam proyek ini:

| Komponen               | Teknologi         | Versi   | Deskripsi                                                                           |
| :--------------------- | :---------------- | :------ | :---------------------------------------------------------------------------------- |
| **Bahasa Pemrograman** | PHP               | 8.4     | Bahasa sisi server utama dengan fitur modern.                                       |
| **Framework Backend**  | Laravel           | 13.2.0  | Framework PHP modern dengan ekosistem yang matang.                                  |
| **Framework Frontend** | React             | 19.2.4  | Library JavaScript untuk membangun antarmuka pengguna yang reaktif.                 |
| **Bridge / Glue Code** | Inertia.js        | 3.0.1   | Menghubungkan Laravel dan React tanpa memerlukan API REST tradisional.              |
| **Styling**            | Tailwind CSS      | 4.2.2   | Framework CSS utility-first untuk desain UI yang cepat dan konsisten.               |
| **Database**           | MySQL             | -       | Basis data relasional untuk penyimpanan data transaksi dan produk.                  |
| **Autentikasi**        | Laravel Fortify   | 1.36.2  | Backend autentikasi yang aman dan modular.                                          |
| **Routing**            | Laravel Wayfinder | 0.1.15  | Memungkinkan routing Laravel yang aman secara tipe data (type-safe) di sisi client. |
| **Testing**            | PHPUnit           | 12.5.15 | Framework pengujian unit dan fitur untuk menjamin kualitas kode.                    |
| **Development Tool**   | Laravel Sail      | 1.55.0  | Lingkungan pengembangan berbasis Docker.                                            |
| **MCP Server**         | Laravel Boost     | 2.4.1   | MCP server dengan tool khusus untuk development Laravel.                            |
| **Log Viewer**         | Laravel Pail      | 1.2.6   | Interface log viewer berbasis TUI.                                                  |
| **Model Context**      | Laravel MCP       | 0.6.4   | Integrasi AI/agent dengan Laravel.                                                  |

## 2. Pembahasan Tech Stack

### 2.1 Backend: Laravel 13 & PHP 8.4

Penggunaan PHP 8.4 memberikan keunggulan dalam hal performa dan fitur bahasa terbaru seperti _property promotion_ dan _readonly classes_. Laravel 13 dipilih sebagai pondasi utama karena menyediakan berbagai fitur bawaan yang mempercepat pengembangan sistem POS, seperti ORM (Eloquent), sistem migrasi database, dan keamanan yang terintegrasi.

### 2.2 Frontend: React 19 & Inertia.js v3

Sistem ini menggunakan pendekatan modern dalam membangun aplikasi satu halaman (Single Page Application). Dengan **Inertia.js v3**, kita dapat membangun aplikasi yang terasa seperti SPA di sisi client menggunakan **React 19**, namun tetap menjaga alur kerja pengembangan seperti aplikasi Laravel monolitik klasik (server-side routing dan controllers). Ini menghilangkan kebutuhan akan pembangunan API RESTful atau GraphQL yang kompleks di tahap awal.

### 2.3 Desain & Styling: Tailwind CSS v4

**Tailwind CSS v4** digunakan untuk mempercepat proses pembuatan antarmuka (UI). Dengan pendekatan _utility-first_, desain aplikasi menjadi lebih fleksibel, konsisten, dan memiliki performa tinggi karena CSS yang dihasilkan sangat optimal. Versi 4 membawa peningkatan performa build yang signifikan dan integrasi yang lebih baik dengan engine CSS modern.

### 2.4 Keamanan & Autentikasi: Laravel Fortify

Untuk menangani aspek keamanan seperti login, registrasi, dan manajemen password, proyek ini menggunakan **Laravel Fortify**. Fortify bertindak sebagai backend autentikasi yang _headless_, membiarkan pengembang mengontrol penuh desain UI di sisi React sambil tetap menggunakan logika autentikasi Laravel yang sudah teruji keamanannya.

### 2.5 Produktivitas: Laravel Wayfinder & Sail

**Laravel Wayfinder** digunakan untuk meningkatkan pengalaman pengembang (Developer Experience) dengan menyediakan fungsi routing yang _type-safe_ pada sisi frontend React, meminimalkan kesalahan penulisan URL. Sementara itu, **Laravel Sail** memastikan seluruh pengembang bekerja dalam lingkungan (environment) yang identik menggunakan Docker, sehingga menghindari masalah "it works on my machine".

### 2.6 Ekosistem Pendukung: Laravel Boost, Pail & MCP

Tiga package tambahan melengkapi ekosistem pengembangan:

- **Laravel Boost (v2.4.1)**: MCP server yang menyediakan tools khusus untuk berinteraksi dengan database, log, dan URL generation. Memudahkan pengembangan dengan query langsung dan debugging yang lebih efisien.
- **Laravel Pail (v1.2.6)**: Log viewer berbasis terminal (TUI) untuk memantau aplikasi secara real-time.
- **Laravel MCP (v0.6.4)**: Memungkinkan integrasi dengan AI/agent untuk otomatisasi pengembangan berbasis model bahasa.

### 2.7 Standarisasi Kode: Pint, ESLint & Prettier

Untuk menjaga kualitas kode selama implementasi, sistem menggunakan beberapa alat otomatisasi:

- **Laravel Pint (1.29.0)**: Memastikan standarisasi gaya penulisan kode PHP (PSR-12/Laravel style).
- **PHPUnit (12.5.15)**: Digunakan untuk menguji alur logika kritis seperti perhitungan total belanja dan manajemen stok produk.
- **ESLint (9.39.4)**: Linter untuk JavaScript/React.
- **Prettier (3.8.1)**: Code formatter untuk JavaScript/React.
