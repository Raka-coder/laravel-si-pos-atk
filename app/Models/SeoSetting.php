<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    protected $fillable = [
        'page',
        'title',
        'description',
        'keywords',
        'og_image',
        'canonical_url',
        'indexed',
    ];

    protected $casts = [
        'indexed' => 'boolean',
    ];

    public static function getForPage(string $page): ?self
    {
        return static::where('page', $page)->first();
    }

    public static function getForHome(): ?self
    {
        return static::getForPage('home');
    }
}
