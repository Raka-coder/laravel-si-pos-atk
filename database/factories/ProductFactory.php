<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'barcode' => fake()->unique()->ean13(),
            'name' => fake()->words(3, true),
            'buy_price' => fake()->randomNumber(4, true),
            'sell_price' => fake()->randomNumber(4, true) + 500,
            'stock' => fake()->numberBetween(0, 100),
            'min_stock' => fake()->numberBetween(5, 20),
            'image' => null,
            'is_active' => true,
            'category_id' => Category::factory(),
            'unit_id' => Unit::factory(),
        ];
    }
}
