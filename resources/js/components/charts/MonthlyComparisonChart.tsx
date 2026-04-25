import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCompactNumber } from '@/components/charts/chart-utils';
import ChartEmptyState from '@/components/charts/ChartEmptyState';

interface MonthlyRevenueData {
    year: number;
    month: number;
    revenue: number | string;
    transactions: number | string;
}

interface Props {
    data: MonthlyRevenueData[];
}

const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

interface ChartDataPoint {
    period: string;
    revenue: number;
    transactions: number;
}

interface TooltipPayloadItem {
    value: number;
    dataKey: string;
    payload: ChartDataPoint;
}

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<TooltipPayloadItem>;
    label?: string;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const revenue = payload[0].value;
    const transactions = payload[0].payload.transactions;

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-200">
                {label as string}
            </p>
            <p className="text-sm text-slate-300">
                Revenue: {formatCompactNumber(revenue as number)}
            </p>
            <p className="text-sm text-slate-300">
                Transactions: {transactions}
            </p>
        </div>
    );
}

function getTickFill() {
    return document.documentElement.classList.contains('dark')
        ? '#e2e8f0'
        : '#64748b';
}

export default function MonthlyComparisonChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <ChartEmptyState message="No monthly data available" />;
    }

    const chartData: ChartDataPoint[] = data.map((item) => ({
        period: `${monthNames[item.month - 1]} ${item.year}`,
        revenue: Number(item.revenue),
        transactions: Number(item.transactions),
    }));

    const tickFill = getTickFill();

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="period"
                    tick={{ fill: tickFill, fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    dy={10}
                />
                <YAxis
                    tick={{ fill: tickFill, fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => formatCompactNumber(value)}
                    dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="revenue"
                    fill="oklch(76.9% 0.188 70.08)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
