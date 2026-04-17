Kamu sebagai developer, Terdapat bug pada fitur pagination yang ketika pindah ke page dst, selalu kmebali ke page 1, perbaiki pada halaman transaksi, perbaiki dan atasi

Penyebab Umum
Debounce search memanggil ulang fungsi fetch data → defaultnya mengatur page ke 1.
State page tidak dipisahkan dari state pencarian, sehingga setiap kali query berubah, page ikut di-reset.
Handler pagination tidak mempertahankan nilai page saat search aktif.

Pisahkan state search dan pagination
Gunakan useEffect untuk fetch data
Bedakan trigger
Input search → reset page ke 1.
Pagination → hanya ubah page, jangan sentuh search.


Intinya
Debounce hanya untuk search, bukan untuk pagination.
Page state harus independen, jangan di-reset kecuali query search berubah.
Gunakan kombinasi search + page sebagai parameter fetch agar hasil konsisten.