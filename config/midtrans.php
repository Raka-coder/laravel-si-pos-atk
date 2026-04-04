<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Midtrans payment gateway. You can get the keys
    | from your Midtrans Dashboard at https://dashboard.midtrans.com
    |
    */

    'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    |
    | Set to true for production environment. Set to false for sandbox.
    |
    */
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    /*
    |--------------------------------------------------------------------------
    | Snap Configuration
    |--------------------------------------------------------------------------
    */
    'snap' => [
        'enabled' => env('MIDTRANS_SNAP_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | QRIS Configuration
    |--------------------------------------------------------------------------
    */
    'qris' => [
        'enabled' => env('MIDTRANS_QRIS_ENABLED', true),
    ],
];
