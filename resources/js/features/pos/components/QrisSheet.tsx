import { CheckCircle2, Info, QrCodeIcon } from 'lucide-react';
import type { UseFormHandleSubmit } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { formatCurrency } from '@/lib/formatters';
import type { PosPaymentForm } from '@/schemas/pos-payment.schema';
import type { Shop } from '@/types/models';

interface QrisSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    shop: Shop;
    total: number;
    isProcessing: boolean;
    handleSubmit: UseFormHandleSubmit<PosPaymentForm>;
    onPaymentSubmit: (data: PosPaymentForm) => void;
    onCancel: () => void;
}

export function QrisSheet({
    isOpen,
    onOpenChange,
    shop,
    total,
    isProcessing,
    handleSubmit,
    onPaymentSubmit,
    onCancel,
}: QrisSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="p-0 sm:max-w-md" side="right">
                <div className="flex h-full flex-col">
                    <SheetHeader className="border-b p-6 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <SheetTitle className="text-xl font-black tracking-tight">
                                    QRIS Payment
                                </SheetTitle>
                                <SheetDescription>
                                    Scan using e-wallet atau mobile banking
                                </SheetDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="h-6 rounded-md border-primary/20 bg-primary/5 px-2 text-[10px] font-bold tracking-widest text-primary uppercase"
                            >
                                Static QR
                            </Badge>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4 p-4">
                            {/* Amount - Enhanced */}
                            <div className="rounded-2xl text-center">
                                <div className="mb-1 text-[10px] font-semibold text-muted-foreground uppercase">
                                    Total Amount Due
                                </div>
                                <div className="text-3xl font-black text-foreground tabular-nums">
                                    {formatCurrency(total)}
                                </div>
                            </div>

                            {/* QR Code Area */}
                            <div className="flex flex-col items-center gap-6">
                                {shop.qris_image_path ? (
                                    <div className="group relative">
                                        <div className="absolute -inset-4 rounded-[2.5rem] bg-primary/5 opacity-50 blur-2xl" />
                                        <div className="relative rounded-2xl border-4 border-background bg-background p-4 shadow-2xl">
                                            <img
                                                src={`/storage/${shop.qris_image_path}`}
                                                alt="QRIS Code"
                                                className="h-56 w-56 object-contain"
                                            />
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                                                <Badge className="h-6 rounded-full px-4 text-[10px] font-bold tracking-widest uppercase shadow-lg">
                                                    QRIS
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-muted/30 py-16">
                                        <div className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
                                            <QrCodeIcon className="h-10 w-10 text-muted-foreground/40" />
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <p className="text-sm font-bold text-foreground">
                                                QR Code Not Available
                                            </p>
                                            <p className="mx-auto max-w-50 text-xs text-muted-foreground">
                                                Please upload your QRIS code in
                                                the shop settings to enable this
                                                method.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Instructions - Refined */}
                            {shop.qris_image_path && (
                                <div className="space-y-2 pt-4">
                                    <h4 className="flex items-center gap-2 text-xs font-bold tracking-widest text-foreground uppercase">
                                        <Info className="h-4 w-4 text-primary" />
                                        Payment Steps
                                    </h4>
                                    <div className="grid gap-2">
                                        {[
                                            'Buka aplikasi e-wallet atau mobile banking',
                                            'Pilih menu "Scan QR" atau "Bayar"',
                                            'Scan QR Code yang muncul di atas',
                                            `Pastikan nominal sesuai: ${formatCurrency(total)}`,
                                            'Selesaikan transaksi di aplikasi Anda',
                                        ].map((step, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 rounded-xl border border-border/30 bg-muted/30 p-2"
                                            >
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                    {i + 1}
                                                </span>
                                                <span className="text-xs leading-snug font-medium text-foreground/80">
                                                    {step}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t p-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={onCancel}
                                className="w-full text-[11px] font-bold tracking-wider uppercase sm:flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                onClick={handleSubmit(onPaymentSubmit)}
                                disabled={!shop.qris_image_path || isProcessing}
                                className="w-full text-[11px] font-bold tracking-wider uppercase shadow-lg shadow-primary/20 sm:flex-1"
                            >
                                {!shop.qris_image_path ? (
                                    'QR Not Available'
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-0.5 h-4 w-4" />
                                        Sudah Bayar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
