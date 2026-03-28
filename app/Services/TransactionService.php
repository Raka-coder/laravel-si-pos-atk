<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public const TAX_RATE = 0.11;

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

    public function calculateTax(float $subtotal): float
    {
        return round($subtotal * self::TAX_RATE);
    }

    public function createTransaction(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $userId = auth()->id();

            $transaction = Transaction::create([
                'receipt_number' => $this->generateReceiptNumber(),
                'subtotal' => $data['subtotal'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'tax_amount' => $data['tax_amount'],
                'total_price' => $data['total_price'],
                'payment_method' => $data['payment_method'],
                'payment_status' => 'paid',
                'amount_paid' => $data['amount_paid'],
                'change_amount' => $data['change_amount'],
                'note' => $data['note'] ?? null,
                'transaction_date' => now(),
                'user_id' => $userId,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                $stockBefore = $product->stock;

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

                $product->decrement('stock', $item['quantity']);
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

            return $transaction;
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

        match ($type) {
            'in' => $product->increment('stock', $qty),
            'out' => $product->decrement('stock', $qty),
            'adjustment' => $product->update(['stock' => $qty]),
            default => null,
        };

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
