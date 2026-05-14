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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use League\Flysystem\Local\LocalFilesystemAdapter;

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

    private function uploadImage(UploadedFile $file): string
    {
        $disk = Storage::disk('public');
        $driver = $disk->getDriver()->getAdapter() instanceof LocalFilesystemAdapter
            ? 'local'
            : 's3';

        if ($driver === 's3') {
            $tempPath = $file->store('products', ['disk' => 'local']);
            $fullPath = storage_path('app/private/'.$tempPath);
        } else {
            $imagePath = $file->store('products', 'public');
            $fullPath = storage_path('app/public/'.$imagePath);
        }

        $optimizer = new ImageOptimizer;
        $optimizedPath = $optimizer->optimize($fullPath, 800, 800, 80);
        $optimizer->generateThumbnail($optimizedPath, 200);

        if ($driver === 's3') {
            $optimizedRelative = str_replace(storage_path('app/private/'), '', $optimizedPath);
            $thumbPath = str_replace('.webp', '_thumb.webp', $optimizedPath);

            $stream = fopen($optimizedPath, 'r');
            $disk->writeStream('products/'.basename($optimizedPath), $stream);
            fclose($stream);

            if (file_exists($thumbPath)) {
                $thumbStream = fopen($thumbPath, 'r');
                $disk->writeStream('products/'.basename($thumbPath), $thumbStream);
                fclose($thumbStream);
            }

            unlink($fullPath);
            unlink($optimizedPath);
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }

            return 'products/'.basename($optimizedPath);
        }

        return str_replace('\\', '/', str_replace(storage_path('app/public/'), '', $optimizedPath));
    }

    private function deleteImage(string $imagePath): void
    {
        $disk = Storage::disk('public');
        $thumbPath = str_replace('.webp', '_thumb.webp', $imagePath);

        $disk->delete($imagePath);
        $disk->delete($thumbPath);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $this->uploadImage($request->file('image'));
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

            $validated['image'] = $this->uploadImage($request->file('image'));
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
