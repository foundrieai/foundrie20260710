'use client';

import Link from "next/link";
import { isAdminUser } from "@/lib/entitlements";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, LogOut, User as UserIcon, Shield } from "lucide-react"
import { Skeleton } from "../ui/skeleton";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useSignOut } from "@/firebase/auth";
import { doc } from "firebase/firestore";
import type { User as UserProfileData } from "@/lib/types";
import { useState, useEffect } from "react";

/**
 * Account menu. Intentionally identity/account-only (profile, billing, sign out)
 * so it does not duplicate the product navigation in the top bar.
 */
export function UserNav() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const handleSignOut = useSignOut();
  const [isAdmin, setIsAdmin] = useState(false);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfileData>(userProfileRef);

  useEffect(() => {
    if (user) {
      user.getIdTokenResult(true).then((idTokenResult) => {
        const claims = idTokenResult.claims;
        setIsAdmin(claims.admin === true || isAdminUser(user));
      });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  if (isUserLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!user) {
    return null;
  }

  const displayName = userProfile?.displayName || user.displayName || 'Founder';
  const email = userProfile?.email || user.email || '';
  const photoURL = userProfile?.photoURL || user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={photoURL} alt={displayName} data-ai-hint="person" />
            <AvatarFallback>{(displayName || email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile &amp; account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/pricing">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing &amp; plans</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin console</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
