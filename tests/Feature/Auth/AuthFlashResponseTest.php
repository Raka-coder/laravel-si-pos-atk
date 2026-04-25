<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFlashResponseTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_login_sets_success_flash_message(): void
    {
        $this->withoutTwoFactor();

        $user = User::factory()->owner()->create();

        $response = $this->postWithCsrf(route('login'), [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'owner',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $response->assertSessionHas('success', 'Login berhasil.');
    }

    public function test_logout_sets_success_flash_message(): void
    {
        $this->withoutTwoFactor();

        $user = User::factory()->owner()->create();

        $this->actingAs($user);

        $response = $this->postWithCsrf(route('logout'));

        $response->assertRedirect('/');
        $response->assertSessionHas('success', 'Logout berhasil.');
    }
}
