# SEO Upgrade Walkthrough - ATK-Sync POS

Dokumentasi ini berisi langkah-langkah implementasi upgrade SEO untuk project POS ini.

---

## 📦 Dependencies yang Diinstall

```bash
composer require artesaos/seotools
```

Package ini adalah alternatif dari Spatie Laravel SEO yang tidak tersedia untuk versi ini.

---

## 🏗️ Struktur File yang Dibuat/Dimodifikasi

### File Baru Dibuat

| File | Deskripsi |
|------|----------|
| `config/seotools.php` | Konfigurasi global SEO |
| `app/Models/SeoSetting.php` | Model untuk menyimpan SEO settings di database |
| `app/Http/Controllers/SitemapController.php` | Controller untuk generate sitemap.xml |
| `resources/views/sitemap.blade.php` | View untuk sitemap XML |
| `public/og-image.svg` | OG Image untuk social sharing (1200x630) |
| `database/migrations/2026_05_04_132202_create_seo_settings_table.php` | Migration untuk table seo_settings |
| `docs/seo-upgrade-walkthrough.md` | Dokumentasi ini |

### File Dimodifikasi

| File | Perubahan |
|------|----------|
| `composer.json` | Tambah dependency `artesaos/seotools` |
| `resources/views/app.blade.php` | Tambah `@seotools` untuk global meta |
| `resources/js/pages/welcome.tsx` | Tambah SEO meta tags + JSON-LD |
| `resources/js/pages/error.tsx` | Tambah meta + noindex untuk error pages |
| `public/robots.txt` | Update dengan rules yang tepat |
| `routes/web.php` | Tambah route sitemap.xml |

---

## 📋 Tahap Implementasi

### Tier 1 - Dasar (Setup + Quick Wins)

#### 1.1 Install Package
```bash
composer require artesaos/seotools
```

#### 1.2 Publish Config
```bash
php artisan vendor:publish --provider="Artesaos\SEOTools\Providers\SEOToolsServiceProvider"
```

Konfigurasi `config/seotools.php` sudah dimodifikasi dengan:
- Default title, description, keywords
- OpenGraph defaults
- Twitter Card settings
- JSON-LD defaults

#### 1.3 Global Meta Tags (app.blade.php)
```php
{{-- SEO Meta Tags (Global) --}}
@seotools
```

#### 1.4 Welcome Page SEO (welcome.tsx)
Menambahkan:
- Dynamic title dari shop_name
- Meta description
- Meta keywords
- Open Graph tags (og:title, og:description, og:image, etc.)
- Twitter Card tags
- JSON-LD Structured Data (WebApplication schema)

#### 1.5 Robots.txt
File `public/robots.txt` diupdate dengan:
- Allow untuk halaman publik
- Disallow untuk routes internal (admin, dashboard, dll)
- Sitemap reference

---

### Tier 2 - Intermediate

#### 2.1 JSON-LD Schema
Welcome page sudah dilengkapi dengan JSON-LD WebApplication schema:
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ATK-Sync POS",
  "description": "Sistem Point of Sale modern...",
  "applicationCategory": "BusinessApplication",
  "featureList": [...]
}
```

#### 2.2 OG Image
Created `public/og-image.svg` (1200x630) sebagai default OG image.

#### 2.3 Error Pages SEO
Error page sudah ditambahkan:
- Meta description dinamis
- `noindex, nofollow` robots meta

---

### Tier 3 - Advanced (Database-driven SEO)

#### 3.1 SEO Settings Table & Model

**Migration** (`database/migrations/2026_05_04_132202_create_seo_settings_table.php`):
```php
Schema::create('seo_settings', function (Blueprint $table) {
    $table->id();
    $table->string('page', 100)->unique();
    $table->string('title')->nullable();
    $table->text('description')->nullable();
    $table->string('keywords')->nullable();
    $table->string('og_image')->nullable();
    $table->string('canonical_url')->nullable();
    $table->boolean('indexed')->default(true);
    $table->timestamps();
});
```

**Model** (`app/Models/SeoSetting.php`):
- Fillable fields
- Boolean casting untuk `indexed`
- Helper methods: `getForPage()`, `getForHome()`

#### 3.2 Sitemap Generator

**Controller** (`app/Http/Controllers/SitemapController.php`):
- Generate sitemap.xml
- Read dari database (SeoSetting)
- Filter hanya indexed URLs

**Route** (routes/web.php):
```php
Route::get('sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index'])->name('sitemap');
```

**View** (resources/views/sitemap.blade.php):
- XML sitemap formatstandard

---

## 🔧 Cara Penggunaan

### 1. Setup Awal (Setelah Clone)

```bash
# Install dependencies
composer install

# Run migration untuk SEO table
php artisan migrate

# Jika butuh seeding untuk default SEO
php artisan db:seed --class=SeoSettingsSeeder
```

### 2. Mengelola SEO dari Database

Buat Seeder untuk default SEO settings:

```php
// database/seeders/SeoSettingsSeeder.php
SeoSetting::updateOrCreate(
    ['page' => 'home'],
    [
        'title' => 'ATK-Sync POS - Sistem Point of Sale Modern',
        'description' => 'Sistem POS lengkap untuk toko ATK...',
        'keywords' => 'pos, kasir, inventory, toko atk',
        'indexed' => true,
    ]
);
```

### 3. Testing SEO

```bash
# Test sitemap
curl http://localhost/sitemap.xml

# View page source untuk cek meta tags
# Chrome DevTools > Elements
```

### 4. Mengcek SEO di Browser

Buka Chrome DevTools > Network > klik page > lihat Response Headers:

```html
<!-- Contoh output welcome page -->
<title>ATK-Sync POS - Sistem Point of Sale Modern</title>
<meta name="description" content="ATK-Sync POS adalah sistem point of sale...">
<meta name="keywords" content="pos, point of sale, toko atk...">
<meta property="og:title" content="ATK-Sync POS - Sistem POS Modern">
<meta property="og:description" content="Sistem Point of Sale modern...">
<meta property="og:type" content="website">
<script type="application/ld+json">{"@context":"https://schema.org",...}</script>
```

---

## 📝 Catatan Penting

1. **OG Image**: Image di `public/og-image.svg` adalah placeholder. Ganti dengan image yang sesuai dengan brand.

2. **robots.txt**: Pastikan update URL domain di sitemap reference:
   ```txt
   Sitemap: https://atksync.example.com/sitemap.xml
   ```

3. **Shop Logo**: Welcome page akan menggunakan shop_logo dari database jika tersedia.

4. **Inertia Integration**: Config `seotools.php` sudah diset `inertia => true` untuk compatible dengan Inertia.

5. **Internal Pages**: Halaman internal (dashboard, products, transactions, dll) tidak perlu SEO meta karena sudah di-protect auth. Tapi masih bisa ditambahkan jika diperlukan.

---

## 🔜 Pengembangan Lanjutan

Jika ingin mengembangkan lebih lanjut:

1. **SEO Admin UI**: Buat halaman untuk manage SEO settings dari dashboard admin
2. **Dynamic OG Images**: Generate og-image per-product untuk dynamic sharing
3. **SEO Analytics**: Integrasi dengan Google Search Console
4. **Breadcrumb Schema**: Tambah breadcrumb JSON-LD untuk struktur navigasi
5. **Product Schema**: Untuk halaman produk jika diekspos ke publik

---

## ✅ Verifikasi

```bash
# Run tests
php artisan test

# Check routes
php artisan route:list --name=sitemap

# Clear cache
php artisan optimize:clear
```