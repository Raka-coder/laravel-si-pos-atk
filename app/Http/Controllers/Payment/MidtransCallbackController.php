<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\MidtransService;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransCallbackController extends Controller
{
    public function handleNotification(Request $request): JsonResponse
    {
        Log::info('Midtrans Notification Received', [
            'payload' => $request->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $notification = $request->all();

        try {
            $midtransService = app(MidtransService::class);
            $result = $midtransService->handleNotification($notification);

            if ($result['success']) {
                Log::info('Midtrans payment processed', [
                    'order_id' => $result['order_id'],
                    'status' => $result['status'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Notification processed',
                ]);
            }

            Log::warning('Midtrans notification processing failed', $result);

            $statusCode = ($result['message'] ?? '') === 'Invalid signature key' ? 403 : 400;

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Processing failed',
            ], $statusCode);
        } catch (\Exception $e) {
            Log::error('Midtrans callback error', [
                'error' => $e->getMessage(),
                'notification' => $notification,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
            ], 500);
        }
    }

    public function handleRedirect(Request $request): RedirectResponse
    {
        $orderId = $request->input('order_id');
        $status = $request->input('status');

        $transaction = Transaction::where('receipt_number', $orderId)->first();

        if (! $transaction) {
            return redirect()->route('pos')
                ->with('error', 'Transaction not found');
        }

        if ($status === 'success' || $status === 'settlement') {
            if ($transaction->payment_status !== 'paid') {
                app(TransactionService::class)->confirmPayment($transaction);
            }

            return redirect()->route('transactions.show', $transaction->id)
                ->with('success', 'Payment successful!');
        }

        return redirect()->route('pos')
            ->with('error', 'Payment failed or cancelled.');
    }
}
