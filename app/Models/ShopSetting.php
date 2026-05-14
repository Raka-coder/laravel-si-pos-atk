<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

    protected $appends = ['logo_url', 'qris_image_url'];

    protected function logoUrl(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->logo_path) {
                return null;
            }

            return Storage::disk('public')->url($this->logo_path);
        });
    }

    protected function qrisImageUrl(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->qris_image_path) {
                return null;
            }

            return Storage::disk('public')->url($this->qris_image_path);
        });
    }

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
