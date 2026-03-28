<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'receipt_number' => 'TRX-'.date('Ymd').'-'.str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'subtotal' => fake()->randomNumber(5, true),
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_price' => fake()->randomNumber(5, true),
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'payment_reference' => null,
            'amount_paid' => fake()->randomNumber(5, true),
            'change_amount' => fake()->randomNumber(4, true),
            'note' => null,
            'transaction_date' => now(),
            'user_id' => User::factory(),
        ];
    }
}
