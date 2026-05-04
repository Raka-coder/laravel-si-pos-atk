<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShopSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'shop_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'npwp' => 'nullable|string|max:50',
            'logo' => 'nullable|mimes:jpg,jpeg,png,gif,webp,svg+xml|max:2048',
            'qris_image' => 'nullable|image|max:2048',
            'remove_logo' => 'nullable|string',
            'remove_qris' => 'nullable|string',
            'midtrans_merchant_id' => 'nullable|string|max:100',
            'midtrans_client_key' => 'nullable|string|max:200',
            'midtrans_server_key' => 'nullable|string|max:200',
            'midtrans_is_production' => 'nullable|boolean',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'receipt_footer' => 'nullable|string',
            'paper_size' => 'required|string|in:mm_58,mm_80',
        ];
    }
}
