<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ShopSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopSettingController extends Controller
{
    public function index(): Response
    {
        $shop = ShopSetting::getShop();

        return Inertia::render('shop/index', [
            'shop' => $shop,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $shop = ShopSetting::getShop();

        $data = $request->validate([
            'shop_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'npwp' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048',
            'qris_image' => 'nullable|image|max:2048',
            'remove_logo' => 'nullable|string',
            'remove_qris' => 'nullable|string',
            'midtrans_merchant_id' => 'nullable|string|max:100',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'receipt_footer' => 'nullable|string',
            'paper_size' => 'required|string|in:mm_58,mm_80',
        ]);

        if ($request->hasFile('logo')) {
            if ($shop->logo_path) {
                \Storage::disk('public')->delete($shop->logo_path);
            }
            $path = $request->file('logo')->store('shop', 'public');
            $data['logo_path'] = $path;
        } elseif ($request->input('remove_logo') === '1') {
            if ($shop->logo_path) {
                \Storage::disk('public')->delete($shop->logo_path);
            }
            $data['logo_path'] = null;
        }

        if ($request->hasFile('qris_image')) {
            if ($shop->qris_image_path) {
                \Storage::disk('public')->delete($shop->qris_image_path);
            }
            $path = $request->file('qris_image')->store('shop', 'public');
            $data['qris_image_path'] = $path;
        } elseif ($request->input('remove_qris') === '1') {
            if ($shop->qris_image_path) {
                \Storage::disk('public')->delete($shop->qris_image_path);
            }
            $data['qris_image_path'] = null;
        }

        unset($data['remove_logo'], $data['remove_qris']);

        $shop->update($data);

        return back()->with('success', 'Settings saved successfully.');
    }
}
