<?php

namespace App\Http\Middleware;

use App\Models\SeoSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    private function routeToSeoPage(string $routeName): string
    {
        $map = [
            'home' => 'home',
            'dashboard' => 'dashboard',
            'pos' => 'pos',
            'products' => 'products',
            'product-categories' => 'categories',
            'units' => 'units',
            'stock-movements' => 'stock_movements',
            'transactions' => 'transactions',
            'expenses' => 'expenses',
            'expense-categories' => 'expense_categories',
            'chat' => 'chat',
            'reports.sales' => 'reports_sales',
            'reports.expenses' => 'reports_expenses',
            'reports.profit-loss' => 'reports_profit_loss',
            'shop-settings' => 'shop_settings',
            'users' => 'users',
            'profile.edit' => 'profile',
            'security.edit' => 'security',
            'appearance.edit' => 'appearance',
        ];

        return $map[$routeName] ?? $routeName;
    }

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $isOwner = $user && $user->hasRole('owner');

        $route = $request->route();
        $seo = null;

        if ($route) {
            $page = $this->routeToSeoPage($route->getName() ?? '');
            $seo = SeoSetting::getForPage($page);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'isOwner' => $isOwner,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'seo' => $seo ? [
                'title' => $seo->title,
                'description' => $seo->description,
                'keywords' => $seo->keywords,
                'og_image' => $seo->og_image,
                'canonical_url' => $seo->canonical_url,
                'indexed' => $seo->indexed,
            ] : null,
        ];
    }
}
