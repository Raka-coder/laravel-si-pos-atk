import { Package, BarChart3, CreditCard, Bot, Zap, ShieldCheck, Globe, Users } from 'lucide-react';

const features = [
    {
        title: 'Inventory Management',
        description: 'Track stock levels in real-time with automated low-stock alerts and smart reordering.',
        icon: Package,
        color: 'indigo',
    },
    {
        title: 'Real-time Reports',
        description: 'Gain deep insights into your business performance with detailed sales and expense analytics.',
        icon: BarChart3,
        color: 'emerald',
    },
    {
        title: 'Integrated Payments',
        description: 'Accept QRIS, credit cards, and bank transfers seamlessly via Midtrans integration.',
        icon: CreditCard,
        color: 'blue',
    },
    {
        title: 'AI Assistant',
        description: 'Chat with our AI bot to get instant business recommendations and inventory advice.',
        icon: Bot,
        color: 'violet',
    },
    {
        title: 'Fast & Lightweight',
        description: 'Optimized for speed. A lightning-fast interface that keeps your business moving.',
        icon: Zap,
        color: 'amber',
    },
    {
        title: 'Secure & Reliable',
        description: 'Bank-grade security for your data and transactions. Built on a robust Laravel foundation.',
        icon: ShieldCheck,
        color: 'rose',
    },
];

export default function FeatureGrid() {
    return (
        <section className="relative w-full max-w-7xl px-4 py-24">
            <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                    Everything you need to <br className="hidden sm:block" />
                    <span className="text-indigo-600 dark:text-indigo-400">scale your business</span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                    Powerful features designed to simplify your operations and maximize growth.
                </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, i) => (
                    <div 
                        key={i}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/30 hover:bg-white/60 dark:border-white/5 dark:bg-black/20 dark:hover:border-indigo-400/30 dark:hover:bg-black/40"
                    >
                        {/* Glow effect */}
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition-all group-hover:bg-indigo-500/20" />
                        
                        <div className="relative z-10">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 transition-transform group-hover:scale-110 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
