<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatbotConversation extends Model
{
    protected $table = 'chat_conversations';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'title',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatbotMessage::class, 'conversation_id');
    }

    public function latestMessage(): ?ChatbotMessage
    {
        return $this->messages()->latest()->first();
    }

    public function messageCount(): int
    {
        return $this->messages()->count();
    }

    public function hasUsedTools(): bool
    {
        return $this->messages()
            ->where('role', 'assistant')
            ->whereNotNull('metadata')
            ->where(function ($query) {
                $query->where('metadata', 'LIKE', '%"used_tool":true%')
                    ->orWhere('metadata', 'LIKE', '%used_tool";b:1%');
            })
            ->exists();
    }
}
