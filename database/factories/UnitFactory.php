<?php

namespace Database\Factories;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

class UnitFactory extends Factory
{
    protected $model = Unit::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Pieces', 'Pack', 'Dozen', 'Kilogram', 'Liter', 'Box', 'Roll', 'Set']),
            'short_name' => fake()->randomElement(['pcs', 'pack', 'lusin', 'kg', 'L', 'box', 'roll', 'set']),
        ];
    }
}
