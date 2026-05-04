import { Head, usePage } from '@inertiajs/react';
import React from 'react';

import { PageHeader } from '@/components/common/page-header';
import { ShopSettingsForm } from '@/features/shop/components/ShopSettingsForm';
import type { BreadcrumbItem, Shop as ShopSettings } from '@/types';

interface Props {
    [key: string]: unknown;
    shop: ShopSettings;
}

export default function ShopSettingsPage() {
    const { shop } = usePage<Props>().props;

    return (
        <>
            <Head title="Shop Settings" />

            <div className="flex flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Shop Settings" />
                <ShopSettingsForm shop={shop} />
            </div>
        </>
    );
}

ShopSettingsPage.layout = {
    breadcrumbs: [
        {
            title: 'Shop Settings',
            href: '/shop-settings',
        },
    ] as BreadcrumbItem[],
};
