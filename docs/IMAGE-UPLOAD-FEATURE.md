# Image Upload Feature - Technical Guide

## Overview

Product image upload dengan automatic optimization untuk performa dan storage efficiency.

---

## Features

| Feature | Specification |
|---------|--------------|
| **Max File Size** | 2MB |
| **Supported Formats** | JPG, JPEG, PNG, GIF, WEBP |
| **Max Dimensions** | 1920x1920px |
| **Output Format** | WebP (lossless compression) |
| **Optimized Size** | 800x800px max (maintain aspect ratio) |
| **Compression Quality** | 80% for main image, 75% for thumbnail |
| **Thumbnail Size** | 200x200px (square crop) |

---

## Architecture

### Backend Components

#### 1. ImageOptimizer Service

**File:** `app/Services/ImageOptimizer.php`

```php
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageOptimizer
{
    public function optimize(string $imagePath, int $maxWidth = 800, int $maxHeight = 800, int $quality = 80): string
    {
        $manager = new ImageManager(new Driver());
        $image = $manager->decodePath($imagePath);
        $image->scaleDown($maxWidth, $maxHeight);
        $image->encodeUsingPath($newPath, $quality); // Saves as WebP
        return $newPath;
    }

    public function generateThumbnail(string $imagePath, int $size = 200): string
    {
        $manager = new ImageManager(new Driver());
        $image = $manager->decodePath($imagePath);
        $image->cover($size, $size); // Square crop
        $image->encodeUsingPath($thumbnailPath, 75);
        return $thumbnailPath;
    }
}
```

**Methods:**
- `optimize()` - Resize & compress main image
- `generateThumbnail()` - Create 200x200px thumbnail

#### 2. ProductController

**File:** `app/Http/Controllers/Product/ProductController.php`

**Store Method:**
```php
if ($request->hasFile('image')) {
    $imagePath = $request->file('image')->store('products', 'public');
    $fullPath = storage_path('app/public/' . $imagePath);

    $optimizer = new ImageOptimizer();
    $optimizedPath = $optimizer->optimize($fullPath, 800, 800, 80);
    $optimizer->generateThumbnail($optimizedPath, 200);

    $relativePath = str_replace('\\', '/', str_replace(storage_path('app/public/'), '', $optimizedPath));
    $validated['image'] = $relativePath;
}
```

**Update Method:**
- Delete old image + thumbnail
- Upload and optimize new image
- Same process as store

**Destroy Method:**
```php
if ($product->image) {
    $oldPath = storage_path('app/public/' . $product->image);
    $thumbPath = str_replace('.webp', '_thumb.webp', $oldPath);

    if (file_exists($oldPath)) unlink($oldPath);
    if (file_exists($thumbPath)) unlink($thumbPath);

    Storage::disk('public')->delete($product->image);
}
```

#### 3. Form Requests

**Files:** 
- `app/Http/Requests/Product/StoreProductRequest.php`
- `app/Http/Requests/Product/UpdateProductRequest.php`

**Validation Rules:**
```php
'image' => [
    'nullable',
    'image',
    'mimes:jpg,jpeg,png,gif,webp',
    'max:2048', // 2MB
    'dimensions:max_width=1920,max_height=1920',
],
```

**Custom Messages:**
```php
'image.max' => 'Ukuran gambar tidak boleh lebih dari 2MB.',
'image.dimensions' => 'Dimensi gambar terlalu besar. Maksimal 1920x1920 pixel.',
'image.mimes' => 'Format gambar harus jpg, jpeg, png, gif, atau webp.',
```

---

### Frontend Components

#### 1. Product Index Page

**File:** `resources/js/pages/product/index.tsx`

**State Management:**
```typescript
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

const createForm = useForm({
    // ... other fields
    image: null as File | null,
});
```

**Image Upload Handler (Create):**
```typescript
<Input
    type="file"
    accept="image/*"
    onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran gambar tidak boleh lebih dari 2MB');
                e.target.value = '';
                return;
            }
            createForm.setData('image', file);
            
            // Preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }}
/>
```

**Preview Display:**
```tsx
{imagePreview && (
    <div className="mt-2">
        <img
            src={imagePreview}
            alt="Preview"
            className="h-32 w-32 rounded-lg object-cover"
        />
    </div>
)}
```

**FormData Submission:**
```typescript
const handleCreate = () => {
    const formData = new FormData();
    // ... append other fields
    if (createForm.data.image) {
        formData.append('image', createForm.data.image);
    }

    createForm.post('/products', {
        forceFormData: true,
        onSuccess: () => {
            createForm.reset();
            setImagePreview(null);
            setIsOpen(false);
        },
    });
};
```

**Edit Modal:**
- Same upload logic
- Shows existing image preview
- Allows replacement

#### 2. Product Table Display

```tsx
<td className="px-4 py-3">
    {product.image ? (
        <img
            src={`/storage/${product.image}`}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
        />
    ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <span className="text-xs text-muted-foreground">No Image</span>
        </div>
    )}
</td>
```

#### 3. POS Page

**File:** `resources/js/pages/pos/index.tsx`

