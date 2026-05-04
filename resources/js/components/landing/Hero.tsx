import { Link } from '@inertiajs/react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
    return (
        <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-16">
            <div className="z-10 flex w-full max-w-7xl flex-col items-center text-center">
                <span className="sr-only">Welcome to POS ATK-Sync</span>
                {/* Badge */}
                <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-md">
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                        V2.0 is now live
                    </span>
                </div>

                {/* Headline */}
                <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                    Smarter Retail, <br />
                    
                    <span className="bg-linear-to-r from-primary to-indigo-600 bg-clip-text text-transparent dark:to-indigo-400">
                        Welcome to PoS ATK-Sync
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="mb-10 max-w-2xl text-lg text-muted-foreground">
                    The ultimate point-of-sale solution for ATK businesses.
                    Manage inventory, track sales with AI, and accept payments
                    with ease.
                </p>

                {/* CTAs */}
                <div className="mb-16 flex flex-wrap justify-center gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="h-14 rounded-2xl px-8 text-lg font-semibold shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
                    >
                        <Link href="/login" className="flex items-center gap-2">
                            Start Free Trial
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-14 rounded-2xl border-white/20 bg-white/40 px-8 text-lg font-semibold backdrop-blur-xl transition-transform hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black/20"
                    >
                        <Play className="mr-0.5 h-5 w-5 fill-primary text-primary" />
                        Watch Demo
                    </Button>
                </div>

                {/* Dashboard Mockup */}
                <div className="group perspective-1000 relative w-full max-w-5xl px-4">
                    <div className="relative transform-gpu transition-all duration-700 ease-out hover:scale-[1.02] hover:rotate-x-2 hover:rotate-y-1">
                        {/* Glassmorphic Mockup Container */}
                        <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/70 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/50">
                            <div className="aspect-16/10 overflow-hidden rounded-2xl bg-background">
                                {/* Simplified Dashboard Content Simulation */}
                                <div className="flex h-full w-full flex-col p-6">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                                            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
                                        </div>
                                    </div>
                                    <div className="mb-8 grid grid-cols-3 gap-6">
                                        {[
                                            {
                                                color: 'bg-blue-500/10',
                                                border: 'border-blue-500/20',
                                                text: 'bg-blue-500/30',
                                            },
                                            {
                                                color: 'bg-emerald-500/10',
                                                border: 'border-emerald-500/20',
                                                text: 'bg-emerald-500/30',
                                            },
                                            {
                                                color: 'bg-teal-500/10',
                                                border: 'border-teal-500/20',
                                                text: 'bg-teal-500/30',
                                            },
                                        ].map((card, i) => (
                                            <div
                                                key={i}
                                                className={`h-32 rounded-2xl border ${card.border} ${card.color} p-4`}
                                            >
                                                <div
                                                    className={`h-4 w-1/2 rounded ${card.text} mb-4`}
                                                />
                                                <div
                                                    className={`h-8 w-3/4 rounded ${card.text} opacity-50`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 rounded-2xl border border-primary/10 bg-primary/5 p-6">
                                        <div className="mb-6 h-6 w-1/4 rounded bg-primary/20" />
                                        <div className="flex h-32 items-end gap-2">
                                            {[
                                                40, 70, 45, 90, 65, 80, 50, 60,
                                                85, 40,
                                            ].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 rounded-t-lg bg-primary/30 transition-all duration-1000"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Decorative Elements */}
                        <div className="animate-float-slow absolute -top-12 -right-12 hidden h-24 w-48 items-center gap-3 rounded-2xl border border-white/30 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-xl sm:flex dark:border-white/10 dark:bg-black/60">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">
                                    Payment Success
                                </span>
                                <span className="text-xs tracking-tight text-muted-foreground">
                                    Rp 250.000
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
