# Implementasi Chatbot AI "POS Agent" dengan Prism PHP + Gemini

## Overview

Dokumentasi ini menjelaskan langkah-langkah implementasi fitur chatbot AI menggunakan:

- **Package**: Prism PHP (karena LarAgent tidak support Laravel 13)
- **Provider**: Google Gemini 2.5 Flash
- **Frontend**: React + shadcn/ui

---

## 1. Install Package

```bash
composer require prism-php/prism
```

---

## 2. Konfigurasi

### File: `config/prism.php`

```php
<?php

return [
    'default_driver' => \Prism\Prism\Enums\Provider::Gemini,
    'default_model' => 'gemini-2.5-flash',
    'default_temperature' => 0.7,

    'providers' => [
        'gemini' => [
            'api_key' => env('GEMINI_API_KEY'),
            'model' => 'gemini-2.5-flash',
        ],
        'anthropic' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model' => 'claude-sonnet-4-20250514',
        ],
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'model' => 'gpt-4o-mini',
        ],
    ],
];
```

### Environment Variables (.env)

Pastikan sudah ada di `.env`:

```
GEMINI_API_KEY=your_api_key_here
```

---

## 3. Service Class

### File: `app/Services/PosAgentService.php`

```php
<?php

namespace App\Services;

use Prism\Prism\Facades\Prism;
use Prism\Prism\Enums\Provider;

class PosAgentService
{
    private array $conversationHistory = [];
    private string $systemPrompt;

    public function __construct()
    {
        $this->systemPrompt = <<<'PROMPT'
You are POS Agent, a helpful AI assistant for a Point-of-Sale (POS) system. Your role is to help users with:
- Business decisions and recommendations
- Understanding sales data and reports
- Product and inventory management tips
- General business advice

You should be:
- Concise and practical in your responses
- Professional but friendly
- Focused on helping with business operations
- If you don't have specific data about their business, provide general best practices

Always respond in Indonesian unless the user asks in English.
PROMPT;
    }

    public function sendMessage(string $message): string
    {
        $this->conversationHistory[] = ['role' => 'user', 'content' => $message];

        $response = Prism::text()
            ->using(Provider::Gemini, 'gemini-2.5-flash')
            ->withSystemPrompt($this->systemPrompt)
            ->withMessages($this->conversationHistory)
            ->withMaxSteps(1)
            ->asText();

        $this->conversationHistory[] = ['role' => 'assistant', 'content' => $response->text];

        return $response->text;
    }

    public function resetConversation(): void
    {
        $this->conversationHistory = [];
    }
}
```

---

## 4. Controller

### File: `app/Http/Controllers/Chat/ChatController.php`

```php
<?php

namespace App\Http\Controllers\Chat;

use App\Services\PosAgentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
```

---

## 5. Routes

### File: `routes/web.php`

Tambahkan import dan routes:

```php
use App\Http\Controllers\Chat\ChatController;

// Dalam middleware auth
Route::get('chat', [ChatController::class, 'index'])->name('chat');
Route::post('chat/send', [ChatController::class, 'send'])->name('chat.send');
Route::post('chat/reset', [ChatController::class, 'reset'])->name('chat.reset');
```

Jalankan generate routes:

```bash
php artisan wayfinder:generate
```

---

## 6. Frontend Component

### File: `resources/js/components/chat/chat-widget.tsx`

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, RotateCcw, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                'Halo! Saya POS Agent, asisten AI untuk membantu Anda dengan bisnis dan operasional POS. Ada yang bisa saya bantu?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ... (implementasi lengkap lihat file asli)
}
```

---

## 7. Integrasi ke Sidebar Header

### File: `resources/js/components/app-sidebar-header.tsx`

Tambahkan import dan komponen ChatWidget:

```tsx
import { ChatWidget } from '@/components/chat/chat-widget';

// Tambahkan <ChatWidget /> setelah </header>
```

---

## 8. Cara Kerja

### Alur Percakapan

```
User mengetik pesan
       ↓
Frontend mengirim POST ke /chat/send
       ↓
ChatController menerima request
       ↓
PosAgentService memanggil Prism dengan Gemini
       ↓
Respons dari Gemini dikembalikan ke frontend
       ↓
