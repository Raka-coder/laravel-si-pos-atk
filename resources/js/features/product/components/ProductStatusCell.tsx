import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/models';

interface ProductStatusCellProps {
    product: Product;
}

export function ProductStatusCell({ product }: ProductStatusCellProps) {
    return (
        <Badge
            variant={product.is_active ? 'default' : 'secondary'}
            className="capitalize"
        >
            {product.is_active ? 'Active' : 'Inactive'}
        </Badge>
    );
}
