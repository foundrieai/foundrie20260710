'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { GlowContainer } from '@/components/shared/glow-container';
import { IdeationForm } from '@/components/ideation/ideation-form';

export default function IdeationPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <GlowContainer className="w-full">
          <div className="w-full max-w-4xl mx-auto py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold font-headline">IDEATION</h1>
              <p className="text-muted-foreground mt-2">Helping You Find a Marketable Startup Idea Aligned with Your Background and Interests.</p>
            </div>
            <IdeationForm />
          </div>
        </GlowContainer>
      </main>
    </div>
  );
}
