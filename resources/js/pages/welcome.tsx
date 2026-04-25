import { Head } from '@inertiajs/react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import FeatureGrid from '@/components/landing/FeatureGrid';

export default function Welcome() {
    return (
        <div className="relative min-h-screen w-full bg-slate-50 selection:bg-indigo-500 selection:text-white dark:bg-slate-950">
            <Head title="Welcome to SmartPOS" />

            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-indigo-500/20 blur-[120px] dark:bg-indigo-600/10" />
                <div className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-violet-500/20 blur-[100px] dark:bg-violet-600/10" />
                <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-blue-500/20 blur-[110px] dark:bg-blue-600/10" />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[30%] w-[30%] rounded-full bg-teal-500/10 blur-[80px] dark:bg-teal-600/5" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <Header />
                <main className="w-full flex flex-col items-center">
                    <Hero />
                    <FeatureGrid />
                </main>

                <footer className="w-full border-t border-slate-200 py-12 dark:border-slate-800">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <img src="/logo.svg" alt="POS Logo" className="h-6 w-6 opacity-60" />
                            <span className="font-semibold text-slate-500">SmartPOS</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} SmartPOS. Built with Laravel, Inertia, and React.
                        </p>
                        <div className="flex gap-6 text-sm font-medium text-slate-500">
                            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
