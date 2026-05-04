<?php

/**
 * @see https://github.com/artesaos/seotools
 */

return [
    'inertia' => env('SEO_TOOLS_INERTIA', true),
    'meta' => [
        /*
         * The default configurations to be used by the meta generator.
         */
        'defaults' => [
            'title' => 'ATK-Sync POS - Point of Sale',
            'titleBefore' => true,
            'description' => 'Sistem Point of Sale modern untuk toko ATK dengan fitur lengkap: manajemen produk, transaksi, laporan penjualan, dan laporan keuntungan.',
            'separator' => ' - ',
            'keywords' => ['pos', 'point of sale', 'toko atk', 'manajemen toko', 'kasir', 'inventory'],
            'canonical' => null,
            'robots' => 'index, follow',
        ],
        /*
         * Webmaster tags are always added.
         */
        'webmaster_tags' => [
            'google' => null,
            'bing' => null,
            'alexa' => null,
            'pinterest' => null,
            'yandex' => null,
            'norton' => null,
        ],

        'add_notranslate_class' => false,
    ],
    'opengraph' => [
        /*
         * The default configurations to be used by the opengraph generator.
         */
        'defaults' => [
            'title' => 'ATK-Sync POS - Point of Sale',
            'description' => 'Sistem Point of Sale modern untuk toko ATK dengan fitur lengkap.',
            'url' => null,
            'type' => 'website',
            'site_name' => 'ATK-Sync POS',
            'images' => [
                ['url' => '/og-image.png', 'width' => 1200, 'height' => 630, 'type' => 'image/png'],
            ],
        ],
    ],
    'twitter' => [
        /*
         * The default values to be used by the twitter cards generator.
         */
        'defaults' => [
            'card' => 'summary_large_image',
            'site' => '@atksync',
        ],
    ],
    'json-ld' => [
        /*
         * The default configurations to be used by the json-ld generator.
         */
        'defaults' => [
            'title' => 'ATK-Sync POS - Point of Sale',
            'description' => 'Sistem Point of Sale modern untuk toko ATK',
            'url' => null,
            'type' => 'WebSite',
            'images' => [],
        ],
    ],
];