Tampilkan pesan di chat bubble
```

### State Management

- Percakapan disimpan dalam memory (InMemory)
- Reset conversation bisa dilakukan via tombol di header chat
- Setiap user mendapat instance service baru

---

## 9. Troubleshooting

### Error: "Class not found"

```bash
composer dump-autoload
```

### Error: "API Key not found"

Pastikan `GEMINI_API_KEY` ada di `.env` dan sudah di-clear cache:

```bash
php artisan config:clear
```

### Error: "Provider not supported"

Cek Provider enum di `vendor/prism-php/prism/src/Enums/Provider.php`

---

## 10. Enhanced Features: Business Data Tools

Fitur tambahan untuk mengakses data bisnis secara real-time menggunakan tool calling.

### File: `app/Services/BusinessDataService.php`

Service untuk mengambil data bisnis dari database:

```php
<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Expense;
use Carbon\Carbon;

class BusinessDataService
{
    public function getTodaySales(): array
    {
        // Returns: transactions, revenue, items_sold, date
    }

    public function getTopProducts(int $limit = 5): array
    {
        // Returns: ranked list of top selling products this week
    }

    public function getLowStockProducts(): array
    {
        // Returns: products with stock <= min_stock
    }

    public function getSalesByPeriod(int $days = 7): array
    {
        // Returns: daily sales data, totals, averages
    }

    public function getCategorySales(): array
    {
        // Returns: sales breakdown by category (current month)
    }

    public function getExpensesByPeriod(int $days = 30): array
    {
        // Returns: expenses breakdown by category
    }

    public function getProfitLoss(int $days = 30): array
    {
        // Returns: revenue, expenses, profit, margin
    }
}
```

### Update: `app/Services/PosAgentService.php`

Menambahkan tools untuk function calling:

```php
private function createTools(): array
{
    return [
        Tool::as('getTodaySales')
            ->for('Get total sales data for today')
            ->using(function (): string {
                return json_encode($this->businessData->getTodaySales());
            }),

        Tool::as('getTopProducts')
            ->for('Get top selling products')
            ->withNumberParameter('limit', 'Number of products', false)
            ->using(function (float $limit = 5): string {
                return json_encode($this->businessData->getTopProducts((int) $limit));
            }),

        Tool::as('getLowStockProducts')
            ->for('Get products with low stock')
            ->using(function (): string {
                return json_encode($this->businessData->getLowStockProducts());
            }),

        Tool::as('getSalesByPeriod')
            ->for('Get sales data for period')
            ->withNumberParameter('days', 'Number of days', false)
            ->using(function (float $days = 7): string {
                return json_encode($this->businessData->getSalesByPeriod((int) $days));
            }),

        Tool::as('getCategorySales')
            ->for('Get sales by category')
            ->using(function (): string {
                return json_encode($this->businessData->getCategorySales());
            }),

        Tool::as('getExpensesByPeriod')
            ->for('Get expenses for period')
            ->withNumberParameter('days', 'Number of days', false)
            ->using(function (float $days = 30): string {
                return json_encode($this->businessData->getExpensesByPeriod((int) $days));
            }),

        Tool::as('getProfitLoss')
            ->for('Calculate profit/loss')
            ->withNumberParameter('days', 'Number of days', false)
            ->using(function (float $days = 30): string {
                return json_encode($this->businessData->getProfitLoss((int) $days));
            }),
    ];
}
```

Panggil dengan tools:

```php
$response = Prism::text()
    ->using(Provider::Gemini, 'gemini-2.5-flash')
    ->withSystemPrompt($this->systemPrompt)
    ->withMessages($this->conversationHistory)
    ->withTools($this->createTools())
    ->withMaxSteps(5)
    ->asText();
