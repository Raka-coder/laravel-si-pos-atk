import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    formatCurrency,
    formatShortDate,
} from '@/components/charts/chart-utils';
import ChartEmptyState from '@/components/charts/ChartEmptyState';

interface DailyRevenueData {
    date: string;
    revenue: number | string;
    transactions: number | string;
}

interface Props {
    data: DailyRevenueData[];
}

interface ChartDataPoint {
    date: string;
    displayDate: string;
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
    const displayLabel = label || '';
    const transactions = payload[0].payload.transactions;

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-200">
                {displayLabel}
            </p>
            <p className="text-sm text-slate-300">
                Revenue: {formatCurrency(revenue as number)}
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

export default function RevenueChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <ChartEmptyState message="No revenue data available" />;
    }

    const chartData: ChartDataPoint[] = data.map((item) => ({
        date: item.date,
        displayDate: formatShortDate(new Date(item.date).getTime()),
        revenue: Number(item.revenue),
        transactions: Number(item.transactions),
    }));

    const tickFill = getTickFill();

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="#1E9DF1"
                            stopOpacity={0.5}
                        />
                        <stop
                            offset="95%"
                            stopColor="#1E9DF1"
                            stopOpacity={0.05}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="displayDate"
                    tick={{ fill: tickFill, fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    dy={10}
                />
                <YAxis
                    tick={{ fill: tickFill, fontSize: 11 }}
                    tickLine={{ stroke: '#e2e8f0' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => formatCurrency(value)}
                    dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1E9DF1"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
