import { Link } from '@inertiajs/react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
    return (
        <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-16">
            <div className="z-10 flex w-full max-w-7xl flex-col items-center text-center">
                {/* Badge */}
                <div className="mb-6 flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                        V2.0 is now live
                    </span>
                </div>

                {/* Headline */}
                <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
                    Smarter Retail, <br />
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                        Seamless Payments
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                    The ultimate point-of-sale solution for modern businesses. 
                    Manage inventory, track sales with AI, and accept payments with ease.
                </p>

                {/* CTAs */}
                <div className="mb-16 flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="h-14 rounded-2xl px-8 text-lg font-semibold shadow-xl shadow-indigo-600/20 transition-transform hover:scale-105 active:scale-95 bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/login" className="flex items-center gap-2">
                            Start Free Trial
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="h-14 rounded-2xl border-white/20 bg-white/40 px-8 text-lg font-semibold backdrop-blur-xl transition-transform hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-black/20">
                        <Play className="mr-2 h-5 w-5 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                        Watch Demo
                    </Button>
                </div>

                {/* Dashboard Mockup */}
                <div className="group relative w-full max-w-5xl px-4 perspective-1000">
                    <div className="relative transform-gpu transition-all duration-700 ease-out hover:rotate-x-2 hover:rotate-y-1 hover:scale-[1.02]">
                        {/* Glassmorphic Mockup Container */}
                        <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/70 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/50">
                            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900">
                                {/* Simplified Dashboard Content Simulation */}
                                <div className="flex h-full w-full flex-col p-6">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="h-8 w-32 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse dark:bg-slate-800" />
                                            <div className="h-10 w-24 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-32 rounded-2xl border border-white/40 bg-white/40 p-4 dark:border-white/5 dark:bg-white/5">
                                                <div className="h-4 w-1/2 rounded bg-slate-200 mb-4 dark:bg-slate-800" />
                                                <div className="h-8 w-3/4 rounded bg-slate-300 dark:bg-slate-700" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 rounded-2xl border border-white/40 bg-white/40 p-6 dark:border-white/5 dark:bg-white/5">
                                        <div className="h-6 w-1/4 rounded bg-slate-200 mb-6 dark:bg-slate-800" />
                                        <div className="flex items-end gap-2 h-32">
                                            {[40, 70, 45, 90, 65, 80, 50, 60, 85, 40].map((h, i) => (
                                                <div 
                                                    key={i} 
                                                    className="flex-1 bg-indigo-500/30 rounded-t-lg transition-all duration-1000" 
                                                    style={{ height: `${h}%` }} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Decorative Elements */}
                        <div className="absolute -top-12 -right-12 hidden h-24 w-48 animate-float-slow items-center gap-3 rounded-2xl border border-white/30 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-xl sm:flex dark:border-white/10 dark:bg-black/60">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Payment Success</span>
                                <span className="text-xs text-slate-500 tracking-tight">Rp 250.000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
