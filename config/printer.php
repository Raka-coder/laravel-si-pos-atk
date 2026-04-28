<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Printer Connection
    |--------------------------------------------------------------------------
    |
    | This option controls the default printer connection that will be used
    | by the ReceiptPrinterService.
    |
    | Supported: "network", "windows", "file", "dummy"
    |
    */

    'default' => env('PRINTER_CONNECTION_TYPE', 'dummy'),

    'connections' => [
        'network' => [
            'ip' => env('PRINTER_NETWORK_IP', '192.168.1.100'),
            'port' => env('PRINTER_NETWORK_PORT', 9100),
        ],

        'windows' => [
            'path' => env('PRINTER_WINDOWS_PATH', 'LPT1'), // e.g., "smb://COMPUTER/Printer" or "LPT1"
        ],

        'file' => [
            'path' => env('PRINTER_FILE_PATH', '/dev/usb/lp0'),
        ],
    ],
];
