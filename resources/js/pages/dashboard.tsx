import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Clock,
    CreditCard,
    RefreshCw,
    Package,
    TrendingUp,
    Wallet,
    Users,
} from 'lucide-react';
import CategoryRevenueChart from '@/components/charts/CategoryRevenueChart';
import HourlySalesChart from '@/components/charts/HourlySalesChart';
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
    avg_transaction?: number;
    peak_hour?: number;
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

interface HourlyData {
    hour: string;
    revenue: number;
}

interface TodayPaymentMethod {
    payment_method: string;
    count: number;
    total: number;
}

interface TodayTopProduct {
    product_id: number;
    product_name: string;
    total_qty: number;
    total_revenue: number;
}

interface Props {
    [key: string]: unknown;
    stats: Stats;
    lowStockProducts?: Product[];
    isCashier?: boolean;
    chartData?: ChartData;
    hourlyRevenue?: HourlyData[];
    todayPaymentMethods?: TodayPaymentMethod[];
    todayTopProducts?: TodayTopProduct[];
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
        hourlyRevenue = [],
        todayPaymentMethods = [],
        todayTopProducts = [],
    } = usePage<Props>().props;

    const peakHour = stats.peak_hour as number | undefined;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">
                    {isCashier ? 'Cashier Dashboard' : 'Owner Dashboard'}
                </h1>

                {isCashier ? (
                    <div className="flex flex-col gap-4">
                        {/* KPI Cards */}
                        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="overflow-hidden border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Sales
                                    </CardTitle>
                                    <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/50">
                                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {stats.today_sales}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Transactions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Revenue
                                    </CardTitle>
                                    <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-900/50">
                                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                        {formatCurrency(stats.today_revenue)}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total income
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Avg. Transaction
                                    </CardTitle>
                                    <div className="rounded-full bg-indigo-100 p-1.5 dark:bg-indigo-900/50">
                                        <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                        {formatCurrency(
                                            stats.avg_transaction || 0,
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Per transaction
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Peak Hour
                                    </CardTitle>
                                    <div className="rounded-full bg-amber-100 p-1.5 dark:bg-amber-900/50">
                                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                        {peakHour !== undefined
                                            ? `${String(peakHour).padStart(2, '0')}:00`
                                            : '-'}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Busiest hour
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Hourly Sales Chart */}
                        <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">
                                    Hourly Sales Today
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hourlyRevenue.length > 0 ? (
                                    <HourlySalesChart data={hourlyRevenue} />
                                ) : (
                                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                                        No data
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Charts Row */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">
                                        Payment Methods Today
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {todayPaymentMethods.length > 0 ? (
                                        <PaymentMethodChart
                                            data={todayPaymentMethods}
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                                            No data
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">
                                        Top Products Today
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {todayTopProducts.length > 0 ? (
                                        <TopProductsChart
                                            data={todayTopProducts.map((p) => ({
                                                product_id: p.product_id,
                                                product_name: p.product_name,
                                                total_qty: p.total_qty,
                                                total_revenue: p.total_revenue,
                                            }))}
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                                            No data
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

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
                                            <a href="/transactions">
                                                <Wallet className="mr-2 h-4 w-4" />
                                                Transactions
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards Row */}
                        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="overflow-hidden border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Sales
                                    </CardTitle>
                                    <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/50">
                                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {stats.today_sales}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Transactions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Revenue
                                    </CardTitle>
                                    <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-900/50">
                                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                        {formatCurrency(stats.today_revenue)}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total income today
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Monthly Revenue
                                    </CardTitle>
                                    <div className="rounded-full bg-indigo-100 p-1.5 dark:bg-indigo-900/50">
                                        <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                        {formatCurrency(
                                            stats.month_revenue || 0,
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        This month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Monthly Profit
                                    </CardTitle>
                                    <div className="rounded-full bg-rose-100 p-1.5 dark:bg-rose-900/50">
                                        <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                    </div>
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
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Revenue - Expenses
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Secondary KPI Row */}
                        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                            <Card className="overflow-hidden border-l-4 border-l-red-400 bg-red-50/20 dark:bg-red-950/5">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Today's Expenses
                                    </CardTitle>
                                    <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/50">
                                        <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(
                                            stats.today_expenses || 0,
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Total expenses
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Monthly Expenses
                                    </CardTitle>
                                    <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/50">
                                        <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatCurrency(
                                            stats.month_expenses || 0,
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        This month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className={`overflow-hidden border-l-4 ${
                                    (stats.low_stock_products || 0) > 0
                                        ? 'border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/10'
                                        : 'border-l-zinc-300 bg-zinc-50/30 dark:bg-zinc-950/10'
                                }`}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Low Stock
                                    </CardTitle>
                                    <div
                                        className={`rounded-full p-1.5 ${(stats.low_stock_products || 0) > 0 ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-zinc-100 dark:bg-zinc-900/50'}`}
                                    >
                                        <AlertTriangle
                                            className={`h-4 w-4 ${(stats.low_stock_products || 0) > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className={`text-2xl font-bold ${(stats.low_stock_products || 0) > 0 ? 'text-orange-600 dark:text-orange-400' : ''}`}
                                    >
                                        {stats.low_stock_products || 0}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Below min stock
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="overflow-hidden border-l-4 border-l-teal-500 bg-teal-50/30 dark:bg-teal-950/10">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Products
                                    </CardTitle>
                                    <div className="rounded-full bg-teal-100 p-1.5 dark:bg-teal-900/50">
                                        <Package className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                                        {stats.total_products || 0}
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {stats.active_products || 0} active
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
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

                            <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
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
                            <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
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

                            <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
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
                        <Card className="bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20">
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
                                                <RefreshCw className="mr-2 h-4 w-4" />
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
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="lg"
                                            >
                                                <a href="/users">
                                                    <Users className="mr-2 h-4 w-4" />
                                                    Manage Users
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
