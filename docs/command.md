Saya sudah berhasil membuat fitur chatbot dasar bernama "POS Agent" menggunakan LarAgent dengan model Gemini. Sekarang saya ingin meng-upgrade kemampuan chatbot ini agar bisa membantu proses bisnis dan pengambilan keputusan.

TUJUAN:
AI Agent harus bisa menjawab pertanyaan terkait DATA BISNIS yang ada di project, seperti:
- "Berapa total penjualan hari ini?"
- "Produk apa yang paling laris minggu ini?"
- "Stok barang apa yang sudah menipis?"
- "Berapa rata-rata transaksi per hari?"
- "Kategori produk apa yang paling sedikit terjual?"
- "Produk apa yang dijual dan tersedia & laris hari, minggu, bulan"

KETENTUAN:
1. JANGAN akses data users (tabel users)
2. JANGAN akses data settings (tabel settings/pengaturan toko)
3. Fokus hanya pada data bisnis: produk, transaksi, penjualan, stok, kategori, pengeluaran (expenses)

YANG PERLU DIBUAT/DITAMBAHKAN:

1. TOOLS / FUNCTIONS untuk mengambil data dari database:
   - getTodaySales() → total penjualan hari ini
   - getTopProducts(limit = 5) → produk terlaris
   - getLowStockProducts() → daftar produk dengan stok menipis
   - getSalesByPeriod($days = 7) → penjualan periode tertentu
   - getCategorySales() → penjualan per kategori
   - getExpensesByPeriod($days = 30) → total pengeluaran periode tertentu

2. Update instruksi POS Agent agar agent tahu kapan harus memanggil tools untuk menjawab pertanyaan data bisnis.

PENTING:
- JANGAN ubah struktur database yang sudah ada
- JANGAN hapus atau ubah kode yang sudah berfungsi sebelumnya
- Cukup tambahkan kode baru untuk tools dan update agent
- Gunakan model yang sudah berjalan dengan baik

Hasil akhir yang diharapkan: Chatbot bisa menjawab pertanyaan bisnis berdasarkan data real dari database.

update walktrough dan hasil implementasi