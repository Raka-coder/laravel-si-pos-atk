<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductCodeGenerator
{
    private const PREFIX = 'PRD';

    private const PADDING = 6;

    /**
     * Generate the next unique product code.
     * Uses database lock to prevent race conditions.
     */
    public function generate(): string
    {
        return DB::transaction(function () {
            $lastProduct = Product::lockForUpdate()
                ->orderBy('id', 'desc')
                ->first();

            $nextNumber = $lastProduct
                ? $this->extractNumber($lastProduct->product_code) + 1
                : 1;

            return $this->formatCode($nextNumber);
        });
    }

    /**
     * Extract numeric part from product code.
     */
    private function extractNumber(string $code): int
    {
        return (int) substr($code, strlen(self::PREFIX));
    }

    /**
     * Format the product code with prefix and zero-padding.
     */
    private function formatCode(int $number): string
    {
        return self::PREFIX.str_pad((string) $number, self::PADDING, '0', STR_PAD_LEFT);
    }
}
