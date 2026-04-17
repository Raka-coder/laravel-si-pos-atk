<?php

namespace Tests\Feature\Settings;

use App\Models\ShopSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ShopSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_settings_page_is_displayed_for_owner(): void
    {
        $owner = User::factory()->owner()->create();

        ShopSetting::query()->create([
            'shop_name' => 'Toko Uji',
            'tax_rate' => 11,
            'paper_size' => 'mm_80',
        ]);

        $this->actingAs($owner)
            ->get(route('shop-settings'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shop/index')
                ->has('shop')
                ->where('shop.shop_name', 'Toko Uji')
                ->where('shop.paper_size', 'mm_80'),
            );
    }
}
