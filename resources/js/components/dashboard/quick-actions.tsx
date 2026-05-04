import { Link } from '@inertiajs/react';
import { Package, RefreshCw, TrendingUp, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsProps {
    showProducts?: boolean;
    showUsers?: boolean;
    showStockMovements?: boolean;
}

export function QuickActions({ showProducts = false, showUsers = false, showStockMovements = false }: QuickActionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Button asChild size="lg">
                        <Link href="/pos">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Open POS
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/transactions">
                            <Wallet className="mr-0.5 h-4 w-4" />
                            Transactions
                        </Link>
                    </Button>
                    {showProducts && (
                        <Button asChild variant="outline" size="lg">
                            <Link href="/products">
                                <Package className="mr-0.5 h-4 w-4" />
                                Products
                            </Link>
                        </Button>
                    )}
                    {showStockMovements && (
                        <Button asChild variant="outline" size="lg">
                            <Link href="/stock-movements">
                                <RefreshCw className="mr-0.5 h-4 w-4" />
                                Stock Movements
                            </Link>
                        </Button>
                    )}
                    {showUsers && (
                        <Button asChild variant="outline" size="lg">
                            <Link href="/users">
                                <Users className="mr-0.5 h-4 w-4" />
                                Manage Users
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}