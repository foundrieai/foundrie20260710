'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReportCard } from '@/components/dashboard/report-card';
import { ArrowLeft } from 'lucide-react';
import { useCollection, useMemoFirebase, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Report } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function AdminUserReportsPage() {
  const params = useParams<{ userId: string }>();
  const firestore = useFirestore();
  const { user } = useUser();

  // FIX 2: Guard query construction with authenticated user
  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !params.userId) return null;
    return query(collection(firestore, 'users', params.userId, 'reports'), orderBy('createdAt', 'desc'));
  }, [firestore, user, params.userId]);

  const { data: reports, isLoading: isReportsLoading } = useCollection<Report>(reportsQuery);

  return (
    <main className="container py-8">
        <Button variant="ghost" asChild className="mb-8">
            <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
            </Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline mb-8">User Reports</h1>

        {isReportsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[350px] w-full" />)}
            </div>
        )}

        {!isReportsLoading && reports && reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          !isReportsLoading && (
            <Card className="glass-card text-center py-20 px-6">
                <h3 className="text-xl font-bold font-headline">No reports found for this user.</h3>
            </Card>
          )
        )}
    </main>
  );
}
