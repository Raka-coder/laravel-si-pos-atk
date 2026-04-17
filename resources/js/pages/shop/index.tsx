import { Head, useForm, usePage } from '@inertiajs/react';
import { Receipt, Store, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import ShopSettingController from '@/actions/App/Http/Controllers/Settings/ShopSettingController';
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

const receiptItems = [
    { name: 'Pulpen Gel', quantity: 2, unitPrice: 8000 },
    { name: 'Buku Tulis', quantity: 3, unitPrice: 6500 },
    { name: 'Penghapus', quantity: 1, unitPrice: 3500 },
];

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
    return rupiahFormatter.format(Math.round(amount));
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

    const [samplePrice, setSamplePrice] = useState('100000');

    const profileCompletion = useMemo(() => {
        const profileFields = [
            form.data.shop_name.trim().length > 0,
            form.data.address.trim().length > 0,
            form.data.email.trim().length > 0,
            form.data.phone.trim().length > 0,
            Boolean(logoPreview),
        ];

        const completed = profileFields.filter(Boolean).length;

        return Math.round((completed / profileFields.length) * 100);
    }, [
        form.data.address,
        form.data.email,
        form.data.phone,
        form.data.shop_name,
        logoPreview,
    ]);

    const profileSuggestions = useMemo(() => {
        const suggestions: string[] = [];

        if (!logoPreview) {
            suggestions.push('Tambahkan logo agar profil toko lebih kredibel.');
        }

        if (!form.data.phone.trim()) {
            suggestions.push(
                'Tambahkan nomor telepon untuk melengkapi profil Anda.',
            );
        }

        if (!form.data.address.trim()) {
            suggestions.push('Isi alamat toko agar mudah ditemukan pelanggan.');
        }

        return suggestions;
    }, [form.data.address, form.data.phone, logoPreview]);

    const normalizedTaxRate = useMemo(() => {
        const parsedTax = Number(form.data.tax_rate);

        if (!Number.isFinite(parsedTax) || parsedTax < 0) {
            return 0;
        }

        return parsedTax;
    }, [form.data.tax_rate]);

    const parsedSamplePrice = useMemo(() => {
        const numericValue = Number(samplePrice.replace(/\D/g, ''));

        if (!Number.isFinite(numericValue) || numericValue < 0) {
            return 0;
        }

        return numericValue;
    }, [samplePrice]);

    const simulatedTax = useMemo(() => {
        return (parsedSamplePrice * normalizedTaxRate) / 100;
    }, [normalizedTaxRate, parsedSamplePrice]);

    const simulatedTotal = useMemo(() => {
        return parsedSamplePrice + simulatedTax;
    }, [parsedSamplePrice, simulatedTax]);

    const receiptSubtotal = useMemo(() => {
        return receiptItems.reduce((carry, item) => {
            return carry + item.quantity * item.unitPrice;
        }, 0);
    }, []);

    const receiptTaxAmount = useMemo(() => {
        return (receiptSubtotal * normalizedTaxRate) / 100;
    }, [normalizedTaxRate, receiptSubtotal]);

    const receiptGrandTotal = useMemo(() => {
        return receiptSubtotal + receiptTaxAmount;
    }, [receiptSubtotal, receiptTaxAmount]);

    const receiptWidthClass =
        form.data.paper_size === 'mm_58' ? 'w-[236px]' : 'w-[312px]';

    const receiptFooterPreview = form.data.receipt_footer.trim()
        ? form.data.receipt_footer
        : 'Terima kasih atas kunjungan Anda!';

    const shopNamePreview = form.data.shop_name.trim() || 'Nama Toko Anda';

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
        form.put(ShopSettingController.update.url(), {
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

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-muted text-lg font-semibold text-muted-foreground">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Shop logo"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    shopNamePreview.slice(0, 1).toUpperCase()
                                )}
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Shop Profile
                                </p>
                                <p className="text-xl font-semibold text-foreground">
                                    {shopNamePreview}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {form.data.address.trim() ||
                                        'Alamat belum diisi'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {form.data.email.trim() ||
                                        'Email belum diisi'}
                                </p>
                            </div>
                        </div>

                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Profile Completeness
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                    {profileCompletion}%
                                </p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-foreground/80 transition-all duration-300"
                                    style={{ width: `${profileCompletion}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {profileSuggestions[0] ||
                                    'Profil toko Anda sudah lengkap dan siap digunakan.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
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
                                    <InputError
                                        message={form.errors.shop_name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <TextareaComponent
                                        id="address"
                                        value={form.data.address}
                                        onChange={(e) =>
                                            form.setData(
                                                'address',
                                                e.target.value,
                                            )
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
                                            form.setData(
                                                'email',
                                                e.target.value,
                                            )
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
                                            form.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0812 3456 7890"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">
                                Images
                            </h2>
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
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
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
                                        message={
                                            form.errors.qris_image as string
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">
                                Transaction Settings
                            </h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="tax_rate">
                                        Tax Rate (%)
                                    </Label>
                                    <Input
                                        id="tax_rate"
                                        type="number"
                                        step="0.01"
                                        value={form.data.tax_rate}
                                        onChange={(e) =>
                                            form.setData(
                                                'tax_rate',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="11"
                                    />
                                    <InputError
                                        message={form.errors.tax_rate}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="paper_size">
                                        Paper Size
                                    </Label>
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

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
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

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Store className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-lg font-semibold">
                                    Tax Rate Simulator
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sample_price">
                                        Contoh Harga
                                    </Label>
                                    <Input
                                        id="sample_price"
                                        inputMode="numeric"
                                        value={samplePrice}
                                        onChange={(e) =>
                                            setSamplePrice(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        placeholder="100000"
                                    />
                                </div>

                                <div className="rounded-lg border bg-muted/40 p-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Harga Asli</span>
                                            <span className="font-medium text-foreground">
                                                {formatRupiah(
                                                    parsedSamplePrice,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>
                                                Pajak (
                                                {normalizedTaxRate.toFixed(2)}%)
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatRupiah(simulatedTax)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-t pt-3 text-base font-semibold text-foreground">
                                            <span>Total</span>
                                            <span>
                                                {formatRupiah(simulatedTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-lg font-semibold">
                                    Live Receipt Preview
                                </h2>
                            </div>

                            <div className="rounded-xl border border-dashed bg-muted/40 p-4">
                                <div
                                    className={`mx-auto rounded-md border bg-background p-4 text-[11px] leading-relaxed shadow-sm transition-all duration-300 ${receiptWidthClass}`}
                                >
                                    <div className="border-b border-dashed pb-3 text-center">
                                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted text-xs font-semibold text-muted-foreground">
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Receipt logo"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                shopNamePreview
                                                    .slice(0, 1)
                                                    .toUpperCase()
                                            )}
                                        </div>
                                        <p className="truncate font-semibold tracking-wide uppercase">
                                            {shopNamePreview}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {form.data.address.trim() ||
                                                'Alamat toko'}
                                        </p>
                                    </div>

                                    <div className="space-y-2 border-b border-dashed py-3">
                                        {receiptItems.map((item) => (
                                            <div
                                                key={item.name}
                                                className="space-y-1"
                                            >
                                                <p className="truncate text-[10px] text-muted-foreground">
                                                    {item.name}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span>
                                                        {item.quantity} x{' '}
                                                        {formatRupiah(
                                                            item.unitPrice,
                                                        )}
                                                    </span>
                                                    <span>
                                                        {formatRupiah(
                                                            item.quantity *
                                                                item.unitPrice,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1 border-b border-dashed py-3">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>
                                                {formatRupiah(receiptSubtotal)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span>
                                                Pajak (
                                                {normalizedTaxRate.toFixed(2)}%)
                                            </span>
                                            <span>
                                                {formatRupiah(receiptTaxAmount)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm font-semibold">
                                            <span>Total</span>
                                            <span>
                                                {formatRupiah(
                                                    receiptGrandTotal,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-3 text-center text-[10px] text-muted-foreground">
                                        <p className="mb-1 whitespace-pre-wrap text-foreground">
                                            {receiptFooterPreview}
                                        </p>
                                        <p>
                                            Ukuran kertas:{' '}
                                            {form.data.paper_size === 'mm_58'
                                                ? '58mm'
                                                : '80mm'}
                                        </p>
                                    </div>
                                </div>
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
