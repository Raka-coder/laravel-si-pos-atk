import { Head, usePage } from '@inertiajs/react';
import React, { useRef } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { ShopSettingsForm } from '@/features/shop/components/ShopSettingsForm';
import type { BreadcrumbItem, Shop as ShopSettings } from '@/types';

interface Props {
    [key: string]: unknown;
    shop: ShopSettings;
}

export default function ShopSettingsPage() {
    const { shop } = usePage<Props>().props;
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <>
            <Head title="Shop Settings" />

            <div className="flex flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <PageHeader title="Shop Settings">
                    <Button
                        type="submit"
                        form="shop-settings-form"
                        size="lg"
                    >
                        Save Changes
                    </Button>
                </PageHeader>
                <ShopSettingsForm shop={shop} formRef={formRef} />
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
