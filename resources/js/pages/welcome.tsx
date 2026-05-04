import { Head } from '@inertiajs/react';
import FeatureGrid from '@/components/landing/FeatureGrid';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';

export default function Welcome() {
    return (
        <div className="relative min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
            <Head>
                <title>ATK-Sync POS - Sistem Point of Sale Modern</title>
                <meta name="description" content="Sistem Point of Sale modern untuk toko ATK dengan fitur lengkap." />
                <meta name="keywords" content="pos, point of sale, toko atk, kasir, inventory" />
                <meta property="og:title" content="ATK-Sync POS - Sistem POS Modern" />
                <meta property="og:description" content="Sistem Point of Sale modern untuk toko ATK." />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="ATK-Sync POS" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="ATK-Sync POS - Sistem POS Modern" />
                <meta name="twitter:description" content="Sistem Point of Sale modern untuk toko ATK." />
            </Head>

            {/* Mesh Gradient Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-600/10" />
                <div className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-emerald-500/20 blur-[100px] dark:bg-emerald-600/10" />
                <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[110px] dark:bg-primary/10" />
                <div className="absolute top-[50%] left-[50%] h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[80px] dark:bg-teal-600/5" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <Header />
                <main className="flex w-full flex-col items-center">
                    <Hero />
                    <FeatureGrid />
                </main>

                <Footer />
            </div>
        </div>
    );
}
