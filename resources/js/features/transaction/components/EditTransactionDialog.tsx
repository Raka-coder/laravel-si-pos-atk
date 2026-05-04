import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';
import { transactionSchema } from '@/schemas/transaction.schema';
import type { TransactionForm } from '@/schemas/transaction.schema';
import type { Product, Transaction } from '@/types';

interface EditTransactionDialogProps {
    transaction: Transaction;
    products: Product[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({
    transaction,
    products,
    open,
    onOpenChange,
}: EditTransactionDialogProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const { control, handleSubmit } = useForm<TransactionForm>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            items: transaction.items.map((item) => ({
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_sell: item.price_sell,
            })),
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items',
    });

    const watchItems = useWatch({
        control,
        name: 'items',
    });

    const totalAmount = watchItems.reduce(
        (acc, item) => acc + (item.price_sell || 0) * (item.quantity || 0),
        0,
    );

    const onEditSubmit = (data: TransactionForm) => {
        setIsProcessing(true);
        router.patch(`/transactions/${transaction.id}`, data, {
            onSuccess: () => {
                onOpenChange(false);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Modify transaction items for{' '}
                        {transaction.receipt_number}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="w-37.5">
                                        Price
                                    </TableHead>
                                    <TableHead className="w-25">Qty</TableHead>
                                    <TableHead className="w-37.5 text-right">
                                        Subtotal
                                    </TableHead>
                                    <TableHead className="w-25"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <Select
                                                value={String(
                                                    watchItems[index]
                                                        ?.product_id,
                                                )}
                                                onValueChange={(value) => {
                                                    const product =
                                                        products.find(
                                                            (p) =>
                                                                p.id ===
                                                                Number(value),
                                                        );

                                                    if (product) {
                                                        update(index, {
                                                            ...watchItems[
                                                                index
                                                            ],
                                                            product_id:
                                                                product.id,
                                                            price_sell:
                                                                product.sell_price,
                                                        });
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem
                                                            key={product.id}
                                                            value={String(
                                                                product.id,
                                                            )}
                                                        >
                                                            {product.name} (
                                                            {product.stock})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={
                                                    watchItems[index]
                                                        ?.price_sell
                                                }
                                                onChange={(e) => {
                                                    update(index, {
                                                        ...watchItems[index],
                                                        price_sell: Number(
                                                            e.target.value,
                                                        ),
                                                    });
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={
                                                    watchItems[index]?.quantity
                                                }
                                                onChange={(e) => {
                                                    update(index, {
                                                        ...watchItems[index],
                                                        quantity: Number(
                                                            e.target.value,
                                                        ),
                                                    });
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                (watchItems[index]
                                                    ?.price_sell || 0) *
                                                    (watchItems[index]
                                                        ?.quantity || 0),
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                append({
                                    product_id: products[0]?.id,
                                    quantity: 1,
                                    price_sell: products[0]?.sell_price,
                                })
                            }
                        >
                            <Plus className="mr-0.5 h-4 w-4" />
                            Add Item
                        </Button>

                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                Total Amount
                            </p>
                            <p className="text-xl font-bold">
                                {formatCurrency(totalAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(onEditSubmit)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            'Saving...'
                        ) : (
                            <>
                                <Check className="mr-0.5 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
