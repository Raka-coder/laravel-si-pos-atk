import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CreditCard,
    Package,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import CategoryRevenueChart from '@/components/charts/CategoryRevenueChart';
import MonthlyComparisonChart from '@/components/charts/MonthlyComparisonChart';
import PaymentMethodChart from '@/components/charts/PaymentMethodChart';
import RevenueChart from '@/components/charts/RevenueChart';
import TopProductsChart from '@/components/charts/TopProductsChart';
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
    month_revenue?: number;
    month_profit?: number;
}

interface Product {
    id: number;
    name: string;
    stock: number;
    min_stock: number;
    category: { name: string } | null;
    unit: { short_name: string } | null;
}

interface ChartData {
    daily_revenue: { date: string; revenue: number; transactions: number }[];
    payment_methods: { payment_method: string; count: number; total: number }[];
    top_products: {
        product_id: number;
        product_name: string;
        total_qty: number;
        total_revenue: number;
    }[];
    category_revenue: { category_name: string | null; revenue: number }[];
    monthly_revenue: {
        year: number;
        month: number;
        revenue: number;
        transactions: number;
    }[];
}

interface Props {
    [key: string]: unknown;
    stats: Stats;
    lowStockProducts?: Product[];
    isCashier?: boolean;
    chartData?: ChartData;
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
        chartData,
    } = usePage<Props>().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">
                    {isCashier ? 'Cashier Dashboard' : 'Owner Dashboard'}
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
                        {/* KPI Cards Row */}
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
                                        Total income today
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Monthly Revenue
                                    </CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(
                                            stats.month_revenue || 0,
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Monthly Profit
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className={`text-2xl font-bold ${
                                            (stats.month_profit || 0) >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {formatCurrency(
                                            stats.month_profit || 0,
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Revenue - Expenses
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Secondary KPI Row */}
                        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
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

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Monthly Expenses
                                    </CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(
                                            stats.month_expenses || 0,
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This month
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

                        {/* Charts Row 1 */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="p-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">
                                        Revenue Trend (30 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {chartData?.daily_revenue ? (
                                        <RevenueChart
                                            data={chartData.daily_revenue}
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                                            Loading...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="p-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">
                                        Payment Methods (30 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {chartData?.payment_methods ? (
                                        <PaymentMethodChart
                                            data={chartData.payment_methods}
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                                            Loading...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="p-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">
                                        Top Selling Products (30 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {chartData?.top_products ? (
                                        <TopProductsChart
                                            data={chartData.top_products}
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                                            Loading...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="p-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">
                                        Revenue by Category (30 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {chartData?.category_revenue ? (
                                        <CategoryRevenueChart
                                            data={chartData.category_revenue}
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                                            Loading...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Monthly Comparison */}
                        <Card className="p-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">
                                    Monthly Comparison (6 Months)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {chartData?.monthly_revenue ? (
                                    <MonthlyComparisonChart
                                        data={chartData.monthly_revenue}
                                    />
                                ) : (
                                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                                        Loading...
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Low Stock Alert & Quick Actions */}
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
