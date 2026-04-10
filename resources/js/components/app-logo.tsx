export default function AppLogo({
    collapsed = false,
}: {
    collapsed?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex aspect-square size-9 items-center justify-center">
                <img src="/logo.svg" alt="ATK Sync Logo" className="size-7" />
            </div>
            {!collapsed && (
                <div className="flex flex-col">
                    <span className="text-sm leading-tight font-bold tracking-tight">
                        ATK Sync
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                        Point of Sale
                    </span>
                </div>
            )}
        </div>
    );
}
