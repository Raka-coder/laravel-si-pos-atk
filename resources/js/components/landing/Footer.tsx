export default function Footer() {
    return (
        <footer className="w-full border-t border-border py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 p-1">
                        <img src="/logo.svg" alt="POS Logo" className="h-5 w-5 opacity-80" />
                    </div>
                    <span className="font-semibold text-muted-foreground">POS ATK-Sync</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} POS ATK-Sync. Built with Laravel, Inertia, and React.
                </p>
                <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                    <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms</a>
                    <a href="#" className="hover:text-primary transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
}
