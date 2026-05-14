<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Services\ImageOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $perPage = 15;

        // Get categories and units (cached for performance)
        $categories = Category::orderBy('name')->get();
        $units = Unit::orderBy('name')->get();

        // Paginate products with search and eager loading
        $products = Product::with(['category', 'unit'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('product/index', [
            'products' => $products,
            'categories' => $categories,
            'units' => $units,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    private function uploadImage(UploadedFile $file): ?string
    {
        try {
            $isLocal = config('filesystems.disks.public.driver') === 'local';

            $tempDir = $isLocal ? storage_path('app/public/products') : storage_path('app/products_tmp');
            if (! is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $tempPath = $tempDir.'/'.uniqid().'.'.$file->extension();
            $file->move($tempDir, basename($tempPath));

            try {
                $optimizer = new ImageOptimizer;
                $optimizedPath = $optimizer->optimize($tempPath, 800, 800, 80);
                $optimizer->generateThumbnail($optimizedPath, 200);
            } catch (\Exception $e) {
                Log::warning('Image optimization failed: '.$e->getMessage());
                $optimizedPath = $tempPath;
            }

            $filename = basename($optimizedPath);
            $thumbFilename = str_replace('.webp', '_thumb.webp', $filename);
            $thumbPath = dirname($optimizedPath).'/'.$thumbFilename;

            if ($isLocal) {
                return str_replace('\\', '/', str_replace(storage_path('app/public/'), '', $optimizedPath));
            }

            $disk = Storage::disk('public');
            $s3Path = 'products/'.$filename;
            $s3ThumbPath = 'products/'.$thumbFilename;

            $disk->put($s3Path, fopen($optimizedPath, 'r'), ['visibility' => 'public']);
            if (file_exists($thumbPath)) {
                $disk->put($s3ThumbPath, fopen($thumbPath, 'r'), ['visibility' => 'public']);
            }

            unlink($optimizedPath);
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }
            if ($optimizedPath !== $tempPath && file_exists($tempPath)) {
                unlink($tempPath);
            }

            return $s3Path;
        } catch (\Exception $e) {
            Log::error('Image upload failed: '.$e->getMessage());

            return null;
        }
    }

    private function deleteImage(string $imagePath): void
    {
        try {
            $disk = Storage::disk('public');
            $thumbPath = str_replace('.webp', '_thumb.webp', $imagePath);

            $disk->delete($imagePath);
            $disk->delete($thumbPath);
        } catch (\Exception $e) {
            Log::error('Image delete failed: '.$e->getMessage());
        }
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $uploaded = $this->uploadImage($request->file('image'));
            if ($uploaded) {
                $validated['image'] = $uploaded;
            }
        }

        Product::create($validated);

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->boolean('remove_image') && $product->image) {
            $this->deleteImage($product->image);
            $validated['image'] = null;
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                $this->deleteImage($product->image);
            }

            $uploaded = $this->uploadImage($request->file('image'));
            if ($uploaded) {
                $validated['image'] = $uploaded;
            }
        }

        $product->update($validated);

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->image) {
            $this->deleteImage($product->image);
        }

        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    public function byBarcode(string $barcode): JsonResponse
    {
        $product = Product::where('barcode', $barcode)
            ->where('is_active', true)
            ->with(['category', 'unit'])
            ->first();

        if (! $product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }
}
