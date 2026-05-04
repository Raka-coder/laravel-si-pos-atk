'use client';

import { X, Send, RotateCcw, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatWidgetProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const autoResizeTextarea = useCallback(() => {
        const textarea = textareaRef.current;

        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleClose = () => {
        onToggle();
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        autoResizeTextarea();
    }, [input, autoResizeTextarea]);

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
            {/* Chat Dialog */}
            {isOpen && (
                <Card
                    size="sm"
                    className="fixed right-6 bottom-6 z-50 flex w-full max-w-100 flex-col py-0! shadow-2xl"
                >
                    {/* Header */}
                    <CardHeader className="border-b bg-primary px-4 py-3 text-primary-foreground [&:has([data-slot=card-action])]:grid-cols-[1fr_auto]">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 shrink-0" />
                            <div>
                                <div className="font-semibold">POS Agent</div>
                                <div className="text-xs opacity-80">
                                    AI Assistant
                                </div>
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-1"
                            data-slot="card-action"
                        >
                            <Button
                                onClick={handleReset}
                                variant="ghost"
                                size="icon-lg"
                                className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                                aria-label="Reset percakapan"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                onClick={handleClose}
                                variant="ghost"
                                size="icon-lg"
                                className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
                                aria-label="Tutup chat"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent
                        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
                        style={{ minHeight: '400px', maxHeight: '400px' }}
                    >
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
                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted',
                                    )}
                                >
                                    {message.role === 'user' ? (
                                        <User className="h-3.5 w-3.5" />
                                    ) : (
                                        <Bot className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        'max-w-[80%] rounded-lg px-3 py-2 text-xs/relaxed',
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
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0.2s]"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input */}
                    <CardFooter className="flex items-end gap-2 border-t px-4 py-3">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type Message..."
                            className="max-h-30 min-h-10 resize-none py-2 text-xs/relaxed"
                            rows={1}
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon-lg"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </>
    );
}
