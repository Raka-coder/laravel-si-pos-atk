import { router } from '@inertiajs/react';
import { useState } from 'react';

import {
    cancelMidtrans,
    store as storeTransaction,
} from '@/routes/transactions';
import { useCartStore } from '@/stores/cartStore';
import type { Product, Shop } from '@/types';

interface MidtransTransactionResponse {
    success: boolean;
    transaction_id: number;
    snap_token?: string;
    redirect_url?: string;
    error?: string;
}

export function usePos(shop: Shop, midtransClientKey?: string) {
    const cart = useCartStore();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isQrisPopupOpen, setIsQrisPopupOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);

    const handleAddToCart = (product: Product) => {
        cart.addItem(product);
    };

    const handleCheckout = (
        total: number,
        setValue: (name: any, value: any) => void,
    ) => {
        if (cart.items.length === 0) {
            return;
        }

        setIsPaymentOpen(true);
        setValue('payment_method', 'cash');
        setValue('amount_paid', String(Math.ceil(total / 1000) * 1000));
    };

    const handleSelectQris = (setValue: (name: any, value: any) => void) => {
        setValue('payment_method', 'qris');
        setIsQrisPopupOpen(true);
    };

    const processMidtransPayment = async (data: { note?: string }) => {
        if (!midtransClientKey) {
            setPaymentError(
                'Midtrans belum dikonfigurasi. Cek Client Key di pengaturan toko.',
            );

            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            const response = await fetch(storeTransaction.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    items: cart.getItemsForBackend(),
                    subtotal: cart.subtotal,
                    discount_amount: 0,
                    tax_amount: cart.taxAmount,
                    total_price: cart.total,
                    payment_method: 'midtrans',
                    amount_paid: cart.total,
                    change_amount: 0,
                    note: data.note || '',
                }),
            });

            const resData: MidtransTransactionResponse = await response.json();

            if (resData.success && resData.snap_token) {
                const snapToken = resData.snap_token;
                const transactionId = resData.transaction_id;

                if (!window.snap) {
                    if (resData.redirect_url) {
                        window.location.assign(resData.redirect_url);

                        return;
                    }

                    setPaymentError(
                        'Snap belum siap. Muat ulang halaman lalu coba lagi.',
                    );
                    setIsProcessing(false);

                    return;
                }

                setIsPaymentOpen(false);

                window.setTimeout(() => {
                    window.snap?.pay(snapToken, {
                        onSuccess: function () {
                            setIsProcessing(false);
                            cart.clearCart();
                            router.visit(
                                `/transactions/${resData.transaction_id}`,
                            );
                        },
                        onPending: function () {
                            setIsProcessing(false);
                            cart.clearCart();
                            router.visit(
                                `/transactions/${resData.transaction_id}`,
                            );
                        },
                        onError: function () {
                            setPaymentError(
                                'Pembayaran gagal. Silakan coba lagi.',
                            );

                            fetch(
                                cancelMidtrans.url({
                                    transaction: transactionId,
                                }),
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'X-CSRF-TOKEN':
                                            document
                                                .querySelector(
                                                    'meta[name="csrf-token"]',
                                                )
                                                ?.getAttribute('content') || '',
                                    },
                                },
                            ).catch(() => null);

                            setIsProcessing(false);
                            setIsPaymentOpen(true);
                        },
                        onClose: function () {
                            setPaymentError('Pembayaran dibatalkan.');

                            fetch(
                                cancelMidtrans.url({
                                    transaction: transactionId,
                                }),
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'X-CSRF-TOKEN':
                                            document
                                                .querySelector(
                                                    'meta[name="csrf-token"]',
                                                )
                                                ?.getAttribute('content') || '',
                                    },
                                },
                            ).catch(() => null);

                            setIsProcessing(false);
                            setIsPaymentOpen(true);
                        },
                    });
                }, 100);
            } else {
                setPaymentError(resData.error || 'Gagal memulai pembayaran');
                setIsProcessing(false);
            }
        } catch {
            setPaymentError('Terjadi kesalahan. Silakan coba lagi.');
            setIsProcessing(false);
        }
    };

    const processStandardPayment = (data: {
        payment_method: string;
        amount_paid: string;
        note?: string;
    }) => {
        if (data.payment_method === 'qris' && !shop.qris_image_path) {
            setPaymentError(
                'QR Code QRIS belum diunggah. Hubungi admin untuk upload QR Code di Pengaturan Toko.',
            );

            return;
        }

        const paid =
            data.payment_method === 'qris'
                ? cart.total
                : parseFloat(data.amount_paid) || 0;

        if (paid < cart.total) {
            alert('Jumlah pembayaran kurang!');

            return;
        }

        setIsProcessing(true);

        router.post(
            '/transactions',
            {
                items: cart.getItemsForBackend(),
                subtotal: cart.subtotal,
                discount_amount: 0,
                tax_amount: cart.taxAmount,
                total_price: cart.total,
                payment_method: data.payment_method,
                amount_paid: paid,
                change_amount: paid - cart.total,
                note: data.note || '',
            },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsPaymentOpen(false);
                    cart.clearCart();
                },
            },
        );
    };

    return {
        cart,
        isPaymentOpen,
        setIsPaymentOpen,
        isQrisPopupOpen,
        setIsQrisPopupOpen,
        isProcessing,
        paymentError,
        setPaymentError,
        isClearCartDialogOpen,
        setIsClearCartDialogOpen,
        handleAddToCart,
        handleCheckout,
        handleSelectQris,
        processMidtransPayment,
        processStandardPayment,
    };
}
