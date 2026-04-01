<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;

class AttemptAuthentication
{
    public function __invoke(?string $guard = null)
    {
        return function ($request) use ($guard) {
            $request->validate([
                Fortify::username() => 'required|string|email',
                'password' => 'required|string',
                'role' => 'required|string|in:owner,cashier',
            ]);

            $credentials = $request->only(Fortify::username(), 'password');
            $credentials['is_active'] = true;

            $user = User::where('email', $request->{Fortify::username()})->first();

            if (! $user) {
                throw ValidationException::withMessages([
                    Fortify::username() => __('The provided credentials are incorrect.'),
                ]);
            }

            if (! $user->hasRole($request->role)) {
                throw ValidationException::withMessages([
                    'role' => __('Akun ini bukan '.($request->role === 'owner' ? 'Owner' : 'Cashier').'.'),
                ]);
            }

            if (! $user->is_active) {
                throw ValidationException::withMessages([
                    'email' => __('Akun Anda tidak aktif. Hubungi administrator.'),
                ]);
            }

            $guard = $guard ?: config('fortify.guard', 'web');

            if (! \Auth::guard($guard)->attempt($credentials, $request->filled('remember'))) {
                throw ValidationException::withMessages([
                    Fortify::username() => __('The provided credentials are incorrect.'),
                ]);
            }

            return $user;
        };
    }
}
