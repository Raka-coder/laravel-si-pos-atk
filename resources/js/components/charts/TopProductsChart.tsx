import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    formatCurrency,
    shortProductName,
} from '@/components/charts/chart-utils';
import ChartEmptyState from '@/components/charts/ChartEmptyState';

interface TopProductData {
    product_id: number;
    product_name: string;
    total_qty: number | string;
    total_revenue: number | string;
}

interface Props {
    data: TopProductData[];
}

interface ChartDataPoint {
    name: string;
    quantity: number;
    revenue: number;
}

function CustomTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const { name, quantity, revenue } = payload[0].payload;

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-200">{name}</p>
            <p className="text-sm text-slate-300">Sold: {quantity} units</p>
            <p className="text-sm text-slate-300">
                Revenue: {formatCurrency(revenue)}
            </p>
        </div>
    );
}

function getTickFill() {
    return document.documentElement.classList.contains('dark')
        ? '#e2e8f0'
        : '#64748b';
}

function getYAxisTickFill() {
    return document.documentElement.classList.contains('dark')
        ? '#d1d5db'
        : '#475569';
}

export default function TopProductsChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <ChartEmptyState message="No product data available" />;
    }

    const chartData: ChartDataPoint[] = data.slice(0, 10).map((item) => ({
        name: shortProductName(item.product_name),
        quantity: Number(item.total_qty),
        revenue: Number(item.total_revenue),
    }));

    const tickFill = getTickFill();
    const yAxisTickFill = getYAxisTickFill();

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 60, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    type="number"
                    tick={{ fill: tickFill, fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: yAxisTickFill, fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="quantity"
                    fill="oklch(79.2% 0.209 151.711)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
