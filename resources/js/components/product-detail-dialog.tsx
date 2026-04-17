import {
    Box,
    Calendar,
    CircleDollarSign,
    Clock,
    Hash,
    History,
    Layers3,
    PackageSearch,
    Scale,
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Category {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    short_name: string;
}

interface Product {
    id: number;
    product_code: string;
    barcode: string | null;
    name: string;
    buy_price: number;
    sell_price: number;
    stock: number;
    min_stock: number;
    image: string | null;
    is_active: boolean;
    category_id: number | null;
    unit_id: number | null;
    category: Category | null;
    unit: Unit | null;
    created_at: string;
    updated_at: string;
}

interface ProductDetailDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export function ProductDetailDialog({
    product,
    open,
    onOpenChange,
}: ProductDetailDialogProps) {
    if (!product) {
        return null;
    }

    const isLowStock = product.stock <= product.min_stock;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border shadow-xl sm:rounded-xl bg-background selection:bg-primary selection:text-primary-foreground">
                <ScrollArea className="max-h-[80vh]">
                    <div className="flex flex-col sm:flex-row">
                        {/* 1. Visual Section - Minimal & Small */}
                        <aside className="sm:w-45 bg-muted/20 border-b sm:border-b-0 sm:border-r border-border/50 flex flex-col items-center justify-start p-6 gap-4">
                            <div className="relative group w-30 aspect-square rounded-xl overflow-hidden shadow-sm border border-border/60 bg-background">
                                {product.image ? (
                                    <img
                                        src={`/storage/${product.image}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <PackageSearch className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                <Badge
                                    variant={product.is_active ? 'default' : 'secondary'}
                                    className="h-5 justify-center rounded-md text-[10px] font-bold uppercase tracking-tight"
                                >
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                {isLowStock && (
                                    <Badge
                                        variant="destructive"
                                        className="h-5 justify-center rounded-md text-[9px] font-bold uppercase tracking-tight"
                                    >
                                        Low Stock
                                    </Badge>
                                )}
                            </div>
                        </aside>

                        {/* 2. Content Section - Tight Spacing */}
                        <main className="flex-1 p-6 flex flex-col">
                            <DialogHeader className="mb-5 text-left space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                                    <Layers3 className="h-3 w-3" />
                                    {product.category?.name || 'Uncategorized'}
                                </div>
                                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                                    {product.name}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 pt-0.5">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-[12px] font-mono text-muted-foreground border border-border/40">
                                        <Hash className="h-2.5 w-2.5" /> {product.product_code}
                                    </span>
                                </DialogDescription>
                            </DialogHeader>

                            {/* Info Matrix */}
                            <section className="grid grid-cols-2 gap-x-8 gap-y-5 mb-2">
                                <div className="space-y-0.5">
                                    <h4 className="text-[12px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                                        <CircleDollarSign className="h-3 w-3" /> Selling Price
                                    </h4>
                                    <p className="text-2xl font-bold text-foreground tabular-nums">
                                        {formatCurrency(product.sell_price)}
                                    </p>
                                    <p className="text-[12px] text-emerald-600 font-medium">
                                        Margin: {Math.round(((product.sell_price - product.buy_price) / (product.buy_price || 1)) * 100)}%
                                    </p>
                                </div>

                                <div className="space-y-0.5">
                                    <h4 className="text-[12px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                                        <Box className="h-3 w-3" /> Current Stock
                                    </h4>
                                    <div className="flex items-baseline gap-1">
                                        <p className={`text-2xl font-bold tabular-nums ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                                            {product.stock}
                                        </p>
                                        <span className="text-[12px] font-medium text-muted-foreground">
                                            {product.unit?.short_name || 'Units'}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-muted-foreground">Threshold: {product.min_stock}</p>
                                </div>
                            </section>

                            <Separator className="my-5 opacity-50" />

                            {/* Details - Text Only */}
                            <footer className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <h5 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Scale className="h-2.5 w-2.5" /> Measurement
                                    </h5>
                                    <p className="text-[12px] font-semibold text-foreground/80">
                                        {product.unit?.name || '-'} ({product.unit?.short_name || '-'})
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <h5 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <History className="h-2.5 w-2.5" /> Lifecycle Info
                                    </h5>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                                            <Calendar className="h-2.5 w-2.5 opacity-40" />
                                            <span>Added:</span>
                                            <span className="text-foreground/70">{formatDate(product.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                                            <Clock className="h-2.5 w-2.5 opacity-40" />
                                            <span>Updated:</span>
                                            <span className="text-foreground/70">{formatDate(product.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        </main>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
