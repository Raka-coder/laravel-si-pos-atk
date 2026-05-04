import { BanknoteIcon, CreditCardIcon, QrCodeIcon } from 'lucide-react';
import type {
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
} from 'react-hook-form';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { PosPaymentForm } from '@/schemas/pos-payment.schema';

interface PaymentDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    total: number;
    paymentFormData: PosPaymentForm;
    register: UseFormRegister<PosPaymentForm>;
    errors: any;
    setValue: UseFormSetValue<PosPaymentForm>;
    handleSubmit: UseFormHandleSubmit<PosPaymentForm>;
    onPaymentSubmit: (data: PosPaymentForm) => void;
    handleSelectQris: () => void;
    isProcessing: boolean;
    paymentError?: string | null;
}

export function PaymentDialog({
    isOpen,
    onOpenChange,
    total,
    paymentFormData,
    register,
    errors,
    setValue,
    handleSubmit,
    onPaymentSubmit,
    handleSelectQris,
    isProcessing,
    paymentError,
}: PaymentDialogProps) {
    const changeAmount = parseFloat(paymentFormData.amount_paid) - total;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Pembayaran</DialogTitle>
                    <DialogDescription>
                        Pilih metode pembayaran
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setValue('payment_method', 'cash')}
                            className={cn(
                                'flex h-auto flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent',
                                paymentFormData.payment_method === 'cash'
                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                    : 'border-border text-muted-foreground',
                            )}
                        >
                            <BanknoteIcon className="h-6 w-6" />
                            <span className="text-center text-xs leading-tight font-bold tracking-wider uppercase">
                                Tunai
                            </span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSelectQris}
                            className={cn(
                                'flex h-auto flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent',
                                paymentFormData.payment_method === 'qris'
                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                    : 'border-border text-muted-foreground',
                            )}
                        >
                            <QrCodeIcon className="h-6 w-6" />
                            <span className="text-center text-xs leading-tight font-bold tracking-wider uppercase">
                                QRIS
                            </span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setValue('payment_method', 'midtrans')
                            }
                            className={cn(
                                'flex h-auto flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent',
                                paymentFormData.payment_method === 'midtrans'
                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                    : 'border-border text-muted-foreground',
                            )}
                        >
                            <CreditCardIcon className="h-6 w-6" />
                            <span className="text-center text-xs leading-tight font-bold tracking-wider uppercase">
                                Midtrans
                            </span>
                        </Button>
                    </div>

                    {/* Total Display */}
                    <div className="rounded-lg bg-muted p-4">
                        <div className="text-sm text-muted-foreground">
                            Total Pembayaran
                        </div>
                        <div className="text-2xl font-bold">
                            {formatCurrency(total)}
                        </div>
                    </div>

                    {/* Cash Payment Fields */}
                    {paymentFormData.payment_method === 'cash' && (
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Jumlah Bayar</Label>
                            <Input
                                id="amount"
                                type="number"
                                {...register('amount_paid')}
                                placeholder="Masukkan jumlah..."
                            />
                            <InputError message={errors.amount_paid?.message} />
                            {parseFloat(paymentFormData.amount_paid) >=
                                total && (
                                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900">
                                    <div className="text-sm text-green-700 dark:text-green-300">
                                        Kembalian
                                    </div>
                                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                                        {formatCurrency(
                                            Math.max(0, changeAmount),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* QRIS Static Info */}
                    {paymentFormData.payment_method === 'qris' && (
                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                Bayar dengan QRIS Static
                            </div>
                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                Scan QR Code dan pastikan pembayaran berhasil di
                                aplikasi pelanggan.
                            </div>
                        </div>
                    )}

                    {/* Midtrans Info */}
                    {paymentFormData.payment_method === 'midtrans' && (
                        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                            <div className="text-sm text-purple-700 dark:text-purple-300">
                                Bayar dengan Midtrans
                            </div>
                            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                                Klik "Proses Pembayaran" untuk membuka Snap
                                popup (Kartu, GoPay, ShopeePay, dll)
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {paymentError && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                            {paymentError}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleSubmit(onPaymentSubmit)}
                        disabled={
                            isProcessing ||
                            (paymentFormData.payment_method === 'cash' &&
                                parseFloat(paymentFormData.amount_paid) < total)
                        }
                    >
                        {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
