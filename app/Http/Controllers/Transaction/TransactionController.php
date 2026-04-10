<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ShopSetting;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Services\MidtransService;
use App\Services\TransactionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $paymentMethod = $request->input('payment_method', 'all');
        $perPage = 20;

        $transactions = Transaction::with('user')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('receipt_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($paymentMethod && $paymentMethod !== 'all', function ($query) use ($paymentMethod) {
                $query->where('payment_method', $paymentMethod);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('transaction/index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'payment_method' => $paymentMethod,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = [
            'items' => $request->input('items', []),
            'subtotal' => $request->input('subtotal', 0),
            'discount_amount' => $request->input('discount_amount', 0),
            'tax_amount' => $request->input('tax_amount', 0),
            'total_price' => $request->input('total_price', 0),
            'payment_method' => $request->input('payment_method', 'cash'),
            'amount_paid' => $request->input('amount_paid', 0),
            'change_amount' => $request->input('change_amount', 0),
            'note' => $request->input('note'),
        ];

        $transaction = app(TransactionService::class)->createTransaction($data);

        // For Midtrans/QRIS, return token info
        $paymentMethod = $data['payment_method'];

        if (in_array($paymentMethod, ['midtrans', 'qris'])) {
            try {
                $midtransService = app(MidtransService::class);

                \Log::info('Midtrans Service Config', [
                    'isConfigured' => $midtransService->isConfigured(),
                    'serverKey' => $midtransService->isConfigured() ? 'set' : 'missing',
                ]);

                if ($midtransService->isConfigured()) {
                    $snapResult = $midtransService->createSnapToken($transaction);

                    \Log::info('Midtrans Snap Result', $snapResult);

                    if ($snapResult['success']) {
                        return response()->json([
                            'success' => true,
                            'transaction_id' => $transaction->id,
                            'receipt_number' => $transaction->receipt_number,
                            'payment_method' => $paymentMethod,
                            'snap_token' => $snapResult['token'],
                            'redirect_url' => $snapResult['redirect_url'],
                        ]);
                    } else {
                        return response()->json([
                            'success' => false,
                            'error' => $snapResult['error'] ?? 'Failed to create snap token',
                        ], 500);
                    }
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'Midtrans is not configured. Please configure your keys in Shop Settings.',
                    ], 500);
                }
            } catch (\Exception $e) {
                \Log::error('Midtrans Payment Error: '.$e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                ]);

                // If Midtrans fails, mark as failed
                $transaction->update([
                    'payment_status' => 'cancelled',
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Payment initialization failed: '.$e->getMessage(),
                ], 500);
            }
        }

        // For cash, redirect to transaction detail
        return redirect()->route('transactions.show', $transaction->id);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'items.product']);

        $products = Product::with(['category', 'unit'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get();

        $shop = ShopSetting::getShop();

        return Inertia::render('transaction/show', [
            'transaction' => $transaction,
            'products' => $products,
            'taxRate' => $shop->tax_rate,
        ]);
    }

    public function receipt(Transaction $transaction)
    {
        $transaction->load(['user', 'items.product']);

        $shop = ShopSetting::getShop();

        $pdf = Pdf::loadView('receipts.transaction', [
            'transaction' => $transaction,
            'shop' => $shop,
        ]);

        return $pdf->download('receipt-'.$transaction->receipt_number.'.pdf');
    }

    public function pos(): Response
    {
        $products = Product::with(['category', 'unit'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get();

        $shop = ShopSetting::getShop();

        return Inertia::render('pos/index', [
            'products' => $products,
            'taxRate' => $shop->tax_rate,
            'paperSize' => $shop->paper_size,
            'midtransClientKey' => config('midtrans.client_key') ?: env('MIDTRANS_CLIENT_KEY', ''),
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price_sell' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $transaction) {
            $oldItems = $transaction->items()->get();
            foreach ($oldItems as $oldItem) {
                $product = $oldItem->product;
                if ($product) {
                    $stockBefore = $product->stock;

                    Product::withoutEvents(function () use ($product, $oldItem) {
                        $product->increment('stock', $oldItem->quantity);
                    });
                    $product->refresh();

                    StockMovement::create([
                        'movement_type' => 'return',
                        'qty' => $oldItem->quantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $product->stock,
                        'reason' => 'Edit transaction #'.$transaction->receipt_number,
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'reference_id' => $transaction->id,
                    ]);
                }
            }

            $transaction->items()->delete();

            $subtotal = 0;
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                $newQuantity = $item['quantity'];

                $stockBefore = $product->stock;

                Product::withoutEvents(function () use ($product, $newQuantity) {
                    $product->decrement('stock', $newQuantity);
                });
                $product->refresh();

                $itemSubtotal = ($item['price_sell'] * $newQuantity) - ($item['discount_amount'] ?? 0);
                $subtotal += $itemSubtotal;

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $product->name,
                    'price_buy_snapshot' => $product->buy_price,
                    'price_sell' => $item['price_sell'],
                    'quantity' => $newQuantity,
                    'discount_amount' => $item['discount_amount'] ?? 0,
                    'subtotal' => $itemSubtotal,
                ]);

                StockMovement::create([
                    'movement_type' => 'sale',
                    'qty' => $newQuantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $product->stock,
                    'reason' => 'Edit transaction #'.$transaction->receipt_number,
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'reference_id' => $transaction->id,
                ]);
            }

            $discountAmount = $request->discount_amount ?? 0;
            $taxAmount = $request->tax_amount ?? 0;
            $totalPrice = $request->total_price ?? 0;

            $transaction->update([
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_price' => $totalPrice,
                'note' => $request->note,
            ]);

            return redirect()->route('transactions.show', $transaction->id)
                ->with('success', 'Transaksi berhasil diperbarui.');
        });
    }
}
