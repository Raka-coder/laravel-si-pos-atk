# Dashboard Optimization Walkthrough

## Overview

Dokumentasi ini menjelaskan langkah-langkah optimasi dashboard POS untuk meningkatkan performa load dan interaksi.

## Masalah yang Diatasi

- Dashboard terasa lambat saat dibuka
- Data yang ditampilkan meliputi statistik penjualan, chart transaksi, dan produk terlaris
- Payload Inertia terlalu besar karena semua data dikirim sekaligus

## Solusi yang Diterapkan

### 1. Optimasi Query Laravel

**Sebelum (Tidak Optimal):**

```php
// Multiple queries - inefficient
$todayTransactions = Transaction::whereDate('created_at', today())
    ->where('payment_status', 'paid')
    ->get();

$stats['today_sales'] = $todayTransactions->count();
$stats['today_revenue'] = $todayTransactions->sum('total_price');
```

**Sesudah (Optimal):**

```php
// Single query dengan agregasi
$todayStats = Transaction::whereDate('created_at', $today)
    ->where('payment_status', 'paid')
    ->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue')
    ->first();

$stats = [
    'today_sales' => $todayStats?->count ?? 0,
    'today_revenue' => (int) ($todayStats?->revenue ?? 0),
];
```

### 2. Caching Laravel

Cache selama 10 detik untuk data yang sering diakses:

```php
private const CACHE_TTL = 10; // 10 seconds

private function getQuickStats(bool $isOwner): array
{
    $userId = Auth::id() ?? 'guest';
    $cacheKey = 'dashboard_quick_'.$userId.'_'.now()->format('Y-m-d-H-i');

    return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($isOwner) {
        // Semua query di dalam cache
    });
}
```

### 3. Pisahkan Data dengan API Terpisah

Mengurangi payload Inertia dengan memisahkan chart data ke API endpoint:

**Routes:**

```php
Route::get('api/dashboard/charts', [DashboardApiController::class, 'chartData']);
Route::get('api/dashboard/charts/refresh', [DashboardApiController::class, 'refreshStats']);
Route::get('api/dashboard/hourly', [DashboardApiController::class, 'hourlyData']);
```

**API Controller:**

```php
class DashboardApiController extends Controller
{
    private const CACHE_TTL = 10;

    public function chartData(): JsonResponse
    {
        $cacheKey = 'dashboard_charts_'.now()->format('Y-m-d-H-i');

        $data = Cache::remember($cacheKey, self::CACHE_TTL, function () {
            // Chart queries...
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'cached_at' => now()->toIso8601String(),
        ]);
    }
}
```

### 4. Optimasi React dengan useMemo & useCallback

```tsx
// useMemo untuk data yang tidak berubah
const topProducts = useMemo(
    () => chartData?.top_products?.slice(0, 5) ?? [],
    [chartData?.top_products],
);

// useCallback untuk handlers
const handleRefresh = useCallback(() => {
    router.reload({ only: ['stats'] });
}, []);

// Lazy load chart components
const RevenueChart = lazy(() => import('@/components/charts/RevenueChart'));
```

### 5. Skeleton UI untuk Loading State

```tsx
const ChartSkeleton = () => (
    <div className="animate-pulse">
        <div className="mb-4 h-4 w-1/4 rounded bg-muted"></div>
        <div className="h-64 rounded bg-muted"></div>
    </div>
);

// Penggunaan
{
    loading ? <ChartSkeleton /> : <RevenueChart data={data} />;
}
```

### 6. Optimasi Recharts

```tsx
// Kurangi titik data untuk performa
const optimizedData = useMemo(
    () => data.slice(-14), // Hanya 14 hari terakhir
    [data],
);

// Lazy evaluation
<ResponsiveContainer width="100%" height={300}>
    <AreaChart data={optimizedData}>{/* Simplified chart */}</AreaChart>
</ResponsiveContainer>;
```

## Struktur Files

```
app/
├── Http/Controllers/
│   ├── DashboardController.php       (UPDATE: minimal data, cache)
│   └── Api/
│       └── DashboardApiController.php (NEW: separate endpoints)

resources/js/
├── pages/
│   └── dashboard.tsx                 (UPDATE: lazy loading)
```

## API Endpoints

| Endpoint                          | Method | Data          | Cache    |
| --------------------------------- | ------ | ------------- | -------- |
| GET /dashboard                    | GET    | Stats utama   | 10s      |
| GET /api/dashboard/charts         | GET    | Chart data    | 10s      |
| GET /api/dashboard/hourly         | GET    | Hourly data   | 10s      |
| GET /api/dashboard/charts/refresh | GET    | Force refresh | No cache |

## Best Practices yang Diterapkan

1. **Query Optimization**
    - Gunakan `selectRaw` dengan agregasi (COUNT, SUM dalam satu query)
    - Hindari `get()` lalu `sum()` - langsung di database

2. **Caching Strategy**
    - Cache TTL 10 detik (sesuai request: 5-10 detik)
    - Cache per-user untuk multi-user support

3. **Payload Reduction**
    - Initial load hanya stats dasar
    - Chart data di-load terpisah via API

4. **React Optimization**
    - `useMemo` untuk computed values
    - `useCallback` untuk event handlers
    - Lazy loading untuk chart components

5. **Chart Optimization**
    - Kurangi data points yang ditampilkan
    - Gunakan `ResponsiveContainer` dengan fixed height
    - Disable animations untuk production

## Hasil yang Diharapkan

- Initial load time: ~500ms (dari ~2-3 detik)
- Interaksi cepat tanpa re-render berlebihan
- Chart di-load async tanpa blocking UI
- Cache 10 detik untuk data real-time-ish

## Cara Testing

```bash
# Test response time
curl -w "@time.txt" -o /dev/null -s http://localhost:8000/dashboard

# Test API response
curl http://localhost:8000/api/dashboard/charts
```

## References

- [Laravel Caching](https://laravel.com/docs/11.x/cache)
- [React useMemo](https://react.dev/reference/react/useMemo)
- [Recharts Performance](https://recharts.org/guides/performance)
