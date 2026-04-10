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
import { useSidebar } from '@/components/ui/sidebar';
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

// Navigation grouped by category
const mainNavItems: { category: string; items: NavItem[] }[] = [
    {
        category: 'Main',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'POS', href: '/pos', icon: ShoppingCart },
            { title: 'Transactions', href: '/transactions', icon: Wallet },
        ],
    },
    {
        category: 'Stock',
        items: [
            {
                title: 'Stock Movements',
                href: '/stock-movements',
                icon: RefreshCw,
            },
            { title: 'Products', href: '/products', icon: Box },
            {
                title: 'Product Categories',
                href: '/product-categories',
                icon: Tags,
            },
            { title: 'Units', href: '/units', icon: Package },
        ],
    },
    {
        category: 'Finance',
        items: [
            { title: 'Expenses', href: '/expenses', icon: CreditCard },
            {
                title: 'Expense Categories',
                href: '/expense-categories',
                icon: Receipt,
            },
        ],
    },
    {
        category: 'Reports',
        items: [{ title: 'Reports', href: '/reports/sales', icon: FileText }],
    },
    {
        category: 'Settings',
        items: [
            { title: 'Manage User', href: '/users', icon: Users },
            { title: 'Shop Settings', href: '/shop-settings', icon: Settings },
        ],
    },
];

const ownerNavItems = mainNavItems;

const cashierNavItems = mainNavItems
    .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
            ['Dashboard', 'POS', 'Transactions', 'Reports'].includes(
                item.title,
            ),
        ),
    }))
    .filter((group) => group.items.length > 0);

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isOwner = auth?.isOwner === true;
    const navGroups = isOwner ? ownerNavItems : cashierNavItems;
    const isCollapsed = state === 'collapsed';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo collapsed={isCollapsed} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
