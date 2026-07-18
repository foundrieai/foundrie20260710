'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

/**
 * Redirects logged-out visitors to /login. Call at the top of a client page
 * component (with the other hooks); pair with a `!user` render guard to avoid
 * flashing tool content before the redirect fires.
 */
export function useRequireAuth() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  return { user, isUserLoading };
}
