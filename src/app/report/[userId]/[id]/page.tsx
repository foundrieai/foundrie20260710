'use client';

import { useParams, useRouter } from 'next/navigation';
import type { Report } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useEffect, Suspense } from 'react';
import { ReportClientShell } from '@/components/report/report-client-shell';

export default function ReportPage() {
  const params = useParams<{ userId: string, id: string }>();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Removed mandatory login redirect to allow view-only sharing for unauthenticated users.

  const reportRef = useMemoFirebase(() => {
    if (!params.userId || !params.id || !firestore) return null;
    return doc(firestore, 'users', params.userId, 'reports', params.id);
  }, [firestore, params.userId, params.id]);

  const { data: report, isLoading: isReportLoading, error } = useDoc<Report>(reportRef);

  const isLoading = isUserLoading || isReportLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </div>
    );
  }
  
  if (error || !report) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center text-center">
                <div className="px-4">
                    <h1 className="text-3xl font-bold font-headline mb-4">Report Not Found</h1>
                    <p className="text-muted-foreground">
                        {error ? "There was an error loading the report. It may have been deleted or the link is invalid." : "The report you are looking for does not exist."}
                    </p>
                </div>
            </main>
        </div>
    );
  }

  // Once report is loaded, render the interactive client shell
  return (
    <Suspense fallback={null}>
      <ReportClientShell report={report} />
    </Suspense>
  );
}
