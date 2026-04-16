Saya menggunakan React + Inertia.js dengan fitur search (debounce) dan pagination.

Masalah:
- Saat berpindah halaman (page 2, 3, dst), selalu kembali ke page 1
- Terdapat debounce pada input search

Tolong bantu:
1. Identifikasi penyebab konflik antara debounce search dan pagination
2. Berikan solusi agar pagination tidak reset saat search berubah berlaku ke halaman yang memiliki fitur pagination
3. Pisahkan logic search dan pagination dengan benar
4. Gunakan query params (search & page) secara konsisten
5. Berikan contoh implementasi React (useEffect debounce + router.get)


Hindari:
❌ debounce ikut dependency page
❌ tidak kirim page saat search
❌ tidak pakai preserveState
❌ reset state setiap render

Jawaban harus fokus pada best practice dan contoh kode yang clean.