<?php

namespace App\Services;

use App\Models\ShopSetting;
use App\Models\Transaction;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    private bool $isConfigured;

    private string $merchantId;

    private string $clientKey;

    private string $serverKey;

    private bool $isProduction;

    public function __construct()
    {
        // Priority: Shop Settings > Environment Variables
        $shop = ShopSetting::getShop();

        $this->merchantId = $shop->midtrans_merchant_id
            ?? config('midtrans.merchant_id')
            ?? env('MIDTRANS_MERCHANT_ID', '');

        $this->clientKey = $shop->midtrans_client_key
            ?? config('midtrans.client_key')
            ?? env('MIDTRANS_CLIENT_KEY', '');

        $this->serverKey = $shop->midtrans_server_key
            ?? config('midtrans.server_key')
            ?? env('MIDTRANS_SERVER_KEY', '');

        $this->isProduction = $shop->midtrans_is_production
            ?? config('midtrans.is_production')
            ?? env('MIDTRANS_IS_PRODUCTION', false);

        // Midtrans only needs serverKey and clientKey to work
        $this->isConfigured = ! empty($this->serverKey) && ! empty($this->clientKey);

        if ($this->isConfigured) {
            $this->initializeConfig();
        }
    }

    private function initializeConfig(): void
    {
        Config::$serverKey = $this->serverKey;
        Config::$clientKey = $this->clientKey;
        Config::$isProduction = $this->isProduction;
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function isConfigured(): bool
    {
        return $this->isConfigured;
    }

    /**
     * Create Snap Token for payment
     */
    public function createSnapToken(Transaction $transaction): array
    {
        if (! $this->isConfigured) {
            throw new \Exception('Midtrans is not configured. Please configure your Merchant ID, Client Key, and Server Key in Shop Settings.');
        }

        $shop = ShopSetting::getShop();

        $itemDetails = [];
        foreach ($transaction->items as $item) {
            $itemDetails[] = [
                'id' => (string) $item->product_id,
                'name' => $item->product_name,
                'price' => (int) $item->price_sell,
                'quantity' => (int) $item->quantity,
            ];
        }

        // Add tax if exists
        if ($transaction->tax_amount > 0) {
            $itemDetails[] = [
                'id' => 'TAX',
                'name' => 'Tax',
                'price' => (int) $transaction->tax_amount,
                'quantity' => 1,
            ];
        }

        $transactionDetails = [
            'order_id' => $transaction->receipt_number,
            'gross_amount' => (int) $transaction->total_price,
        ];

        $customerDetails = [
            'first_name' => $transaction->user->name ?? 'Cashier',
            'email' => $transaction->user->email ?? 'pos@atk-sync.com',
        ];

        $enabledPayments = ['credit_card', 'gopay', 'qris', 'shopeepay', 'bank_transfer'];

        $expiry = [
            'start_time' => now()->format('Y-m-d H:i:s O'),
            'duration' => 30, // minutes
            'unit' => 'minute',
        ];

        $customFields = [
            'cashier_id' => $transaction->user_id,
            'transaction_id' => $transaction->id,
        ];

        $params = [
            'transaction_details' => $transactionDetails,
            'item_details' => $itemDetails,
            'customer_details' => $customerDetails,
            'enabled_payments' => $enabledPayments,
            'expiry' => $expiry,
            'custom_fields' => $customFields,
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            return [
                'success' => true,
                'token' => $snapToken,
                'redirect_url' => ($this->isProduction
                    ? 'https://app.midtrans.com/snap/v2/vtweb/'
                    : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/').$snapToken,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get Snap Redirect URL
     */
    public function getSnapRedirectUrl(Transaction $transaction): string
    {
        $result = $this->createSnapToken($transaction);

        if (! $result['success']) {
            throw new \Exception($result['error']);
        }

        return $result['redirect_url'];
    }

    /**
     * Handle payment notification from Midtrans
     */
    public function handleNotification(array $notification): array
    {
        $orderId = $notification['order_id'] ?? '';
        $statusCode = (string) ($notification['status_code'] ?? '');
        $grossAmount = (string) ($notification['gross_amount'] ?? '');
        $signatureKey = (string) ($notification['signature_key'] ?? '');
        $transactionStatus = $notification['transaction_status'] ?? '';
        $paymentType = $notification['payment_type'] ?? '';
        $fraudStatus = $notification['fraud_status'] ?? '';

        if (! $this->isValidSignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            return [
                'success' => false,
                'message' => 'Invalid signature key',
                'order_id' => $orderId,
            ];
        }

        $transaction = Transaction::where('receipt_number', $orderId)->first();

        if (! $transaction) {
            return [
                'success' => false,
                'message' => 'Transaction not found',
            ];
        }

        $status = $transaction->payment_status;
        $reference = $notification['transaction_id'] ?? '';

        // Update payment reference
        if (! empty($reference)) {
            $transaction->update(['payment_reference' => $reference]);
        }

        // Handle transaction status
        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'accept') {
                $status = 'paid';
            }
        } elseif ($transactionStatus === 'settlement') {
            $status = 'paid';
        } elseif ($transactionStatus === 'pending') {
            $status = 'pending';
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $status = 'cancelled';
        } elseif ($transactionStatus === 'refund') {
            $status = 'refunded';
        }

        if ($status !== $transaction->payment_status) {
            if ($status === 'paid') {
                app(TransactionService::class)->confirmPayment($transaction->fresh('items'));
            } else {
                $transaction->update(['payment_status' => $status]);
            }
        }

        return [
            'success' => true,
            'transaction_id' => $transaction->id,
            'order_id' => $orderId,
            'status' => $status,
            'payment_type' => $paymentType,
        ];
    }

    private function isValidSignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        if ($orderId === '' || $statusCode === '' || $grossAmount === '' || $signatureKey === '') {
            return false;
        }

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        return hash_equals($expectedSignature, $signatureKey);
    }

    /**
     * Check if payment method is available
     */
    public function isPaymentMethodAvailable(string $method): bool
    {
        if (! $this->isConfigured) {
            return false;
        }

        // All methods available if configured
        return in_array($method, ['cash', 'qris', 'midtrans']);
    }
}
