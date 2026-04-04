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

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $fullPath = storage_path('app/public/'.$imagePath);

            // Optimize image
            $optimizer = new ImageOptimizer;
            $optimizedPath = $optimizer->optimize($fullPath, 800, 800, 80);

            // Generate thumbnail
            $optimizer->generateThumbnail($optimizedPath, 200);

            // Update image path to webp (relative to storage/app/public)
            $relativePath = str_replace('\\', '/', str_replace(storage_path('app/public/'), '', $optimizedPath));
            $validated['image'] = $relativePath;
        }

        Product::create($validated);

        return back();
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        // Handle remove image
        if ($request->boolean('remove_image') && $product->image) {
            $oldPath = storage_path('app/public/'.$product->image);
            $thumbPath = str_replace('.webp', '_thumb.webp', $oldPath);

            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }

            Storage::disk('public')->delete($product->image);
            $validated['image'] = null;
        }

        // Handle new image upload
        if ($request->hasFile('image')) {
            // Delete old image and thumbnail
            if ($product->image) {
                $oldPath = storage_path('app/public/'.$product->image);
                $thumbPath = str_replace('.webp', '_thumb.webp', $oldPath);

                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
                if (file_exists($thumbPath)) {
                    unlink($thumbPath);
                }

                Storage::disk('public')->delete($product->image);
            }

            // Upload and optimize new image
            $imagePath = $request->file('image')->store('products', 'public');
            $fullPath = storage_path('app/public/'.$imagePath);

            $optimizer = new ImageOptimizer;
            $optimizedPath = $optimizer->optimize($fullPath, 800, 800, 80);
            $optimizer->generateThumbnail($optimizedPath, 200);

            $relativePath = str_replace('\\', '/', str_replace(storage_path('app/public/'), '', $optimizedPath));
            $validated['image'] = $relativePath;
        }

        $product->update($validated);

        return back();
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->image) {
            $oldPath = storage_path('app/public/'.$product->image);
            $thumbPath = str_replace('.webp', '_thumb.webp', $oldPath);

            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }

            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return back();
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
