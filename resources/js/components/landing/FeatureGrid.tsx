import { Package, BarChart3, CreditCard, Bot, ShieldCheck, Users } from 'lucide-react';


const features = [
    {
        title: 'Inventory Management',
        description: 'Track stock levels in real-time with automated low-stock alerts and smart reordering.',
        icon: Package,
    },
    {
        title: 'Real-time Reports',
        description: 'Gain deep insights into your business performance with detailed sales and expense analytics.',
        icon: BarChart3,
    },
    {
        title: 'Integrated Payments',
        description: 'Accept QRIS, credit cards, and bank transfers seamlessly via Midtrans integration.',
        icon: CreditCard,
    },
    {
        title: 'AI Assistant',
        description: 'Chat with our AI bot to get instant business recommendations and inventory advice.',
        icon: Bot,
    },
    {
        title: 'Manage Users',
        description: 'Control access levels for owners and cashiers with ease. Secure multi-user environment.',
        icon: Users,
    },
    {
        title: 'Secure & Reliable',
        description: 'Bank-grade security for your data and transactions. Built on a robust Laravel foundation.',
        icon: ShieldCheck,
    },
];

export default function FeatureGrid() {
    return (
        <section className="relative w-full max-w-7xl px-4 py-24">
            <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Everything you need to <br className="hidden sm:block" />
                    <span className="text-primary">scale your ATK business</span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    Powerful features designed to simplify your operations and maximize growth.
                </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, i) => (
                    <div 
                        key={i}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:bg-white/60 dark:border-white/5 dark:bg-black/20 dark:hover:border-primary/30 dark:hover:bg-black/40"
                    >
                        {/* Glow effect */}
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
                        
                        <div className="relative z-10">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-foreground">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
