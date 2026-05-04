import { Head, usePage } from '@inertiajs/react';
import { CreditCard, TrendingUp, Wallet } from 'lucide-react';
import CategoryRevenueChart from '@/components/charts/CategoryRevenueChart';
import HourlySalesChart from '@/components/charts/HourlySalesChart';
import MonthlyComparisonChart from '@/components/charts/MonthlyComparisonChart';
import PaymentMethodChart from '@/components/charts/PaymentMethodChart';
import RevenueChart from '@/components/charts/RevenueChart';
import TopProductsChart from '@/components/charts/TopProductsChart';
import { ChartCard, ChartEmptyState } from '@/components/dashboard/chart-card';
import { LowStockAlert } from '@/components/dashboard/low-stock-alert';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/formatters';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Product } from '@/types';

interface Stats {
    today_sales: number;
    today_revenue: number;
    avg_transaction: number;
    peak_hour?: number;
    month_revenue?: number;
    month_profit?: number;
    today_expenses?: number;
    month_expenses?: number;
    low_stock_products?: number;
    total_products?: number;
    active_products?: number;
}

interface ChartData {
    daily_revenue?: { date: string; revenue: number | string; transactions: number | string }[];
    payment_methods?: { payment_method: string; count: number; total: number }[];
    top_products?: { product_id: number; product_name: string; total_qty: number; total_revenue: number; image_url?: string }[];
    category_revenue?: { category_name: string | null; revenue: number | string }[];
    monthly_revenue?: { year: number; month: number; revenue: number | string; transactions: number | string }[];
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

                {isCashier ? <CashierDashboard
                    stats={stats}
                    lowStockProducts={lowStockProducts}
                    hourlyRevenue={hourlyRevenue}
                    todayPaymentMethods={todayPaymentMethods}
                    todayTopProducts={todayTopProducts}
                    peakHour={peakHour}
                /> : <OwnerDashboard
                    stats={stats}
                    lowStockProducts={lowStockProducts}
                    chartData={chartData}
                />}
            </div>
        </>
    );
}

function CashierDashboard({
    stats,
    lowStockProducts,
    hourlyRevenue,
    todayPaymentMethods,
    todayTopProducts,
    peakHour,
}: {
    stats: Stats;
    lowStockProducts: Product[];
    hourlyRevenue: HourlyData[];
    todayPaymentMethods: TodayPaymentMethod[];
    todayTopProducts: TodayTopProduct[];
    peakHour?: number;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Today's Sales" value={stats.today_sales} description="Transactions" icon={TrendingUp} color="blue" />
                <StatCard title="Today's Revenue" value={formatCurrency(stats.today_revenue)} description="Total income" icon={Wallet} color="emerald" />
                <StatCard title="Avg. Transaction" value={formatCurrency(stats.avg_transaction || 0)} description="Per transaction" icon={CreditCard} color="indigo" />
                <StatCard title="Peak Hour" value={peakHour !== undefined ? `${String(peakHour).padStart(2, '0')}:00` : '-'} description="Busiest hour" icon={TrendingUp} color="amber" />
            </div>

            <ChartCard title="Hourly Sales Today">
                {hourlyRevenue.length > 0 ? <HourlySalesChart data={hourlyRevenue} /> : <ChartEmptyState />}
            </ChartCard>

            <div className="grid gap-4 md:grid-cols-2">
                <ChartCard title="Payment Methods Today">
                    {todayPaymentMethods.length > 0 ? <PaymentMethodChart data={todayPaymentMethods} /> : <ChartEmptyState />}
                </ChartCard>
                <ChartCard title="Top Products Today">
                    {todayTopProducts.length > 0 ? <TopProductsChart data={todayTopProducts.map((p) => ({ product_id: p.product_id, product_name: p.product_name, total_qty: p.total_qty, total_revenue: p.total_revenue }))} /> : <ChartEmptyState />}
                </ChartCard>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {lowStockProducts.length > 0 && <LowStockAlert products={lowStockProducts} />}
                <QuickActions />
            </div>
        </div>
    );
}

function OwnerDashboard({ stats, lowStockProducts, chartData }: { stats: Stats; lowStockProducts: Product[]; chartData?: ChartData }) {
    return (
        <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Today's Sales" value={stats.today_sales} description="Transactions" icon={TrendingUp} color="blue" />
                <StatCard title="Today's Revenue" value={formatCurrency(stats.today_revenue)} description="Total income today" icon={Wallet} color="emerald" />
                <StatCard title="Monthly Revenue" value={formatCurrency(stats.month_revenue || 0)} description="This month" icon={CreditCard} color="indigo" />
                <StatCard
                    title="Monthly Profit"
                    value={formatCurrency(stats.month_profit || 0)}
                    description="Revenue - Expenses"
                    icon={TrendingUp}
                    color="rose"
                    valueClassName={(stats.month_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}
                />
            </div>

            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                <StatCard title="Today's Expenses" value={formatCurrency(stats.today_expenses || 0)} description="Total expenses" icon={CreditCard} color="red" />
                <StatCard title="Monthly Expenses" value={formatCurrency(stats.month_expenses || 0)} description="This month" icon={CreditCard} color="red" />
                <StatCard
                    title="Low Stock"
                    value={stats.low_stock_products || 0}
                    description="Below min stock"
                    icon={TrendingUp}
                    color={(stats.low_stock_products || 0) > 0 ? 'orange' : 'zinc'}
                    valueClassName={(stats.low_stock_products || 0) > 0 ? 'text-orange-600 dark:text-orange-400' : ''}
                />
                <StatCard title="Total Products" value={stats.total_products || 0} description={`${stats.active_products || 0} active`} icon={TrendingUp} color="teal" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <ChartCard title="Revenue Trend (30 Days)">
                    {chartData?.daily_revenue ? <RevenueChart data={chartData.daily_revenue} /> : <ChartEmptyState message="Loading..." />}
                </ChartCard>
                <ChartCard title="Payment Methods (30 Days)">
                    {chartData?.payment_methods ? <PaymentMethodChart data={chartData.payment_methods} /> : <ChartEmptyState message="Loading..." />}
                </ChartCard>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <ChartCard title="Top Selling Products (30 Days)">
                    {chartData?.top_products ? <TopProductsChart data={chartData.top_products} /> : <ChartEmptyState message="Loading..." />}
                </ChartCard>
                <ChartCard title="Revenue by Category (30 Days)">
                    {chartData?.category_revenue ? <CategoryRevenueChart data={chartData.category_revenue} /> : <ChartEmptyState message="Loading..." />}
                </ChartCard>
            </div>

            <ChartCard title="Monthly Comparison (6 Months)">
                {chartData?.monthly_revenue ? <MonthlyComparisonChart data={chartData.monthly_revenue} /> : <ChartEmptyState message="Loading..." />}
            </ChartCard>

            <div className="grid gap-4 md:grid-cols-2">
                {lowStockProducts.length > 0 && <LowStockAlert products={lowStockProducts} />}
                <QuickActions showProducts showUsers showStockMovements />
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