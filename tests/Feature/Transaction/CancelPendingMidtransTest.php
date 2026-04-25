<?php

namespace Tests\Feature\Transaction;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CancelPendingMidtransTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_midtrans_transaction_can_be_cancelled(): void
    {
        $user = User::factory()->owner()->create();

        $transaction = Transaction::factory()->create([
            'payment_method' => 'midtrans',
            'payment_status' => 'pending',
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson(route('transactions.cancel-midtrans', $transaction));

        $response->assertOk()->assertJson([
            'success' => true,
            'transaction_id' => $transaction->id,
            'cancelled' => true,
        ]);

        $this->assertDatabaseMissing('transactions', [
            'id' => $transaction->id,
        ]);
    }

    public function test_non_pending_midtrans_transaction_cannot_be_cancelled(): void
    {
        $user = User::factory()->owner()->create();

        $transaction = Transaction::factory()->create([
            'payment_method' => 'midtrans',
            'payment_status' => 'paid',
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson(route('transactions.cancel-midtrans', $transaction));

        $response->assertStatus(422)->assertJson([
            'success' => false,
            'message' => 'Only pending Midtrans transactions can be cancelled.',
        ]);

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'payment_status' => 'paid',
        ]);
    }

    public function test_non_midtrans_transaction_cannot_be_cancelled_with_midtrans_endpoint(): void
    {
        $user = User::factory()->owner()->create();

        $transaction = Transaction::factory()->create([
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson(route('transactions.cancel-midtrans', $transaction));

        $response->assertStatus(422)->assertJson([
            'success' => false,
            'message' => 'Transaction is not a Midtrans payment.',
        ]);

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'payment_method' => 'cash',
        ]);
    }
}