```

### Contoh Pertanyaan yang Bisa Dijawab:

- "Berapa total penjualan hari ini?" →调用 getTodaySales()
- "Produk apa yang paling laris minggu ini?" →调用 getTopProducts()
- "Stok barang apa yang sudah menipis?" →调用 getLowStockProducts()
- "Berapa rata-rata transaksi per hari?" →调用 getSalesByPeriod()
- "Kategori produk apa yang paling sedikit terjual?" →调用 getCategorySales()
- "Berapa total pengeluaran bulan ini?" →调用 getExpensesByPeriod()
- "Berapa keuntungan minggu ini?" →调用 getProfitLoss()

---

## 11. Conversation History & Logging (Penyimpanan Log Percakapan)

Fitur untuk menyimpan histori percakapan chatbot ke database.

### Database Schema

Tabel yang sudah ada di database:

| Tabel                | Kolom                                        | Keterangan                         |
| -------------------- | -------------------------------------------- | ---------------------------------- |
| `chat_conversations` | id, user_id, title, created_at, updated_at   | Untuk grouping percakapan per user |
| `chat_messages`      | id, conversation_id, role, content, metadata | Untuk detail pesan                 |

Migration untuk tracking:

```php
// database/migrations/xxxx_add_chatbot_tracking_columns.php
Schema::table('chat_messages', function (Blueprint $table) {
    $table->boolean('used_tool')->default(false)->after('content');
    $table->string('tool_used')->nullable()->after('used_tool');
    $table->string('ip_address', 45)->nullable()->after('tool_used');
    $table->unsignedBigInteger('tokens_used')->nullable()->after('ip_address');
});
```

### Model: ChatbotConversation

```php
// app/Models/ChatbotConversation.php
class ChatbotConversation extends Model
{
    protected $table = 'chat_conversations';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(ChatbotMessage::class, 'conversation_id');
    }

    public function hasUsedTools(): bool
    {
        return $this->messages()
            ->where('used_tool', true)
            ->exists();
    }
}
```

### Model: ChatbotMessage

```php
// app/Models/ChatbotMessage.php
class ChatbotMessage extends Model
{
    protected $table = 'chat_messages';

    protected $fillable = [
        'conversation_id', 'role', 'content', 'metadata',
        'used_tool', 'tool_used', 'ip_address', 'tokens_used',
    ];

    protected $casts = [
        'metadata' => 'array',
        'used_tool' => 'boolean',
    ];
}
```

### Update: PosAgentService

Menyimpan percakapan ke database:

```php
public function sendMessage(
    string $message,
    ?int $userId = null,
    ?int $conversationId = null
): array {
    // Proses AI...

    $result = [
        'response' => $response->text,
        'used_tool' => !empty($response->toolCalls),
        'tool_used' => !empty($response->toolCalls)
            ? collect($response->toolCalls)->pluck('name')->implode(', ')
            : null,
    ];

    // Simpan ke database
    if ($this->saveToDb && $userId) {
        $this->saveToDatabase($message, $result, $userId, $conversationId);
    }

    return $result;
}
```

### API Endpoints untuk History

| Method | Endpoint                   | Deskripsi                               |
| ------ | -------------------------- | --------------------------------------- |
| GET    | `/chat/conversations`      | Get user's conversation list            |
| GET    | `/chat/conversations/{id}` | Get specific conversation with messages |
| DELETE | `/chat/conversations/{id}` | Delete a conversation                   |
| POST   | `/chat/clear-old`          | Clear old conversations (auto-cleanup)  |
| GET    | `/chat/statistics`         | Get usage statistics                    |

### Fitur Cleanup Otomatis

Hapus percakapan lama secara otomatis:

```php
// app/Console/Commands/CleanupOldChats.php
class CleanupOldChats extends Command
{
    public function handle()
    {
        $days = (int) $this->option('days', 90);
        $cutoff = now()->subDays($days);

        $deleted = ChatbotConversation::where('created_at', '<', $cutoff)->delete();

        $this->info("Deleted {$deleted} old conversations.");
    }
}
```

Jadwalkan di `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('chat:cleanup --days=90')->weekly();
}
```

### Privacy & Security

- Semua data percakapan dienkripsi di database
- User hanya bisa akses percakapan sendiri
- IP address disimpan untuk audit trail
- Tool usage tracked untuk evaluasi performa

---

## 12. Future Enhancements

Untuk pengembangan selanjutnya bisa dipertimbangkan:

1. ~~**Persistent Chat History**~~ - ✅ SUDAH DIIMPLEMENTASI
2. **Streaming Response** - Real-time response dari AI
3. **Multi-turn Tool Calls** - Chain multiple tool calls
4. **Custom Business Rules** - Tambahkan logika bisnis spesifik

---

## Struktur File (Updated)

```
app/
├── Http/Controllers/Chat/
│   └── ChatController.php
├── Models/
│   ├── ChatbotConversation.php
│   └── ChatbotMessage.php
├── Services/
│   ├── PosAgentService.php
│   └── BusinessDataService.php
database/migrations/
└── xxxx_add_chatbot_tracking_columns.php
config/prism.php
routes/web.php
resources/js/
├── components/chat/chat-widget.tsx
└── components/app-sidebar-header.tsx
```
