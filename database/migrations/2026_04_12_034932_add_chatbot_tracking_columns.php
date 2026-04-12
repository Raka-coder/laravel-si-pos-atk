<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->boolean('used_tool')->default(false)->after('content');
            $table->string('tool_used')->nullable()->after('used_tool');
            $table->string('ip_address', 45)->nullable()->after('tool_used');
            $table->unsignedBigInteger('tokens_used')->nullable()->after('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropColumn(['used_tool', 'tool_used', 'ip_address', 'tokens_used']);
        });
    }
};
