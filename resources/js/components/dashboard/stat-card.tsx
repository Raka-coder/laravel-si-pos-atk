import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ColorVariant = 'blue' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'red' | 'teal' | 'orange' | 'zinc';

const colorMap: Record<ColorVariant, { bg: string; text: string; darkBg: string; darkText: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', darkBg: 'dark:bg-blue-900/50', darkText: 'dark:text-blue-400' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', darkBg: 'dark:bg-emerald-900/50', darkText: 'dark:text-emerald-400' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', darkBg: 'dark:bg-indigo-900/50', darkText: 'dark:text-indigo-400' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', darkBg: 'dark:bg-amber-900/50', darkText: 'dark:text-amber-400' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600', darkBg: 'dark:bg-rose-900/50', darkText: 'dark:text-rose-400' },
    red: { bg: 'bg-red-100', text: 'text-red-600', darkBg: 'dark:bg-red-900/50', darkText: 'dark:text-red-400' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-600', darkBg: 'dark:bg-teal-900/50', darkText: 'dark:text-teal-400' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', darkBg: 'dark:bg-orange-900/50', darkText: 'dark:text-orange-400' },
    zinc: { bg: 'bg-zinc-100', text: 'text-muted-foreground', darkBg: 'dark:bg-zinc-900/50', darkText: 'dark:text-muted-foreground' },
};

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    color?: ColorVariant;
    valueClassName?: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    color = 'blue',
    valueClassName,
    className,
}: StatCardProps) {
    const colors = colorMap[color];

    return (
        <Card className={cn('overflow-hidden border-l-4', className, `border-l-${color}-500`)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={cn('rounded-full p-1.5', colors.bg, colors.darkBg)}>
                    <Icon className={cn('h-4 w-4', colors.text, colors.darkText)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
                {description && (
                    <p className="text-xs font-medium text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
