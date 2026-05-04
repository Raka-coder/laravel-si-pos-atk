import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/types';

interface LowStockAlertProps {
    products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
    if (products.length === 0) {
return null;
}

    return (
        <Card className="border-red-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Low Stock Alert
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium">
                                    Product
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium">
                                    Stock
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium">
                                    Min
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-3 py-2 text-sm">
                                        {product.name}
                                    </td>
                                    <td className="px-3 py-2 text-right text-sm font-medium text-red-500">
                                        {product.stock}
                                    </td>
                                    <td className="px-3 py-2 text-right text-sm text-muted-foreground">
                                        {product.min_stock}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
