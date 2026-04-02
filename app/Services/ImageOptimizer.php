<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Drivers\Gd\Encoders\WebpEncoder;

class ImageOptimizer
{
    /**
     * Optimize and resize image
     * - Resize to max dimensions while maintaining aspect ratio
     * - Compress with specified quality
     * - Convert to webp format for better optimization
     *
     * @param string $imagePath Path to the uploaded image
     * @param int $maxWidth Maximum width (default: 800px)
     * @param int $maxHeight Maximum height (default: 800px)
     * @param int $quality JPEG/WEBP quality (default: 80)
     * @return string Path to the optimized image
     */
    public function optimize(
        string $imagePath,
        int $maxWidth = 800,
        int $maxHeight = 800,
        int $quality = 80
    ): string {
        try {
            // Create manager with GD driver
            $manager = new ImageManager(new Driver());

            // Load the image
            $image = $manager->decodePath($imagePath);

            // Resize if dimensions exceed max
            $image->scaleDown($maxWidth, $maxHeight);

            // Generate new filename with .webp extension
            $pathInfo = pathinfo($imagePath);
            $newPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '.webp';

            // Encode to webp format with compression and save
            $image->encodeUsingPath($newPath, $quality);

            // Delete original file
            if (file_exists($imagePath) && $imagePath !== $newPath) {
                unlink($imagePath);
            }

            return $newPath;
        } catch (\Exception $e) {
            Log::error('Image optimization failed: ' . $e->getMessage());

            // Return original path if optimization fails
            return $imagePath;
        }
    }

    /**
     * Generate thumbnail from image
     *
     * @param string $imagePath Path to the source image
     * @param int $size Thumbnail size (square)
     * @return string Path to the thumbnail
     */
    public function generateThumbnail(string $imagePath, int $size = 200): string
    {
        try {
            $manager = new ImageManager(new Driver());

            $image = $manager->decodePath($imagePath);

            // Resize and crop to square
            $image->cover($size, $size);

            // Generate thumbnail filename
            $pathInfo = pathinfo($imagePath);
            $thumbnailPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_thumb.webp';

            // Encode to webp and save
            $image->encodeUsingPath($thumbnailPath, 75);

            return $thumbnailPath;
        } catch (\Exception $e) {
            Log::error('Thumbnail generation failed: ' . $e->getMessage());

            return $imagePath;
        }
    }
}
