'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

/**
 * Client-side auth guard for tool routes. Redirects logged-out visitors to
 * /login and renders nothing tool-related until auth resolves. Used to wrap
 * server-component tool pages (BrandForge, Resumait) and the phase journey,
 * which were previously reachable while signed out.
 *
 * (There is no middleware/session cookie in this app — auth lives client-side
 * via onAuthStateChanged — so guarding happens here rather than at the edge.)
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [mounted, user, isUserLoading, router]);

  if (!mounted || isUserLoading || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
