<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'activate_users',
            'deactivate_users',
            'view_roles',
            'view_products',
            'create_products',
            'edit_products',
            'delete_products',
            'view_categories',
            'create_categories',
            'edit_categories',
            'delete_categories',
            'view_units',
            'create_units',
            'edit_units',
            'delete_units',
            'create_transactions',
            'view_transactions',
            'view_stock_movements',
            'view_expenses',
            'create_expenses',
            'edit_expenses',
            'delete_expenses',
            'view_reports',
            'export_reports',
            'view_settings',
            'edit_shop_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $ownerRole = Role::create(['name' => 'owner']);
        $ownerRole->givePermissionTo(Permission::all());

        $cashierRole = Role::create(['name' => 'cashier']);
        $cashierRole->givePermissionTo([
            'create_transactions',
            'view_transactions',
        ]);

        $user = User::factory()->create([
            'name' => 'Owner',
            'email' => 'owner@atk-sync.com',
            'password' => 'password',
            'is_active' => true,
        ]);
        $user->assignRole('owner');

        $user = User::factory()->create([
            'name' => 'Cashier',
            'email' => 'cashier@atk-sync.com',
            'password' => 'password',
            'is_active' => true,
        ]);
        $user->assignRole('cashier');
    }
}
