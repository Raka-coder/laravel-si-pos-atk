<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $perPage = 10;

        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => [
                'data' => $users->getCollection()->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_active' => $user->is_active,
                    'role' => $user->roles->first()?->name ?? 'cashier',
                    'created_at' => $user->created_at->toISOString(),
                ])->values(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'roles' => Role::all()->pluck('name')->values()->toArray(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $role = $request->input('role', 'cashier');

        if (! in_array($role, ['owner', 'cashier'])) {
            $role = 'cashier';
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $user->assignRole($role);

        Log::info('User created', [
            'user_id' => auth()->id(),
            'new_user_id' => $user->id,
            'new_user_name' => $user->name,
            'role' => $role,
        ]);

        return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $oldData = $user->only(['name', 'email', 'is_active']);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->boolean('is_active'),
        ]);

        if ($request->password) {
            $user->update(['password' => $request->password]);
        }

        if ($request->has('role')) {
            $role = $request->role;
            if (in_array($role, ['owner', 'cashier'])) {
                $user->syncRoles($role);
            }
        }

        Log::info('User updated', [
            'user_id' => auth()->id(),
            'updated_user_id' => $user->id,
            'old_data' => $oldData,
            'new_data' => $user->only(['name', 'email', 'is_active']),
        ]);

        return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        $userName = $user->name;
        $user->delete();

        Log::info('User deleted', [
            'user_id' => auth()->id(),
            'deleted_user_name' => $userName,
        ]);

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }

    public function toggleActive(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('users.index')->with('error', 'Tidak dapat menonaktifkan akun sendiri.');
        }

        $user->update(['is_active' => (bool) ! $user->is_active]);

        Log::info('User status toggled', [
            'user_id' => auth()->id(),
            'target_user_id' => $user->id,
            'new_status' => $user->is_active,
        ]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->route('users.index')->with('success', "User berhasil {$status}.");
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user->update(['password' => $request->password]);

        Log::info('User password reset', [
            'user_id' => auth()->id(),
            'target_user_id' => $user->id,
        ]);

        return redirect()->route('users.index')->with('success', 'Password user berhasil direset.');
    }
}
