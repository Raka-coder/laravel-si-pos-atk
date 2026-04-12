import type { PieLabelRenderProps } from 'recharts';
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { formatCurrency } from '@/components/charts/chart-utils';
import ChartEmptyState from '@/components/charts/ChartEmptyState';

interface CategoryRevenueData {
    category_name: string | null;
    revenue: number | string;
}

interface Props {
    data: CategoryRevenueData[];
}

const categoryColors = [
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#F43F5E',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#14B8A6',
    '#06B6D4',
    '#3B82F6',
];

interface ChartDataPoint {
    name: string;
    value: number;
    percentage: number;
    fill: string;
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

    const { name, value, percentage } = payload[0].payload;

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-200">{name}</p>
            <p className="text-sm text-slate-300">
                {formatCurrency(value as number)}
            </p>
            <p className="text-sm text-slate-300">
                {percentage?.toFixed(1) ?? '0.0'}% of total
            </p>
        </div>
    );
}

function getPieLabelFill() {
    return document.documentElement.classList.contains('dark')
        ? '#d1d5db'
        : '#475569';
}

function renderCustomizedLabel(props: PieLabelRenderProps) {
    const {
        cx = 0,
        cy = 0,
        midAngle = 0,
        innerRadius = 0,
        outerRadius = 0,
        name,
    } = props;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
                fill: getPieLabelFill(),
                fontSize: '11px',
                fontWeight: 500,
            }}
        >
            {name}
        </text>
    );
}

export default function CategoryRevenueChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <ChartEmptyState message="No category data available" />;
    }

    const total = data.reduce((sum, item) => sum + Number(item.revenue), 0);

    const chartData: ChartDataPoint[] = data.map((item, index) => {
        const value = Number(item.revenue);

        return {
            name: item.category_name || 'Uncategorized',
            value,
            percentage: total > 0 ? (value / total) * 100 : 0,
            fill: categoryColors[index % categoryColors.length],
        };
    });

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={renderCustomizedLabel}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    align="right"
                    verticalAlign="middle"
                    layout="vertical"
                    formatter={(value) => (
                        <span className="text-sm font-semibold text-foreground">
                            {value as string}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
