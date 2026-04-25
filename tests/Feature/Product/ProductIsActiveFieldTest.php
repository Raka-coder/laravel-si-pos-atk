<?php

namespace Tests\Feature\Product;

use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductIsActiveFieldTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_product_with_inactive_status(): void
    {
        $user = User::factory()->owner()->create();
        $category = Category::factory()->create();
        $unit = Unit::factory()->create();

        $response = $this->actingAs($user)->postWithCsrf('/products', [
            'barcode' => '8991234567001',
            'name' => 'Produk Nonaktif',
            'buy_price' => 1000,
            'sell_price' => 1500,
            'stock' => 10,
            'min_stock' => 1,
            'is_active' => false,
            'category_id' => $category->id,
            'unit_id' => $unit->id,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('products', [
            'name' => 'Produk Nonaktif',
            'is_active' => 0,
        ]);
    }

    public function test_owner_can_update_product_to_inactive_status(): void
    {
        $user = User::factory()->owner()->create();
        $category = Category::factory()->create();
        $unit = Unit::factory()->create();

        $product = Product::factory()->create([
            'is_active' => true,
            'category_id' => $category->id,
            'unit_id' => $unit->id,
        ]);

        $response = $this->actingAs($user)->putWithCsrf('/products/'.$product->id, [
            'barcode' => $product->barcode,
            'name' => $product->name,
            'buy_price' => $product->buy_price,
            'sell_price' => $product->sell_price,
            'stock' => $product->stock,
            'min_stock' => $product->min_stock,
            'is_active' => false,
            'category_id' => $product->category_id,
            'unit_id' => $product->unit_id,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_active' => 0,
        ]);
    }
}
