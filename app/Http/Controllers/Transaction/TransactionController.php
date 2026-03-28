<?php

namespace App\Http\Controllers\Transaction;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\TransactionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    public function index(): Response
    {
        $transactions = Transaction::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('transaction/index', [
            'transactions' => $transactions,
        ]);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $data = [
            'items' => $request->input('items', []),
            'subtotal' => $request->input('subtotal'),
            'discount_amount' => $request->input('discount_amount', 0),
            'tax_amount' => $request->input('tax_amount'),
            'total_price' => $request->input('total_price'),
            'payment_method' => $request->input('payment_method'),
            'amount_paid' => $request->input('amount_paid'),
            'change_amount' => $request->input('change_amount'),
            'note' => $request->input('note'),
        ];

        if (empty($data['items'])) {
            return back()->with('error', 'No items in cart');
        }

        $transaction = $this->transactionService->createTransaction($data);

        return to_route('transactions.show', $transaction->id);
    }

    public function show(Transaction $transaction): Response
    {
        $transaction->load(['user', 'items.product']);

        return Inertia::render('transaction/show', [
            'transaction' => $transaction,
        ]);
    }

    public function receipt(Transaction $transaction)
    {
        $transaction->load(['user', 'items.product']);

        $pdf = Pdf::loadView('receipts.transaction', [
            'transaction' => $transaction,
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

        return Inertia::render('pos/index', [
            'products' => $products,
            'taxRate' => TransactionService::TAX_RATE * 100,
        ]);
    }
}
