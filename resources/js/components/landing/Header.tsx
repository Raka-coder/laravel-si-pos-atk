import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
    const { auth } = usePage().props as any;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
            <nav className="flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/20 bg-white/60 px-6 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 p-1">
                        <img src="/logo.svg" alt="POS Logo" className="h-7 w-7" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        POS ATK-Sync
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {auth?.user ? (
                        <Button asChild variant="default" className="rounded-xl shadow-lg shadow-primary/20">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Link 
                                href="/login" 
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                Sign in
                            </Link>
                            <Button asChild variant="default" className="rounded-xl shadow-lg shadow-primary/20">
                                <Link href="/login">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
