import { Head } from '@inertiajs/react';
import FeatureGrid from '@/components/landing/FeatureGrid';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';

export default function Welcome() {
    return (
        <div className="relative min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
            <Head title="Welcome to POS ATK-Sync" />

            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-600/10" />
                <div className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-emerald-500/20 blur-[100px] dark:bg-emerald-600/10" />
                <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[110px] dark:bg-primary/10" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[30%] w-[30%] rounded-full bg-teal-500/10 blur-[80px] dark:bg-teal-600/5" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <Header />
                <main className="w-full flex flex-col items-center">
                    <Hero />
                    <FeatureGrid />
                </main>

                <Footer />
            </div>
        </div>
    );
}
