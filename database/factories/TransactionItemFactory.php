<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionItemFactory extends Factory
{
    protected $model = TransactionItem::class;

    public function definition(): array
    {
        $product = Product::factory()->create();

        return [
            'transaction_id' => Transaction::factory(),
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price_buy_snapshot' => $product->buy_price,
            'price_sell' => $product->sell_price,
            'quantity' => fake()->numberBetween(1, 5),
            'discount_amount' => 0,
            'subtotal' => $product->sell_price * fake()->numberBetween(1, 5),
        ];
    }
}
