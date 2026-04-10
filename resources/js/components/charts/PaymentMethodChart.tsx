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

interface PaymentMethodData {
    payment_method: string;
    count: number | string;
    total: number | string;
}

interface Props {
    data: PaymentMethodData[];
}

const paymentMethodLabels: Record<string, string> = {
    cash: 'Tunai',
    qris: 'QRIS',
    midtrans: 'Midtrans',
};

const paymentMethodColors: Record<string, string> = {
    cash: '#10B981',
    qris: '#3B82F6',
    midtrans: '#8B5CF6',
};

interface ChartDataPoint {
    name: string;
    value: number;
    transactions: number;
    color: string;
    percentage: number;
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

    const { name, value, transactions, percentage } = payload[0].payload;

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-200">{name}</p>
            <p className="text-sm text-slate-300">
                {formatCurrency(value as number)}
            </p>
            <p className="text-sm text-slate-300">
                {transactions} transactions ({percentage.toFixed(1)}%)
            </p>
        </div>
    );
}

function renderCustomizedLabel(props: PieLabelRenderProps) {
    const {
        cx = 0,
        cy = 0,
        midAngle = 0,
        innerRadius = 0,
        outerRadius = 0,
        percent = 0,
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
            className="text-xs font-medium"
            style={{ color: '#475569', fontSize: '11px', fontWeight: 500 }}
        >
            {name}: {percent * 100 >= 0 ? (percent * 100).toFixed(1) : '0.0'}%
        </text>
    );
}

export default function PaymentMethodChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <ChartEmptyState message="No payment data available" />;
    }

    const total = data.reduce((sum, item) => sum + Number(item.total), 0);

    const chartData: ChartDataPoint[] = data.map((item) => {
        const value = Number(item.total);

        return {
            name:
                paymentMethodLabels[item.payment_method] ?? item.payment_method,
            value,
            transactions: Number(item.count),
            color: paymentMethodColors[item.payment_method] ?? '#64748b',
            percentage: total > 0 ? (value / total) * 100 : 0,
        };
    });

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    align="right"
                    verticalAlign="middle"
                    layout="vertical"
                    formatter={(value) => (
                        <span className="text-sm font-medium text-slate-600">
                            {value as string}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
