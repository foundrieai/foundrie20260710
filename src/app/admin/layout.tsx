'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isAdminUser } from '@/lib/entitlements';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait for user to be loaded
    }

    if (!user) {
      router.replace('/login'); // Not logged in, redirect to login
      return;
    }

    // Force refresh of the token to get the latest custom claims
    user.getIdTokenResult(true).then((idTokenResult) => {
      const claims = idTokenResult.claims;
      if (claims.admin === true || isAdminUser(user)) {
        setIsAdmin(true);
      } else {
        // If not an admin, we don't redirect, we just show an "Access Denied" message.
        // Redirecting could cause loops and is less secure.
        setIsAdmin(false);
      }
      setIsCheckingAdmin(false);
    }).catch(error => {
        console.error("Error fetching user claims:", error);
        setIsAdmin(false);
        setIsCheckingAdmin(false);
    });
  }, [user, isUserLoading, router]);

  if (isCheckingAdmin || isUserLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container flex items-center justify-center py-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
        </main>
      </div>
    );
  }

  if (isAdmin) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        <main className="container flex items-center justify-center py-8">
            <Card className="glass-card w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You do not have permission to view this page. Please contact an administrator if you believe this is an error.</p>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
