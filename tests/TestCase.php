<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Ensure proper exception handling for tests
        $this->withExceptionHandling();

        // Start session for CSRF token generation
        if (! $this->app['session']->isStarted()) {
            $this->app['session']->start();
        }
    }

    /**
     * Make a POST request with CSRF token included.
     */
    protected function postWithCsrf(string $url, array $data = [])
    {
        return $this->withHeaders([
            'X-CSRF-TOKEN' => csrf_token(),
        ])->post($url, $data);
    }

    /**
     * Make a PATCH request with CSRF token included.
     */
    protected function patchWithCsrf(string $url, array $data = [])
    {
        return $this->withHeaders([
            'X-CSRF-TOKEN' => csrf_token(),
        ])->patch($url, $data);
    }

    /**
     * Make a DELETE request with CSRF token included.
     */
    protected function deleteWithCsrf(string $url, array $data = [])
    {
        return $this->withHeaders([
            'X-CSRF-TOKEN' => csrf_token(),
        ])->delete($url, $data);
    }

    /**
     * Make a PUT request with CSRF token included.
     */
    protected function putWithCsrf(string $url, array $data = [])
    {
        return $this->withHeaders([
            'X-CSRF-TOKEN' => csrf_token(),
        ])->put($url, $data);
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }

    protected function withoutTwoFactor(): void
    {
        config(['fortify.features' => [
            Features::registration(),
            Features::resetPasswords(),
            Features::emailVerification(),
        ]]);
    }
}
