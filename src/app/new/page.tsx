'use client';
import { IdeaForm } from "@/components/new/idea-form";
import { GlowContainer } from "@/components/shared/glow-container";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, Suspense, useState } from "react";

function NewReportPageInner() {
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
          <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold font-headline">Validation</h1>
              <p className="text-muted-foreground mt-2">Describe your startup idea to create the validation report that unlocks the rest of your LaunchCode journey.</p>
              <p className="text-sm text-muted-foreground mt-3">
                Do not have an idea yet? <Link href="/ideation" className="text-primary hover:underline">Start with Ideation</Link>.
              </p>
            </div>
            <Suspense fallback={<div>Loading form...</div>}>
              <IdeaForm />
            </Suspense>
          </div>
        </GlowContainer>
      </main>
    </div>
  );
}

export default function NewReportPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return <NewReportPageInner />;
}
