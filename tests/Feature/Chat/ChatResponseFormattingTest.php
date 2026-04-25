<?php

namespace Tests\Feature\Chat;

use App\Models\User;
use App\Services\PosAgentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class ChatResponseFormattingTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_response_is_sanitized_from_markdown_and_table_format(): void
    {
        $user = User::factory()->owner()->create();

        $this->mock(PosAgentService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('sendMessage')
                ->once()
                ->andReturn([
                    'response' => "**Ringkasan Penjualan**\n\n| Produk | Qty |\n| --- | --- |\n| Pensil | 10 |",
                    'used_tool' => true,
                    'tool_used' => 'getTodaySales',
                ]);
        });

        $response = $this->actingAs($user)->postJson('/chat/send', [
            'message' => 'ringkasan penjualan hari ini',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'used_tool' => true,
                'tool_used' => 'getTodaySales',
            ]);

        $sanitized = $response->json('response');

        $this->assertIsString($sanitized);
        $this->assertStringNotContainsString('**', $sanitized);
        $this->assertStringNotContainsString('|', $sanitized);
        $this->assertStringContainsString('Ringkasan Penjualan', $sanitized);
        $this->assertStringContainsString('- Produk - Qty', $sanitized);
        $this->assertStringContainsString('- Pensil - 10', $sanitized);
    }
}
