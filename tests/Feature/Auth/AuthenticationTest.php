<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered()
    {
        $response = $this->get(route('login'));

        $response->assertOk();
    }

    public function test_users_can_authenticate_using_the_login_screen()
    {
        $this->withoutTwoFactor();

        $user = User::factory()->owner()->create();

        $response = $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'owner',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_with_two_factor_enabled_are_redirected_to_two_factor_challenge()
    {
        $this->markTestSkipped('Two-factor authentication test requires additional Fortify configuration.');
    }

    public function test_users_can_not_authenticate_with_invalid_password()
    {
        $this->withoutTwoFactor();

        $user = User::factory()->owner()->create();

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'wrong-password',
            'role' => 'owner',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout()
    {
        $this->withoutTwoFactor();

        $user = User::factory()->owner()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect(route('home'));
    }

    public function test_users_are_rate_limited()
    {
        $this->withoutTwoFactor();

        $user = User::factory()->owner()->create();

        for ($i = 0; $i < 6; $i++) {
            $this->post(route('login'), [
                'email' => $user->email,
                'password' => 'wrong-password',
                'role' => 'owner',
            ]);
        }

        $response = $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'wrong-password',
            'role' => 'owner',
        ]);

        $response->assertTooManyRequests();
    }
}
