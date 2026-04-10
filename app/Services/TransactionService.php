<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ShopSetting;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function generateReceiptNumber(): string
    {
        $date = now()->format('Ymd');
        $lastTransaction = Transaction::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastTransaction
            ? (int) substr($lastTransaction->receipt_number, -4) + 1
            : 1;

        return 'TRX-'.$date.'-'.str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function getTaxRate(): float
    {
        $shop = ShopSetting::getShop();

        return $shop->tax_rate / 100;
    }

    public function calculateTax(float $subtotal): float
    {
        return round($subtotal * $this->getTaxRate());
    }

    public function createTransaction(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $userId = auth()->id();
            $paymentMethod = $data['payment_method'];

            // Determine payment status based on payment method
            // Cash: immediately paid, QRIS/Midtrans: pending until payment confirmed
            $paymentStatus = in_array($paymentMethod, ['cash']) ? 'paid' : 'pending';

            $transaction = Transaction::create([
                'receipt_number' => $this->generateReceiptNumber(),
                'subtotal' => $data['subtotal'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'tax_amount' => $data['tax_amount'],
                'total_price' => $data['total_price'],
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'amount_paid' => $data['amount_paid'] ?? 0,
                'change_amount' => $data['change_amount'] ?? 0,
                'note' => $data['note'] ?? null,
                'transaction_date' => now(),
                'user_id' => $userId,
            ]);

            // For cash: deduct stock and create stock movements immediately
            // For QRIS/Midtrans: only save items, stock deducted on payment confirmation
            if ($paymentMethod === 'cash') {
                foreach ($data['items'] as $item) {
                    $this->processTransactionItem($item, $transaction, $userId);
                }
            } else {
                foreach ($data['items'] as $item) {
                    $this->saveTransactionItem($item, $transaction, $userId);
                }
            }

            return $transaction;
        });
    }

    /**
     * Save transaction item without deducting stock (for pending payments)
     */
    private function saveTransactionItem(array $item, Transaction $transaction, int $userId): void
    {
        $product = Product::find($item['product_id']);

        TransactionItem::create([
            'transaction_id' => $transaction->id,
            'product_id' => $item['product_id'],
            'product_name' => $product->name,
            'price_buy_snapshot' => $item['price_buy_snapshot'] ?? $product->buy_price,
            'price_sell' => $item['price_sell'] ?? $item['price'],
            'quantity' => $item['quantity'],
            'discount_amount' => $item['discount_amount'] ?? 0,
            'subtotal' => $item['subtotal'] ?? ($item['price_sell'] ?? $item['price'] * $item['quantity']),
        ]);
    }

    /**
     * Process a single transaction item (update stock, create movement)
     */
    private function processTransactionItem(array $item, Transaction $transaction, int $userId): void
    {
        // First save the item
        $this->saveTransactionItem($item, $transaction, $userId);

        // Then deduct stock (without triggering observer to avoid duplicate stock movement)
        $product = Product::find($item['product_id']);
        $stockBefore = $product->stock;

        Product::withoutEvents(function () use ($product, $item) {
            $product->decrement('stock', $item['quantity']);
        });
        $product->refresh();

        StockMovement::create([
            'movement_type' => 'sale',
            'qty' => $item['quantity'],
            'stock_before' => $stockBefore,
            'stock_after' => $product->stock,
            'reason' => 'Penjualan - '.$transaction->receipt_number,
            'product_id' => $item['product_id'],
            'user_id' => $userId,
            'reference_id' => $transaction->id,
        ]);
    }

    /**
     * Process payment confirmed transaction (for QRIS/Midtrans)
     */
    public function confirmPayment(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            // Update payment status
            $transaction->update([
                'payment_status' => 'paid',
                'amount_paid' => $transaction->total_price,
            ]);

            // Deduct stock for all items
            foreach ($transaction->items as $item) {
                $product = Product::find($item->product_id);
                $stockBefore = $product->stock;

                Product::withoutEvents(function () use ($product, $item) {
                    $product->decrement('stock', $item->quantity);
                });
                $product->refresh();

                StockMovement::create([
                    'movement_type' => 'sale',
                    'qty' => $item->quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $product->stock,
                    'reason' => 'Penjualan - '.$transaction->receipt_number,
                    'product_id' => $item->product_id,
                    'user_id' => $transaction->user_id,
                    'reference_id' => $transaction->id,
                ]);
            }
        });
    }

    public function createStockMovement(
        Product $product,
        string $type,
        int $qty,
        string $reason,
        ?int $referenceId = null
    ): StockMovement {
        $stockBefore = $product->stock;

        Product::withoutEvents(function () use ($product, $type, $qty) {
            match ($type) {
                'in' => $product->increment('stock', $qty),
                'out' => $product->decrement('stock', $qty),
                'adjustment' => $product->update(['stock' => $qty]),
                default => null,
            };
        });

        $product->refresh();

        return StockMovement::create([
            'movement_type' => $type,
            'qty' => $type === 'adjustment' ? $product->stock - $stockBefore : $qty,
            'stock_before' => $stockBefore,
            'stock_after' => $product->stock,
            'reason' => $reason,
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'reference_id' => $referenceId,
        ]);
    }
}
