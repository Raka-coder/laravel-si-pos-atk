import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import type { Category, Product } from '@/types/models';

interface ProductGridProps {
    products: Product[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: number | null;
    setSelectedCategory: (id: number | null) => void;
    categories: (Category | undefined)[];
    handleAddToCart: (product: Product) => void;
}

export function ProductGrid({
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    handleAddToCart,
}: ProductGridProps) {
    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.barcode &&
                product.barcode
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()));
        const matchesCategory =
            selectedCategory === null ||
            product.category?.id === selectedCategory;

        return matchesSearch && matchesCategory && product.stock > 0;
    });

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search and Filters */}
            <div className="mb-4 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </Button>
                {categories.map((category) =>
                    category ? (
                        <Button
                            key={category.id}
                            variant={
                                selectedCategory === category.id
                                    ? 'default'
                                    : 'outline'
                            }
                            size="lg"
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                        </Button>
                    ) : null,
                )}
            </div>

            {/* Products */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {filteredProducts.map((product) => (
                        <Button
                            key={product.id}
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            variant="outline"
                            className="flex h-auto flex-col items-center justify-center rounded-lg border border-sidebar-border/70 bg-background p-3 transition-colors hover:bg-accent disabled:opacity-50"
                        >
                            <div className="mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                {product.image ? (
                                    <img
                                        src={`/storage/${product.image}`}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted-foreground/10">
                                        <span className="text-xs text-muted-foreground">
                                            No Img
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="w-full text-center">
                                <div className="truncate font-medium">
                                    {product.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {product.category?.name || 'No Category'}
                                </div>
                                <div className="mt-1 font-bold text-primary">
                                    {formatCurrency(product.sell_price)}
                                </div>
                                <div
                                    className={`text-xs ${product.stock < product.min_stock ? 'text-red-500' : 'text-muted-foreground'}`}
                                >
                                    Stok: {product.stock}{' '}
                                    {product.unit?.short_name}
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex h-40 items-center justify-center text-muted-foreground">
                        Tidak ada produk ditemukan
                    </div>
                )}
            </div>
        </div>
    );
}
