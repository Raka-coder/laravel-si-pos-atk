import { Head, useForm, usePage } from '@inertiajs/react';
import { Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea as TextareaComponent } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

interface ShopSettings {
    id: number;
    shop_name: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    npwp: string | null;
    logo_path: string | null;
    qris_image_path: string | null;
    midtrans_merchant_id: string | null;
    tax_rate: number;
    receipt_footer: string | null;
    paper_size: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    [key: string]: unknown;
    shop: ShopSettings;
}

export default function ShopSettingsPage() {
    const { shop } = usePage<Props>().props;

    const [logoPreview, setLogoPreview] = useState<string | null>(
        shop.logo_path ? `/storage/${shop.logo_path}` : null,
    );
    const [qrisPreview, setQrisPreview] = useState<string | null>(
        shop.qris_image_path ? `/storage/${shop.qris_image_path}` : null,
    );

    const form = useForm<{
        shop_name: string;
        address: string;
        email: string;
        phone: string;
        logo: File | null;
        qris_image: File | null;
        remove_logo?: string;
        remove_qris?: string;
        midtrans_merchant_id: string;
        tax_rate: string;
        receipt_footer: string;
        paper_size: string;
    }>({
        shop_name: shop.shop_name || '',
        address: shop.address || '',
        email: shop.email || '',
        phone: shop.phone || '',
        logo: null as File | null,
        qris_image: null as File | null,
        midtrans_merchant_id: shop.midtrans_merchant_id || '',
        tax_rate: String(shop.tax_rate || 11),
        receipt_footer: shop.receipt_footer || '',
        paper_size: shop.paper_size || 'mm_80',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            form.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            form.setData('qris_image', file);
            setQrisPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        form.put('/shop-settings', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Shop Settings" />

            <div className="flex flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Shop Settings</h1>
                    <Button
                        onClick={handleSubmit}
                        disabled={form.processing}
                        size={'lg'}
                    >
                        {form.processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Shop Information
                        </h2>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="shop_name">Shop Name</Label>
                                <Input
                                    id="shop_name"
                                    value={form.data.shop_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'shop_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Toko ATK Saya"
                                />
                                <InputError message={form.errors.shop_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <TextareaComponent
                                    id="address"
                                    value={form.data.address}
                                    onChange={(e) =>
                                        form.setData('address', e.target.value)
                                    }
                                    placeholder="Jl. example No. 123"
                                    className="min-h-20"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                    placeholder="shop@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(e) =>
                                        form.setData('phone', e.target.value)
                                    }
                                    placeholder="0812 3456 7890"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Images</h2>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Logo</Label>
                                <div className="flex items-center gap-4">
                                    {logoPreview && (
                                        <div className="relative">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="h-16 w-16 rounded-lg border object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon-xs"
                                                onClick={() => {
                                                    form.setData(
                                                        'remove_logo',
                                                        '1',
                                                    );
                                                    setLogoPreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 rounded-full"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <label
                                        htmlFor="logo-upload"
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            asChild
                                        >
                                            <span>
                                                <Upload className="h-4 w-4" />
                                                {logoPreview
                                                    ? 'Change'
                                                    : 'Upload'}
                                            </span>
                                        </Button>
                                    </label>
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />
                                </div>
                                <InputError
                                    message={form.errors.logo as string}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>QRIS Image</Label>
                                <div className="flex items-center gap-4">
                                    {qrisPreview && (
                                        <div className="relative">
                                            <img
                                                src={qrisPreview}
                                                alt="QRIS preview"
                                                className="h-16 w-16 rounded-lg border object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon-xs"
                                                onClick={() => {
                                                    form.setData(
                                                        'remove_qris',
                                                        '1',
                                                    );
                                                    setQrisPreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 rounded-full"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <label
                                        htmlFor="qris-upload"
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            asChild
                                        >
                                            <span>
                                                <Upload className="h-4 w-4" />
                                                {qrisPreview
                                                    ? 'Change'
                                                    : 'Upload'}
                                            </span>
                                        </Button>
                                    </label>
                                    <Input
                                        id="qris-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleQrisChange}
                                    />
                                </div>
                                <InputError
                                    message={form.errors.qris_image as string}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Transaction Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                <Input
                                    id="tax_rate"
                                    type="number"
                                    step="0.01"
                                    value={form.data.tax_rate}
                                    onChange={(e) =>
                                        form.setData('tax_rate', e.target.value)
                                    }
                                    placeholder="11"
                                />
                                <InputError message={form.errors.tax_rate} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="paper_size">Paper Size</Label>
                                <Select
                                    value={form.data.paper_size}
                                    onValueChange={(value) =>
                                        form.setData('paper_size', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select paper size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mm_58">
                                            58mm (Small)
                                        </SelectItem>
                                        <SelectItem value="mm_80">
                                            80mm (Standard)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Payment Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="midtrans_merchant_id">
                                    Midtrans Merchant ID
                                </Label>
                                <Input
                                    id="midtrans_merchant_id"
                                    value={form.data.midtrans_merchant_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'midtrans_merchant_id',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="M123456789"
                                />
                                <InputError
                                    message={
                                        form.errors
                                            .midtrans_merchant_id as string
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="receipt_footer">
                                    Receipt Footer Text
                                </Label>
                                <TextareaComponent
                                    id="receipt_footer"
                                    className="min-h-20"
                                    value={form.data.receipt_footer}
                                    onChange={(e) =>
                                        form.setData(
                                            'receipt_footer',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Terima kasih atas kunjungan Anda!"
                                />
                            </div>
                        </div>
                    </div>
                </div>
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
