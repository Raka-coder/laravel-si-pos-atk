<?php

use Prism\Prism\Enums\Provider;

return [
    'default_driver' => Provider::Gemini,
    'default_model' => 'gemini-2.5-flash',
    'default_temperature' => 0.7,

    'providers' => [
        'gemini' => [
            'api_key' => env('GEMINI_API_KEY', ''),
            'url' => env('GEMINI_URL', 'https://generativelanguage.googleapis.com/v1beta/models'),
            'model' => 'gemini-2.5-flash',
        ],
        'anthropic' => [
            'api_key' => env('ANTHROPIC_API_KEY', ''),
            'model' => 'claude-sonnet-4-20250514',
        ],
        'openai' => [
            'api_key' => env('OPENAI_API_KEY', ''),
            'model' => 'gpt-4o-mini',
        ],
    ],
];
