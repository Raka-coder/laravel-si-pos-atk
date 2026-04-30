import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    date?: Date;
    onSelect?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({
    date,
    onSelect,
    placeholder = 'Pick a date',
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-[200px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-0.5 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>{placeholder}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                        onSelect?.(date);
                        setOpen(false);
                    }}
                    initialFocus
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
