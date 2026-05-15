<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $appName = config('app.name', 'POS ATK');
            $defaultTitle = 'ATK-Sync POS - Sistem Point of Sale Modern';
            $defaultDesc = 'Sistem Point of Sale modern untuk toko ATK dengan fitur lengkap.';
            $logoUrl = url('/og-image.png');
        @endphp

        <meta name="description" content="{{ $defaultDesc }}">
        <meta name="keywords" content="pos, point of sale, toko atk, kasir, inventory">

        <!-- Open Graph -->
        <meta property="og:title" content="{{ $defaultTitle }}">
        <meta property="og:description" content="{{ $defaultDesc }}">
        <meta property="og:image" content="{{ $logoUrl }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $appName }}">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $defaultTitle }}">
        <meta name="twitter:description" content="{{ $defaultDesc }}">
        <meta name="twitter:image" content="{{ $logoUrl }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        <script src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key="{{ config('midtrans.client_key') }}">
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml">
        <link rel="icon" href="/logo.png" sizes="32x32" type="image/png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head />
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
