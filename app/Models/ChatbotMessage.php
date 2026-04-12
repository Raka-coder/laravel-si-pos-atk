<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotMessage extends Model
{
    protected $table = 'chat_messages';

    public $timestamps = true;

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'metadata',
        'used_tool',
        'tool_used',
        'ip_address',
        'tokens_used',
    ];

    protected $casts = [
        'metadata' => 'array',
        'used_tool' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatbotConversation::class, 'conversation_id');
    }

    public function isFromUser(): bool
    {
        return $this->role === 'user';
    }

    public function isFromAssistant(): bool
    {
        return $this->role === 'assistant';
    }

    public function isFromSystem(): bool
    {
        return $this->role === 'system';
    }

    public function hasToolUsage(): bool
    {
        return $this->used_tool === true;
    }
}