**Product Grid with Images:**
```tsx
<div className="mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
    {product.image ? (
        <img
            src={`/storage/${product.image}`}
            alt={product.name}
            className="h-full w-full object-cover"
        />
    ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted-foreground/10">
            <span className="text-xs text-muted-foreground">No Img</span>
        </div>
    )}
</div>
```

---

## File Structure

### Storage Paths

```
storage/app/public/products/
├── abc123.webp              # Optimized main image (800x800 max)
└── abc123_thumb.webp        # Thumbnail (200x200)
```

### Public Access

After running `php artisan storage:link`:

```
public/storage/products/
├── abc123.webp
└── abc123_thumb.webp
```

**URL Access:**
```
http://localhost:8000/storage/products/abc123.webp
http://localhost:8000/storage/products/abc123_thumb.webp
```

---

## Database Schema

### Products Table

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    buy_price DECIMAL(12,2),
    sell_price DECIMAL(12,2),
    stock INT,
    min_stock INT,
    image VARCHAR(255) NULL,  -- Stores path relative to storage/app/public
    is_active BOOLEAN DEFAULT TRUE,
    category_id BIGINT NULL,
    unit_id BIGINT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Example Value:**
```
image = "products/abc123.webp"
```

---

## Setup Instructions

### 1. Install Intervention Image

```bash
composer require intervention/image
```

**Version:** v4.0.0+ (Laravel 13 compatible)

### 2. Create Storage Link

```bash
php artisan storage:link
```

This creates symlink: `public/storage` → `storage/app/public`

### 3. Verify Permissions

```bash
chmod -R 775 storage/
chown -R www-data:www-data storage/
```

### 4. Test Upload

1. Go to `/products`
2. Click "Add Product"
3. Fill in required fields
4. Upload image (max 2MB)
5. Preview appears
6. Click Create
7. Check `storage/app/public/products/` for optimized files

---

## Optimization Flow

```
User Upload (JPG/PNG)
    ↓
Validate (size, type, dimensions)
    ↓
Store Temporary (products/original.jpg)
    ↓
ImageOptimizer::optimize()
    ├─ Resize to 800x800 max
    ├─ Compress to WebP (80%)
    └─ Save as products/optimized.webp
    ↓
ImageOptimizer::generateThumbnail()
    ├─ Crop to 200x200 square
    ├─ Compress to WebP (75%)
    └─ Save as products/optimized_thumb.webp
    ↓
Delete Original
    ↓
Store Path in Database
```

---

## Performance Benefits

### Before Optimization

| Format | Size | Dimensions |
|--------|------|------------|
| Original JPG | 2.5MB | 4000x3000px |

### After Optimization

| File | Size | Dimensions | Savings |
|------|------|------------|---------|
| Main WebP | 180KB | 800x600px | 93% smaller |
| Thumbnail WebP | 12KB | 200x200px | 99.5% smaller |

**Benefits:**
- Faster page load (especially POS grid)
- Lower storage usage
- Better caching
- Consistent dimensions

---

## Troubleshooting

### Error: "Call to undefined method Intervention\Image\ImageManager::read()"

**Cause:** Using Intervention Image v4 API with v3 code

**Solution:** Use `decodePath()` instead of `read()`:
```php
// ❌ Old API (v3)
$image = $manager->read($imagePath);

// ✅ New API (v4)
$image = $manager->decodePath($imagePath);
```

### Error: "Call to undefined method Intervention\Image\Image::toWebp()"

**Cause:** API change in v4

**Solution:** Use `encodeUsingPath()`:
```php
// ❌ Old API
$image->toWebp($quality)->save($path);

// ✅ New API
$image->encodeUsingPath($path, $quality);
```

### Images Not Showing

**Check:**
1. Storage link exists: `ls -la public/storage`
2. File permissions: `ls -la storage/app/public/products/`
3. Path in database: `SELECT image FROM products LIMIT 1;`
4. URL format: `/storage/products/filename.webp`

### Upload Fails Silently

**Check:**
1. `php.ini` - `upload_max_filesize` and `post_max_size`
2. Laravel validation error messages
3. Browser console for JavaScript errors
4. Network tab for 422 errors

---

## Best Practices

### Image Upload

1. **Always validate client-side** (size, type)
2. **Show preview** before upload
3. **Display progress** for large files
4. **Handle errors gracefully** with user-friendly messages

### Image Storage

1. **Use relative paths** in database
2. **Delete old files** on update/delete
3. **Generate thumbnails** for grid views
4. **Use CDN** for production

### Security

1. **Validate MIME type** (not just extension)
2. **Limit file size** (2MB max)
3. **Sanitize filenames** (use UUID/hash)
4. **Store outside webroot** (use storage link)

---

## Future Enhancements

- [ ] Image cropping tool before upload
- [ ] Multiple images per product (gallery)
- [ ] Lazy loading for product grids
- [ ] CDN integration (Cloudflare, AWS CloudFront)
- [ ] Image compression quality settings per user
- [ ] Watermark overlay for branding
- [ ] EXIF data preservation (orientation, GPS)

---

## Related Documentation

- [FASE1-WALKTHROUGH.md](./FASE1-WALKTHROUGH.md) - Product Management
- [FASE2-WALKTHROUGH.md](./FASE2-WALKTHROUGH.md) - POS Interface
- [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md) - Development Standards
