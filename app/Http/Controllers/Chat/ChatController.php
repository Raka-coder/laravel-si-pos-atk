<?php

namespace App\Http\Controllers\Chat;

use App\Models\ChatbotConversation;
use App\Models\ChatbotMessage;
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
            'conversation_id' => 'nullable|integer',
        ]);

        $message = $request->input('message');
        $conversationId = $request->input('conversation_id');
        $user = $request->user();

        try {
            $result = $agent->sendMessage(
                $message,
                $user?->id,
                $conversationId
            );

            $conversation = ChatbotConversation::where('user_id', $user?->id)
                ->orderBy('created_at', 'desc')
                ->first();

            return response()->json([
                'success' => true,
                'response' => $result['response'],
                'used_tool' => $result['used_tool'],
                'tool_used' => $result['tool_used'],
                'conversation_id' => $conversation?->id,
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

    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = ChatbotConversation::where('user_id', $user->id)
            ->withCount('messages')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($conv) {
                return [
                    'id' => $conv->id,
                    'title' => $conv->title,
                    'message_count' => $conv->messages_count,
                    'created_at' => $conv->created_at->toIso8601String(),
                    'has_tool_usage' => $conv->hasUsedTools(),
                ];
            });

        return response()->json([
            'success' => true,
            'conversations' => $conversations,
        ]);
    }

    public function showConversation(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $conversation = ChatbotConversation::where('id', $id)
            ->where('user_id', $user->id)
            ->with('messages')
            ->firstOrFail();

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'role' => $msg->role,
                    'content' => $msg->content,
                    'used_tool' => $msg->used_tool,
                    'tool_used' => $msg->tool_used,
                    'created_at' => $msg->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'created_at' => $conversation->created_at->toIso8601String(),
            ],
            'messages' => $messages,
        ]);
    }

    public function deleteConversation(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $conversation = ChatbotConversation::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $conversation->messages()->delete();
        $conversation->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function clearOldConversations(Request $request): JsonResponse
    {
        $user = $request->user();
        $days = $request->input('days', 30);

        $cutoffDate = now()->subDays($days);

        $deleted = ChatbotConversation::where('user_id', $user->id)
            ->where('created_at', '<', $cutoffDate)
            ->with('messages')
            ->get()
            ->tap(function ($convs) {
                $convs->map(function ($conv) {
                    $conv->messages()->delete();
                    $conv->delete();
                });
            })
            ->count();

        return response()->json([
            'success' => true,
            'deleted_count' => $deleted,
        ]);
    }

    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalConversations = ChatbotConversation::where('user_id', $user->id)->count();
        $totalMessages = ChatbotMessage::whereHas('conversation', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();

        $withToolUsage = ChatbotMessage::whereHas('conversation', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->where('used_tool', true)
            ->count();

        $last30Days = ChatbotConversation::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_conversations' => $totalConversations,
                'total_messages' => $totalMessages,
                'conversations_with_tool_usage' => $withToolUsage,
                'conversations_last_30_days' => $last30Days,
            ],
        ]);
    }
}
