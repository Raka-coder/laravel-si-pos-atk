<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles')
            ->whereHas('roles', fn ($q) => $q->where('name', 'cashier'))
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('users/index', [
            'users' => $users->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at->toISOString(),
            ]),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'is_active' => true,
        ]);

        $user->assignRole('cashier');

        Log::info('Kasir created', [
            'user_id' => auth()->id(),
            'kasir_id' => $user->id,
            'kasir_name' => $user->name,
        ]);

        return redirect()->route('users.index')->with('success', 'Kasir berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $oldData = $user->only(['name', 'email', 'is_active']);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->is_active,
        ]);

        if ($request->password) {
            $user->update(['password' => $request->password]);
        }

        Log::info('Kasir updated', [
            'user_id' => auth()->id(),
            'kasir_id' => $user->id,
            'old_data' => $oldData,
            'new_data' => $user->only(['name', 'email', 'is_active']),
        ]);

        return redirect()->route('users.index')->with('success', 'Kasir berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $userName = $user->name;
        $user->delete();

        Log::info('Kasir deleted', [
            'user_id' => auth()->id(),
            'kasir_name' => $userName,
        ]);

        return redirect()->route('users.index')->with('success', 'Kasir berhasil dihapus.');
    }

    public function toggleActive(User $user): RedirectResponse
    {
        $user->update(['is_active' => ! $user->is_active]);

        Log::info('Kasir status toggled', [
            'user_id' => auth()->id(),
            'kasir_id' => $user->id,
            'new_status' => $user->is_active,
        ]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->route('users.index')->with('success', "Kasir berhasil {$status}.");
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user->update(['password' => $request->password]);

        Log::info('Kasir password reset', [
            'user_id' => auth()->id(),
            'kasir_id' => $user->id,
        ]);

        return redirect()->route('users.index')->with('success', 'Password kasir berhasil direset.');
    }
}
