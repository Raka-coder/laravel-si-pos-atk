import type { Product } from '@/types/models';

interface ProductImageCellProps {
    product: Product;
}

export function ProductImageCell({ product }: ProductImageCellProps) {
    return product.image ? (
        <img
            src={`/storage/${product.image}`}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
        />
    ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <span className="text-xs text-muted-foreground">No Image</span>
        </div>
    );
}
