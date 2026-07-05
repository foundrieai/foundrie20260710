'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

/**
 * Redirects to the dashboard if the user is already logged in.
 */
export const useAuthRedirect = () => {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        // If the user is loaded and exists, redirect them.
        if (!isUserLoading && user) {
            router.replace('/dashboard');
        }
    }, [user, isUserLoading, router]);
};
