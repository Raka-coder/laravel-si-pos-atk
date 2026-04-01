<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ShopSetting;
use App\Models\Transaction;
use App\Services\TransactionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('transaction/index', [
            'transactions' => $transactions,
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

        return Inertia::render('transaction/show', [
            'transaction' => $transaction,
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
}
