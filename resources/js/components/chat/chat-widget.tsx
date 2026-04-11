'use client';

import { MessageCircle, X, Send, RotateCcw, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) {
            return;
        } 

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({ message: userMessage.content }),
            });

            const data = await response.json();

            if (data.success) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.response,
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async () => {
        try {
            await fetch('/chat/reset', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
            });
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content:
                        'Percakapan telah direset. Ada yang bisa saya bantu?',
                },
            ]);
        } catch {
            // Ignore reset errors
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(true)}
                size="icon-lg"
                className={cn(
                    'fixed right-6 bottom-6 z-50 rounded-full shadow-lg transition-all hover:scale-105',
                    isOpen && 'hidden',
                )}
                aria-label="Buka chat"
            >
                <MessageCircle className="h-5 w-5" />
            </Button>

            {/* Chat Dialog */}
            {isOpen && (
                <div className="fixed right-6 bottom-6 z-50 w-full max-w-100 overflow-hidden rounded-xl border bg-background shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-semibold">POS Agent</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleReset}
                                className="rounded p-1 hover:bg-white/20"
                                aria-label="Reset percakapan"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded p-1 hover:bg-white/20"
                                aria-label="Tutup chat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex h-100 flex-col overflow-y-auto p-4">
                        <div className="flex flex-col gap-3">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex gap-2',
                                        message.role === 'user' &&
                                            'flex-row-reverse',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted',
                                        )}
                                    >
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted',
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0.2s]"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 border-t p-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pesan..."
                            className="flex min-h-10 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            rows={1}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
