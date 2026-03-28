import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, Box, Package, Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Stats {
    total_products: number;
    total_categories: number;
    total_units: number;
    low_stock_products: number;
    active_products: number;
}

interface Props {
    stats: Stats;
}

export default function Dashboard() {
    const { stats } = usePage<Props>().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Products
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_products}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_products} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Categories
                            </CardTitle>
                            <Tags className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_categories}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Product categories
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Units
                            </CardTitle>
                            <Box className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_units}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Measurement units
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className={
                            stats.low_stock_products > 0 ? 'border-red-500' : ''
                        }
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Low Stock
                            </CardTitle>
                            <AlertTriangle
                                className={`h-4 w-4 ${stats.low_stock_products > 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                            />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${stats.low_stock_products > 0 ? 'text-red-500' : ''}`}
                            >
                                {stats.low_stock_products}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Below min stock
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Products
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active_products}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Available for sale
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Quick Actions
                    </h2>
                    <div className="flex gap-4">
                        <a
                            href="/products"
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <Package className="mr-2 h-4 w-4" />
                            Manage Products
                        </a>
                        <a
                            href="/categories"
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <Tags className="mr-2 h-4 w-4" />
                            Manage Categories
                        </a>
                        <a
                            href="/units"
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            <Box className="mr-2 h-4 w-4" />
                            Manage Units
                        </a>
                    </div>
                </div>
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
    ],
} satisfies BreadcrumbItem[];
