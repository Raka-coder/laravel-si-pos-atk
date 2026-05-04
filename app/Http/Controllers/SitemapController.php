<?php

namespace App\Http\Controllers;

use App\Models\SeoSetting;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $urls = [];

        // Homepage
        $homeSeo = SeoSetting::getForHome();
        $urls[] = [
            'loc' => URL::to('/'),
            'lastmod' => now()->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '1.0',
            'indexed' => $homeSeo?->indexed ?? true,
        ];

        // Static pages that should be indexed
        $staticPages = [
            ['loc' => '/login', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/register', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $page) {
            $urls[] = array_merge($page, [
                'loc' => URL::to($page['loc']),
                'lastmod' => now()->toAtomString(),
                'indexed' => true,
            ]);
        }

        // Filter only indexed URLs
        $indexedUrls = array_filter($urls, fn ($url) => $url['indexed'] ?? true);

        $content = view('sitemap', ['urls' => $indexedUrls])->render();

        return response($content, 200, [
            'Content-Type' => 'application/xml',
            'Content-Length' => strlen($content),
        ]);
    }
}
