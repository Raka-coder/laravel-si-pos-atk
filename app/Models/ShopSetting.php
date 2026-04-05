<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @method static ShopSetting create(array $attributes = [])
 * @method static ShopSetting|null first()
 */
class ShopSetting extends Model
{
    protected $fillable = [
        'shop_name',
        'address',
        'email',
        'phone',
        'npwp',
        'logo_path',
        'qris_image_path',
        'midtrans_merchant_id',
        'midtrans_client_key',
        'midtrans_server_key',
        'midtrans_is_production',
        'tax_rate',
        'receipt_footer',
        'paper_size',
    ];

    protected $casts = [
        'tax_rate' => 'decimal:2',
        'midtrans_is_production' => 'boolean',
    ];

    public static function getShop(): self
    {
        $shop = self::query()->first();

        if (! $shop) {
            $shop = self::create([
                'shop_name' => 'Toko ATK',
                'tax_rate' => 11.00,
                'paper_size' => 'mm_80',
            ]);
        }

        return $shop;
    }
}
