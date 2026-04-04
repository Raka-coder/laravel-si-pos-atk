<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->index('name');
            $table->index(['name', 'date']);
        });

        Schema::table('expense_categories', function (Blueprint $table) {
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['name', 'date']);
        });

        Schema::table('expense_categories', function (Blueprint $table) {
            $table->dropIndex(['name']);
        });
    }
};
