import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export function ChartCard({ title, children, className }: ChartCardProps) {
    return (
        <Card className={`bg-slate-50/50 p-4 shadow-sm dark:bg-slate-900/20 ${className ?? ''}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

interface ChartEmptyStateProps {
    message?: string;
}

export function ChartEmptyState({ message = 'No data' }: ChartEmptyStateProps) {
    return (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
            {message}
        </div>
    );
}