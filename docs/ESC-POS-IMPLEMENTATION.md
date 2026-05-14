# Panduan Implementasi Direct Printing (ESC/POS)

Fitur ini memungkinkan aplikasi untuk mencetak struk secara langsung ke printer thermal (LAN/USB) menggunakan protokol ESC/POS via library `mike42/escpos-php`.

## 1. Persyaratan Sistem
- PHP 8.x
- Ekstensi PHP: `mbstring`, `gd` atau `imagick` (opsional untuk gambar).
- Printer Thermal yang mendukung protokol ESC/POS.

## 2. Konfigurasi Printer

Buka file `.env` dan sesuaikan pengaturan berikut:

### Opsi A: Printer Jaringan (LAN/Ethernet/WiFi)
Paling direkomendasikan karena paling stabil.
```env
PRINTER_CONNECTION_TYPE=network
PRINTER_NETWORK_IP=192.168.1.100
PRINTER_NETWORK_PORT=9100
```

### Opsi B: Printer USB (Windows Sharing)
1. Colokkan printer ke komputer.
2. Buka Control Panel > Devices and Printers.
3. Klik kanan printer > Printer Properties > Sharing.
4. Ceklist "Share this printer" dan beri nama (misal: `POSPrinter`).
5. Update `.env`:
```env
PRINTER_CONNECTION_TYPE=windows
PRINTER_WINDOWS_PATH="smb://NAMA-KOMPUTER/POSPrinter"
```

### Opsi C: Printer USB (Linux/Local)
```env
PRINTER_CONNECTION_TYPE=file
PRINTER_FILE_PATH=/dev/usb/lp0
```

## 3. Cara Penggunaan di Aplikasi

1. **Halaman Detail Transaksi**:
   - Terdapat tombol **"Print Thermal"** untuk mencetak langsung.
   - Tombol **"Download PDF"** tetap tersedia untuk arsip digital.

2. **Logika Backend**:
   - `ReceiptPrinterService` menangani perakitan byte ESC/POS.
   - Data dikirim langsung dari server ke printer tanpa dialog browser.

## 4. Penanganan Masalah (Troubleshooting)
- **Error: Connection Refused**: Pastikan IP printer benar dan printer dalam keadaan menyala/online.
- **Error: Permission Denied (Linux)**: Pastikan user web server memiliki akses ke `/dev/usb/lp0`.
- **Karakter Aneh**: Pastikan printer mendukung pengkodean karakter yang digunakan.

---
*Dokumentasi ini dibuat untuk membantu tim operasional dalam melakukan setup hardware kasir.*
