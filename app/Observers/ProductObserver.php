<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\StockMovement;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        if ($product->stock > 0) {
            StockMovement::create([
                'movement_type' => 'in',
                'qty' => $product->stock,
                'stock_before' => 0,
                'stock_after' => $product->stock,
                'reason' => 'Stok awal - Produk dibuat',
                'product_id' => $product->id,
                'user_id' => auth()->id(),
            ]);
        }
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        if ($product->isDirty('stock')) {
            $stockBefore = $product->getOriginal('stock');
            $stockAfter = $product->stock;
            $qty = abs($stockAfter - $stockBefore);
            $type = $stockAfter > $stockBefore ? 'in' : 'out';

            StockMovement::create([
                'movement_type' => $type,
                'qty' => $qty,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reason' => 'Penyesuaian stok manual - '.$product->name,
                'product_id' => $product->id,
                'user_id' => auth()->id(),
            ]);
        }
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        if ($product->stock > 0) {
            StockMovement::create([
                'movement_type' => 'out',
                'qty' => $product->stock,
                'stock_before' => $product->stock,
                'stock_after' => 0,
                'reason' => 'Produk dihapus - '.$product->name,
                'product_id' => $product->id,
                'user_id' => auth()->id(),
            ]);
        }
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        //
    }

    /**
     * Handle the Product "force deleted" event.
     */
    public function forceDeleted(Product $product): void
    {
        //
    }
}
