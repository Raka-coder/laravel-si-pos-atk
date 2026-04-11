<?php

namespace App\Http\Controllers\Chat;

use App\Services\PosAgentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController
{
    public function index()
    {
        return inertia('Chat/Index');
    }

    public function send(Request $request, PosAgentService $agent): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $message = $request->input('message');

        try {
            $response = $agent->sendMessage($message);

            return response()->json([
                'success' => true,
                'response' => $response,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function reset(Request $request, PosAgentService $agent): JsonResponse
    {
        $agent->resetConversation();

        return response()->json([
            'success' => true,
        ]);
    }
}
