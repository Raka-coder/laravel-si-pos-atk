# Midtrans Integration - Configuration Guide

## Endpoint Overview

Your application already has the following endpoints configured:

### 1. Notification URL (Webhook)

```
POST https://your-domain.com/midtrans/notification
```

**Purpose:** Midtrans sends payment status updates here after transaction processing.

**Route Name:** `midtrans.notification`

**Controller:** `MidtransCallbackController@handleNotification`

### 2. Redirect URL (Finish Page)

```
GET https://your-domain.com/midtrans/redirect?order_id=XXX&status=success
```

**Purpose:** User is redirected here after completing or cancelling payment on Midtrans page.

**Route Name:** `midtrans.redirect`

**Controller:** `MidtransCallbackController@handleRedirect`

## Ngrok Configuration

### Step 1: Get Your Ngrok URL

After starting ngrok, you'll see output like:

```
Session Status                online
Account                      your@email.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8000
```

Your **ngrok URL** is: `https://abc123def456.ngrok-free.app`

### Step 2: Update APP_URL in .env

Edit `.env` file:

```bash
# Change from:
APP_URL=http://localhost:8000

# To your ngrok URL:
APP_URL=https://abc123def456.ngrok-free.app
```

### Step 3: Clear Laravel Cache

```bash
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

## Midtrans Dashboard Configuration

### Step 1: Login to Midtrans Dashboard

Go to: https://dashboard.midtrans.com/

Select your account (Sandbox/Production)

### Step 2: Configure Settings

Navigate to: **Settings → General Settings**

#### Set Notification URL

1. Find **Payment Notification URL** field
2. Enter: `https://your-ngrok-url/midtrans/notification`
3. Click Save

Example:

```
https://abc123def456.ngrok-free.app/midtrans/notification
```

#### Set Redirect URL

1. Find **Finish Redirect URL** field
2. Enter: `https://your-ngrok-url/midtrans/redirect`
3. Click Save

Example:

```
https://abc123def456.ngrok-free.app/midtrans/redirect
```

### Step 3: Verify Endpoints

Test your endpoints:

```bash
# Test notification endpoint (should return 401 without valid signature)
curl -X POST https://abc123def456.ngrok-free.app/midtrans/notification

# Test redirect endpoint (should redirect to transactions or pos)
curl -L "https://abc123def456.ngrok-free.app/midtrans/redirect?order_id=TEST&status=success"
```

## Current Routes in Your Application

```php
// routes/web.php

// Midtrans webhook - no auth required
Route::post('midtrans/notification', [MidtransCallbackController::class, 'handleNotification'])
    ->name('midtrans.notification');

Route::get('midtrans/redirect', [MidtransCallbackController::class, 'handleRedirect'])
    ->name('midtrans.redirect');
```

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. USER INITIATES PAYMENT (QRIS/Midtrans)
   │
   ▼
2. BACKEND creates transaction with pending status
   │   - Saves transaction items (for Midtrans display)
   │   - Returns snap_token
   │
   ▼
3. FRONTEND opens Midtrans Snap popup
   │
   ▼
4. USER COMPLETES PAYMENT on Midtrans page
   │
   ├──► SUCCESS → Midtrans redirects to /midtrans/redirect
   │              → Controller confirms payment
   │              → Deducts stock
   │              → Redirects to transaction detail
   │
   ├──► PENDING → Midtrans sends webhook to /midtrans/notification
   │              → Controller updates status
   │
   └──► FAILED → User redirected to /midtrans/redirect
                 → Shows error message
```

## Verification Checklist

- [ ] Ngrok is running and accessible
- [ ] APP_URL updated in .env to ngrok URL
- [ ] Laravel cache cleared
- [ ] Notification URL configured in Midtrans Dashboard
- [ ] Redirect URL configured in Midtrans Dashboard
- [ ] Midtrans Client Key matches in .env and Shop Settings
- [ ] Midtrans Server Key matches in .env and Shop Settings

## Troubleshooting

### Webhook Not Received

Check Laravel log:

```bash
tail -f storage/logs/laravel.log
```

Look for: `Midtrans Notification Received`

### Transaction Status Not Updated

Verify:

1. Transaction exists with correct receipt_number
2. MidtransService is properly configured
3. Server key is correct in .env

### Stock Not Deducted

The stock is deducted in two scenarios:

1. **Cash payment:** Immediately after transaction creation
2. **QRIS/Midtrans:** After payment confirmation via webhook or redirect

Check `confirmPayment()` method in `TransactionService.php`

## Environment Variables

Ensure these are set in `.env`:

```bash
# Midtrans Configuration
MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_MERCHANT_ID=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

