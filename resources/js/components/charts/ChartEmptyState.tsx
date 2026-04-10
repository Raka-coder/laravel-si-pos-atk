interface Props {
    message: string;
}

export default function ChartEmptyState({ message }: Props) {
    return (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
            {message}
        </div>
    );
}
