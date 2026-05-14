# FASE 8: Payment System

## Overview

FASE 8 implements payment system with multiple payment methods: Cash, QRIS, and Midtrans Snap integration.

## New Features

### 1. Payment Methods

- **Cash**: Direct payment with exact amount or change calculation
- **QRIS**: QR Code payment (via Midtrans)
- **Midtrans**: Full payment gateway integration (Credit Card, GoPay, ShopeePay, etc.)

### 2. Midtrans Integration

- **Snap Token**: Generate payment token for digital payments
- **Webhook**: Handle payment notification from Midtrans
- **Configuration**: Store Merchant ID, Client Key, Server Key in Shop Settings

### 3. Transaction Flow

- **Cash**: Transaction created with `payment_status = paid`, stock updated immediately
- **QRIS/Midtrans**: Transaction created with `payment_status = pending`, stock updated after payment confirmation

## Configuration

### Midtrans Setup

1. Register at https://dashboard.midtrans.com
2. Get your credentials:
    - Merchant ID
    - Client Key
    - Server Key
3. Configure in Shop Settings (Admin → Settings → Shop)

### Environment Variables (Optional)

Add to `.env`:

```env
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_IS_PRODUCTION=false
```

## Files Modified

### Backend

- `app/Services/MidtransService.php` - New: Midtrans payment integration
- `app/Services/TransactionService.php` - Updated: Handle different payment flows
- `app/Http/Controllers/Payment/MidtransCallbackController.php` - New: Handle webhooks
- `app/Http/Controllers/Transaction/TransactionController.php` - Updated: Return Snap token
- `app/Http/Controllers/Settings/ShopSettingController.php` - Updated: Midtrans config fields
- `app/Models/ShopSetting.php` - Updated: Add Midtrans key fields

### Database

- `database/migrations/2026_04_04_083610_add_midtrans_keys_to_shop_settings_table.php`

### Config

- `config/midtrans.php` - New: Midtrans configuration

### Routes

- `routes/web.php` - Added Midtrans webhook routes

## Testing

### 1. Cash Payment Test

```
1. Go to POS page
2. Add products to cart
3. Click "Checkout"
4. Select "Cash" payment method
5. Enter amount (exact or over)
6. Click "Pay"
7. Verify: Transaction created, receipt shown, stock reduced
```

### 2. Midtrans Payment Test (Sandbox)

```
Prerequisites:
- Midtrans sandbox account
- Configure Merchant ID, Client Key, Server Key in Shop Settings

Steps:
1. Go to POS page
2. Add products to cart
3. Click "Checkout"
4. Select "Midtrans" payment method
5. Click "Pay"
6. Verify: Snap popup opens OR redirect to Midtrans
7. Complete payment in sandbox
8. Verify: Transaction status updated, stock reduced
```

### 3. QRIS Payment Test

```
Prerequisites:
- Midtrans configured with QRIS enabled
- QRIS feature activated in Midtrans dashboard

Steps:
1. Go to POS page
2. Add products to cart
3. Click "Checkout"
4. Select "QRIS" payment method
5. Click "Pay"
6. Verify: QR code displayed / Snap popup with QRIS option
7. Scan QR with e-wallet app
8. Complete payment
9. Verify: Transaction confirmed
```

### 4. Payment Notification Test

```
1. Make a Midtrans payment
2. Wait for payment status change (settlement/pending)
3. Check: Transaction payment_status updated correctly
4. For 'settlement': Stock should be reduced
```

### 5. Edge Cases

| Scenario                     | Expected Result                        |
| ---------------------------- | -------------------------------------- |
| Cash - Exact amount          | Transaction success, no change         |
| Cash - Over payment          | Transaction success, change calculated |
| Cash - Under payment         | Error: "Jumlah pembayaran kurang"      |
| Midtrans - Payment timeout   | Transaction cancelled after 30 min     |
| Midtrans - Payment cancelled | Transaction status = cancelled         |
| Midtrans - Not configured    | Show error in POS                      |

## Troubleshooting

### "Midtrans is not configured"

- Check Shop Settings → Midtrans section
- Ensure Merchant ID, Client Key, Server Key are filled

### "Payment initialization failed"

- Verify Midtrans credentials are correct
- Check server can connect to Midtrans API
- Check logs in `storage/logs/laravel.log`

### Webhook not received

- Verify webhook URL is accessible: `yourdomain.com/midtrans/notification`
- Check Midtrans dashboard for webhook delivery status
- Verify server is not blocking the request

## Database Schema

```sql
-- transactions table already has:
payment_method: enum('cash', 'qris', 'midtrans')
payment_status: enum('pending', 'paid', 'cancelled', 'refunded')
payment_reference: varchar(255) -- Midtrans transaction ID

-- shop_settings table new columns:
midtrans_merchant_id: varchar(100)
midtrans_client_key: varchar(200)
midtrans_server_key: varchar(200)
midtrans_is_production: boolean
```

## Next Steps

- Add more payment methods (e.g., bank transfer VA)
- Implement payment retry flow
- Add payment history tracking
- Add refund functionality
