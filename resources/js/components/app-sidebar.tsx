import { Link, usePage } from '@inertiajs/react';
import {
    Box,
    LayoutGrid,
    Package,
    RefreshCw,
    ShoppingCart,
    Tags,
    Wallet,
    Receipt,
    CreditCard,
    FileText,
    Settings,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'POS',
        href: '/pos',
        icon: ShoppingCart,
    },
    {
        title: 'Transactions',
        href: '/transactions',
        icon: Wallet,
    },
    {
        title: 'Stock Movements',
        href: '/stock-movements',
        icon: RefreshCw,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Box,
    },
    {
        title: 'Product Categories',
        href: '/product-categories',
        icon: Tags,
    },
    {
        title: 'Units',
        href: '/units',
        icon: Package,
    },
    {
        title: 'Expenses',
        href: '/expenses',
        icon: CreditCard,
    },
    {
        title: 'Expense Categories',
        href: '/expense-categories',
        icon: Receipt,
    },
    {
        title: 'Reports',
        href: '/reports/sales',
        icon: FileText,
    },
    {
        title: 'Manage User',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Shop Settings',
        href: '/shop-settings',
        icon: Settings,
    },
];

const ownerNavItems: NavItem[] = allNavItems;

const cashierNavItems: NavItem[] = allNavItems.filter((item) =>
    ['Dashboard', 'POS', 'Transactions', 'Reports'].includes(item.title),
);

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isOwner = auth?.isOwner === true;
    const mainNavItems = isOwner ? ownerNavItems : cashierNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
