<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateShopSettingRequest;
use App\Models\ShopSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
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

    public function update(UpdateShopSettingRequest $request): RedirectResponse
    {
        $shop = ShopSetting::getShop();

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($shop->logo_path) {
                Storage::disk('public')->delete($shop->logo_path);
            }
            $path = $request->file('logo')->store('shop', 'public');
            $data['logo_path'] = $path;
        } elseif ($request->input('remove_logo') === '1') {
            if ($shop->logo_path) {
                Storage::disk('public')->delete($shop->logo_path);
            }
            $data['logo_path'] = null;
        }

        if ($request->hasFile('qris_image')) {
            if ($shop->qris_image_path) {
                Storage::disk('public')->delete($shop->qris_image_path);
            }
            $path = $request->file('qris_image')->store('shop', 'public');
            $data['qris_image_path'] = $path;
        } elseif ($request->input('remove_qris') === '1') {
            if ($shop->qris_image_path) {
                Storage::disk('public')->delete($shop->qris_image_path);
            }
            $data['qris_image_path'] = null;
        }

        unset($data['remove_logo'], $data['remove_qris']);

        $shop->update($data);

        return back()->with('success', 'Settings saved successfully.');
    }
}
