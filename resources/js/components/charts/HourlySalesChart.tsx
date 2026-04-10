import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCurrency } from '@/components/charts/chart-utils';
import ChartEmptyState from '@/components/charts/ChartEmptyState';

interface HourlyRevenueData {
    hour: string;
    revenue: number;
}

interface Props {
    data: HourlyRevenueData[];
}

interface ChartDataPoint {
    hour: string;
    revenue: number;
}

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: string;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const revenue = payload[0].value;

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-200">
                Jam {label}
            </p>
            <p className="text-sm text-slate-300">
                Revenue: {formatCurrency(revenue as number)}
            </p>
        </div>
    );
}

function formatHour(hour: string): string {
    return hour;
}

export default function HourlySalesChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <ChartEmptyState message="No sales data available" />;
    }

    const chartData: ChartDataPoint[] = data.map((item) => ({
        hour: formatHour(item.hour),
        revenue: item.revenue,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                    dataKey="hour"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    interval={2}
                    dy={10}
                />
                <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="revenue"
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
