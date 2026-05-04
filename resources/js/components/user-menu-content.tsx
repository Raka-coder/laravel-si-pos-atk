import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, X } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit as appearanceEdit } from '@/routes/appearance';
import { edit as profileEdit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { auth } = usePage().props;
    const isOwner = auth?.isOwner === true;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsDialogOpen(true);
    };

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={isOwner ? profileEdit() : appearanceEdit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-0.5" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                <Button
                    variant="ghost"
                    className="w-full cursor-pointer justify-start"
                    onClick={handleLogoutClick}
                    data-test="logout-button"
                >
                    <LogOut className="mr-0.5" />
                    Log out
                </Button>
            </DropdownMenuItem>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 h-6 w-6"
                        onClick={() => setIsDialogOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to log out? You will need to
                            log in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Link
                                href={logout()}
                                method="post"
                                as="button"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-0.5 h-4 w-4" />
                                Log out
                            </Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