Note: Keys with `SB-` prefix are sandbox/test keys. For production, use keys without `SB-` prefix.

# Midtrans Webhook Pending -> Paid (Laravel + Localhost)

## 1) Flow webhook Midtrans yang benar

1. User klik bayar di `/pos` dan frontend minta Snap token ke backend.
2. Backend membuat `transaction` dengan `payment_status = pending`.
3. User menyelesaikan pembayaran di Snap.
4. Midtrans mengirim HTTP POST notification ke endpoint webhook kamu (server-to-server).
5. Laravel memverifikasi `signature_key`.
6. Jika valid dan `transaction_status` = `settlement` / `capture(accept)`, update transaksi jadi `paid`.
7. Return `200` agar Midtrans anggap webhook sukses.

Catatan penting: status final **jangan** hanya mengandalkan redirect browser user. Sumber kebenaran harus dari webhook.

---

## 2) Cara pakai ngrok untuk test localhost

### A. Jalankan Laravel

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### B. Jalankan ngrok

```bash
ngrok http 8000
```

Ambil URL HTTPS ngrok, contoh:

`https://abc123.ngrok-free.app`

### C. Set URL di Midtrans Dashboard (Sandbox)

- Payment Notification URL:
    - `https://abc123.ngrok-free.app/midtrans/notification`
- (Opsional) Finish/Unfinish/Error redirect URL:
    - `https://abc123.ngrok-free.app/midtrans/redirect`

### D. Lakukan pembayaran sandbox

Setelah bayar sukses, Midtrans akan call ke endpoint ngrok kamu.

---

## 3) Contoh route + controller webhook Laravel

### Route

```php
Route::post('midtrans/notification', [MidtransCallbackController::class, 'handleNotification'])
    ->name('midtrans.notification');
```

### CSRF exclude (wajib untuk webhook eksternal)

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->preventRequestForgery(except: [
        'midtrans/notification',
    ]);
})
```

### Controller inti

```php
public function handleNotification(Request $request): JsonResponse
{
    $result = app(MidtransService::class)->handleNotification($request->all());

    if ($result['success']) {
        return response()->json(['success' => true], 200);
    }

    $statusCode = ($result['message'] ?? '') === 'Invalid signature key' ? 403 : 400;

    return response()->json([
        'success' => false,
        'message' => $result['message'] ?? 'Processing failed',
    ], $statusCode);
}
```

---

## 4) Validasi signature key (best practice)

Sesuai referensi Midtrans (Context7):

`sha512(order_id + status_code + gross_amount + server_key)`

Contoh implementasi:

```php
$expected = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

if (! hash_equals($expected, $signatureKey)) {
    // reject webhook
}
```

---

## 5) Cara memastikan webhook benar-benar diterima

### A. Log payload webhook

```php
Log::info('Midtrans Notification Received', [
    'payload' => $request->all(),
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent(),
]);
```

### B. Pantau log realtime

```bash
php artisan pail -v
```

atau

```bash
tail -f storage/logs/laravel.log
```

### C. Cek status HTTP webhook

- Harus balas `2xx` jika sukses.
- `403` biasanya signature salah.
- `419` biasanya CSRF belum di-exclude.

### D. Uji manual endpoint webhook (curl)

Kirim payload simulasi dengan signature valid untuk memastikan flow update `pending -> paid` jalan.

---

## 6) Solusi jika webhook tidak masuk

1. Pastikan URL notification di Midtrans pakai HTTPS publik (ngrok), bukan `localhost`.
2. Pastikan route webhook bisa diakses dari internet.
3. Pastikan CSRF webhook di-exclude.
4. Pastikan server key yang dipakai validasi signature sama dengan key Midtrans environment yang aktif.
5. Pastikan environment sinkron:
    - Sandbox: `app.sandbox.midtrans.com` + sandbox keys
    - Production: `app.midtrans.com` + production keys
6. Pastikan endpoint selalu return JSON + status code tepat.
7. Cek log Midtrans Dashboard (notification history) lalu resend webhook.
8. Cek firewall/reverse proxy tidak blokir request masuk.

---

## Fix yang sudah diterapkan di project ini

- Webhook route sudah di-exclude dari CSRF.
- Signature key Midtrans sudah divalidasi sebelum update status.
- Proses `confirmPayment()` dibuat idempotent (tidak double potong stok saat webhook dikirim ulang).
- Redirect callback juga dijaga agar tidak double process transaksi paid.
- Sudah ditambah test otomatis:
    - valid signature -> status jadi `paid`
    - invalid signature -> ditolak

Test yang dijalankan:

```bash
php artisan test --compact tests/Feature/Payment/MidtransWebhookTest.php
```

