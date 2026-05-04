import { Head, Link } from '@inertiajs/react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    status: number;
}

export default function Error({ status }: Props) {
    const title =
        {
            404: '404: Page Not Found',
            403: '403: Forbidden',
            500: '500: Server Error',
            503: '503: Service Unavailable',
        }[status] || 'An Error Occurred';

    const description =
        {
            404: "Sorry, the page you're looking for doesn't exist or has been moved.",
            403: "Sorry, you don't have permission to access this page.",
            500: 'Whoops, something went wrong on our servers. Please try again later.',
            503: "Sorry, we're doing some maintenance. Please check back soon.",
        }[status] || 'Something went wrong.';

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background selection:bg-primary selection:text-primary-foreground">
            <Head title={title} />

            {/* Mesh Gradient Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-600/10" />
                <div className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-emerald-500/20 blur-[100px] dark:bg-emerald-600/10" />
                <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[110px] dark:bg-primary/10" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6 text-center">
                <div className="rounded-3xl border border-white/20 bg-white/60 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/40">
                    <div className="mb-6 flex justify-center text-primary">
                        <span className="text-8xl font-black tracking-tighter opacity-20">
                            {status}
                        </span>
                    </div>

                    <h1 className="mb-3 text-2xl font-bold text-foreground">
                        {title}
                    </h1>
                    <p className="mb-8 text-muted-foreground">{description}</p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            asChild
                            variant="default"
                            className="flex-1 rounded-xl shadow-lg shadow-primary/20"
                        >
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl border-white/20 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-black/20"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-0.5 h-4 w-4" />
                            Go Back
                        </Button>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-2">
                    <img
                        src="/logo.svg"
                        alt="POS Logo"
                        className="h-5 w-5 opacity-40"
                    />
                    <span className="text-sm font-semibold text-muted-foreground opacity-60">
                        POS ATK-Sync
                    </span>
                </div>
            </div>
        </div>
    );
}
