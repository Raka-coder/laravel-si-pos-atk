import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CreditCard,
    Package,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Stats {
    total_products?: number;
    total_categories?: number;
    total_units?: number;
    low_stock_products?: number;
    active_products?: number;
    today_sales: number;
    today_revenue: number;
    today_expenses?: number;
    month_expenses?: number;
}

interface Product {
    id: number;
    name: string;
    stock: number;
    min_stock: number;
    category: { name: string } | null;
    unit: { short_name: string } | null;
}

interface Props {
    [key: string]: unknown;
    stats: Stats;
    lowStockProducts?: Product[];
    isCashier?: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export default function Dashboard() {
    const {
        stats,
        lowStockProducts = [],
        isCashier = false,
    } = usePage<Props>().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">
                    {isCashier ? 'Cashier Dashboard' : 'Dashboard'}
                </h1>

                {isCashier ? (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Today's Sales
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.today_sales}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Transactions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Today's Revenue
                                </CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(stats.today_revenue)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total income
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    <Button asChild size="lg">
                                        <a href="/pos">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Open POS
                                        </a>
                                    </Button>
                                    <Button asChild variant="outline" size="lg">
                                        <a href="/transactions">
                                            <Wallet className="mr-2 h-4 w-4" />
                                            Transactions
                                        </a>
                                    </Button>
                                    <Button asChild variant="outline" size="lg">
                                        <a href="/reports/sales">Reports</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Sales
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.today_sales}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Transactions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Revenue
                                    </CardTitle>
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(stats.today_revenue)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Total income
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Expenses
                                    </CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(
                                            stats.today_expenses || 0,
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Total expenses
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className={
                                    (stats.low_stock_products || 0) > 0
                                        ? 'border-red-500'
                                        : ''
                                }
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Low Stock
                                    </CardTitle>
                                    <AlertTriangle
                                        className={`h-4 w-4 ${(stats.low_stock_products || 0) > 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className={`text-2xl font-bold ${(stats.low_stock_products || 0) > 0 ? 'text-red-500' : ''}`}
                                    >
                                        {stats.low_stock_products || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Below min stock
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Products
                                    </CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.total_products || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.active_products || 0} active
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {lowStockProducts.length > 0 && (
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
                                                    {lowStockProducts.map(
                                                        (product) => (
                                                            <tr
                                                                key={product.id}
                                                            >
                                                                <td className="px-3 py-2 text-sm">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-sm font-medium text-red-500">
                                                                    {
                                                                        product.stock
                                                                    }
                                                                </td>
                                                                <td className="px-3 py-2 text-right text-sm text-muted-foreground">
                                                                    {
                                                                        product.min_stock
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Button asChild size="lg">
                                            <a href="/pos">
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Open POS
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                        >
                                            <a href="/products">
                                                <Package className="mr-2 h-4 w-4" />
                                                Products
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                        >
                                            <a href="/stock-movements">
                                                Stock Movements
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                        >
                                            <a href="/transactions">
                                                <Wallet className="mr-2 h-4 w-4" />
                                                Transactions
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ] as BreadcrumbItem[],
};
