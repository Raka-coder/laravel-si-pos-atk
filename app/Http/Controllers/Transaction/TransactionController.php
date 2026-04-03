<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ShopSetting;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
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
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('transaction/index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
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
            'payment_method' => $request->input('payment_method'),
            'amount_paid' => $request->input('amount_paid', 0),
            'change_amount' => $request->input('change_amount', 0),
            'note' => $request->input('note'),
        ];

        $transaction = app(TransactionService::class)->createTransaction($data);

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
                    $product->increment('stock', $oldItem->quantity);
                    StockMovement::create([
                        'movement_type' => 'return',
                        'qty' => $oldItem->quantity,
                        'stock_before' => $product->stock + $oldItem->quantity,
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

                $product->decrement('stock', $newQuantity);

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
                    'stock_before' => $product->stock + $newQuantity,
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
