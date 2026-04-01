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
        Schema::create('shop_settings', function (Blueprint $table) {
            $table->id();
            $table->string('shop_name')->default('Toko ATK');
            $table->text('address')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('npwp')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('qris_image_path')->nullable();
            $table->string('midtrans_merchant_id')->nullable();
            $table->decimal('tax_rate', 5, 2)->default(11.00);
            $table->text('receipt_footer')->nullable();
            $table->string('paper_size')->default('mm_80');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_settings');
    }
};
