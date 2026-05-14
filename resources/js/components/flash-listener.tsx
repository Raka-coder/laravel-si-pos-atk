import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FlashProps {
    success?: string;
    error?: string;
}

export default function FlashListener() {
    const { flash } = usePage<{ flash: FlashProps }>().props;
    const lastShownRef = useRef<string>('');

    useEffect(() => {
        const message = flash?.success || flash?.error;
        const type = flash?.success ? 'success' : flash?.error ? 'error' : null;

        if (message && message !== lastShownRef.current) {
            lastShownRef.current = message;

            if (type === 'success') {
                toast.success(message);
            } else if (type === 'error') {
                toast.error(message);
            }
        }
    }, [flash]);

    return null;
}
