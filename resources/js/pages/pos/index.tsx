import { zodResolver } from '@hookform/resolvers/zod';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ConfirmAlert } from '@/components/common/confirm-alert';
import { CartSidebar } from '@/features/pos/components/CartSidebar';
import { PaymentDialog } from '@/features/pos/components/PaymentDialog';
import { ProductGrid } from '@/features/pos/components/ProductGrid';
import { QrisSheet } from '@/features/pos/components/QrisSheet';
import { usePos } from '@/hooks/use-pos';
import { posPaymentSchema } from '@/schemas/pos-payment.schema';
import type { PosPaymentForm } from '@/schemas/pos-payment.schema';
import type { BreadcrumbItem } from '@/types';
import type { Product, Shop } from '@/types/models';

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options: {
                    onSuccess: (result: unknown) => void;
                    onPending: (result: unknown) => void;
                    onError: (result: unknown) => void;
                    onClose: () => void;
                },
            ) => void;
        };
    }
}

interface Props {
    [key: string]: unknown;
    products: Product[];
    shop: Shop;
    taxRate: number;
    midtransClientKey?: string;
}

export default function POSIndex() {
    const {
        products,
        shop,
        taxRate: initialTaxRate,
        midtransClientKey,
    } = usePage<Props>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null,
    );

    const {
        cart,
        isPaymentOpen,
        setIsPaymentOpen,
        isQrisPopupOpen,
        setIsQrisPopupOpen,
        isProcessing,
        paymentError,
        isClearCartDialogOpen,
        setIsClearCartDialogOpen,
        handleAddToCart,
        handleCheckout,
        handleSelectQris,
        processMidtransPayment,
        processStandardPayment,
    } = usePos(shop, midtransClientKey);

    const { items, total, clearCart, calculateTotals } = cart;

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<PosPaymentForm>({
        resolver: zodResolver(posPaymentSchema),
        defaultValues: {
            payment_method: 'cash',
            amount_paid: '0',
            note: '',
        },
    });

    const paymentFormData = useWatch({ control }) as PosPaymentForm;

    useEffect(() => {
        calculateTotals(initialTaxRate);
    }, [items, initialTaxRate, calculateTotals]);

    const categories = [
        ...new Map(products.map((p) => [p.category?.id, p.category])).values(),
    ].filter(Boolean);

    const onPaymentSubmit = async (data: PosPaymentForm) => {
        if (data.payment_method === 'midtrans') {
            await processMidtransPayment(data);

            return;
        }

        processStandardPayment(data);
    };

    const handleClearCart = () => {
        setIsClearCartDialogOpen(true);
    };

    const confirmClearCart = () => {
        clearCart();

        setIsClearCartDialogOpen(false);
    };

    const checkoutHandler = () => {
        handleCheckout(total, setValue);
    };

    const selectQrisHandler = () => {
        handleSelectQris(setValue);
    };

    const cancelQrisHandler = () => {
        setIsQrisPopupOpen(false);
        setValue('payment_method', 'cash');
    };

    return (
        <>
            <Head title="POS - Point of Sale" />

            <div className="flex h-full flex-1 gap-4 overflow-hidden rounded-xl p-4">
                <ProductGrid
                    products={products}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                    handleAddToCart={handleAddToCart}
                />

                <CartSidebar
                    cart={cart}
                    taxRate={initialTaxRate}
                    handleClearCart={handleClearCart}
                    handleCheckout={checkoutHandler}
                />
            </div>

            <PaymentDialog
                isOpen={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
                total={total}
                paymentFormData={paymentFormData}
                register={register}
                errors={errors}
                setValue={setValue}
                handleSubmit={handleSubmit}
                onPaymentSubmit={onPaymentSubmit}
                handleSelectQris={selectQrisHandler}
                isProcessing={isProcessing}
                paymentError={paymentError}
            />

            <QrisSheet
                isOpen={isQrisPopupOpen}
                onOpenChange={setIsQrisPopupOpen}
                shop={shop}
                total={total}
                isProcessing={isProcessing}
                handleSubmit={handleSubmit}
                onPaymentSubmit={onPaymentSubmit}
                onCancel={cancelQrisHandler}
            />

            <ConfirmAlert
                open={isClearCartDialogOpen}
                onOpenChange={setIsClearCartDialogOpen}
                title="Clear Cart"
                description="Are you sure you want to clear the cart? All items will be removed and this action cannot be undone."
                confirmText="Clear"
                onConfirm={confirmClearCart}
                variant="destructive"
            />
        </>
    );
}

POSIndex.layout = {
    breadcrumbs: [
        {
            title: 'POS',
            href: '/pos',
        },
    ] as BreadcrumbItem[],
};
