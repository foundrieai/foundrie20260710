'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { Archive, ArrowRight, ClipboardList, Eye, FileText, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { DecisionLogEntry, EvidenceItem, Report } from '@/lib/types';
import { psfPhaseData } from '@/lib/phases/psf-data';
import { pmfPhaseData } from '@/lib/phases/pmf-data';
import { gtmPhaseData } from '@/lib/phases/gtm-data';
import { growthPhaseData } from '@/lib/phases/growth-data';
import { getPhaseProgress } from '@/lib/phases/progress';

function SharedViewInner() {
  const params = useParams<{ ownerId: string }>();
  const ownerId = params.ownerId;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const metaRef = useMemoFirebase(() => (firestore && ownerId ? doc(firestore, 'users', ownerId, 'journey', 'meta') : null), [firestore, ownerId]);
  const psfRef = useMemoFirebase(() => (firestore && ownerId ? doc(firestore, 'users', ownerId, 'journey', 'psf') : null), [firestore, ownerId]);
  const pmfRef = useMemoFirebase(() => (firestore && ownerId ? doc(firestore, 'users', ownerId, 'journey', 'pmf') : null), [firestore, ownerId]);
  const gtmRef = useMemoFirebase(() => (firestore && ownerId ? doc(firestore, 'users', ownerId, 'journey', 'gtm') : null), [firestore, ownerId]);
  const growthRef = useMemoFirebase(() => (firestore && ownerId ? doc(firestore, 'users', ownerId, 'journey', 'growth') : null), [firestore, ownerId]);

  const reportsRef = useMemoFirebase(
    () => (firestore && ownerId ? query(collection(firestore, 'users', ownerId, 'reports'), orderBy('createdAt', 'desc')) : null),
    [firestore, ownerId]
  );
  const evidenceRef = useMemoFirebase(
    () => (firestore && ownerId ? collection(firestore, 'users', ownerId, 'evidence') : null),
    [firestore, ownerId]
  );
  const decisionsRef = useMemoFirebase(
    () => (firestore && ownerId ? collection(firestore, 'users', ownerId, 'decisions') : null),
    [firestore, ownerId]
  );

  const { data: journeyMeta } = useDoc<any>(metaRef, { suppressGlobalPermissionError: true });
  const { data: psfState } = useDoc<any>(psfRef, { suppressGlobalPermissionError: true });
  const { data: pmfState } = useDoc<any>(pmfRef, { suppressGlobalPermissionError: true });
  const { data: gtmState } = useDoc<any>(gtmRef, { suppressGlobalPermissionError: true });
  const { data: growthState } = useDoc<any>(growthRef, { suppressGlobalPermissionError: true });
  const { data: reports, isLoading: reportsLoading } = useCollection<Report>(reportsRef, { suppressGlobalPermissionError: true });
  const { data: evidence } = useCollection<EvidenceItem>(evidenceRef, { suppressGlobalPermissionError: true });
  const { data: decisions } = useCollection<DecisionLogEntry>(decisionsRef, { suppressGlobalPermissionError: true });

  const phases = useMemo(
    () => [
      { id: 'psf', name: 'Problem-Solution Fit', data: psfPhaseData, state: psfState || {} },
      { id: 'pmf', name: 'Product-Market Fit', data: pmfPhaseData, state: pmfState || {} },
      { id: 'gtm', name: 'Go-to-Market', data: gtmPhaseData, state: gtmState || {} },
      { id: 'growth', name: 'Growth', data: growthPhaseData, state: growthState || {} },
    ].map((p) => ({ ...p, progress: Math.round(getPhaseProgress(p.data, p.state).masterProgress) })),
    [psfState, pmfState, gtmState, growthState]
  );

  if (isUserLoading) {
    return (
      <main className="container py-16 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container flex min-h-[70vh] items-center justify-center py-8">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-3xl font-bold font-headline">Sign in to view this workspace</h1>
          <p className="text-muted-foreground">
            You have been given read-only access to a founder&apos;s LaunchCode progress. Sign in with the email you were invited on to view it.
          </p>
          <Button asChild className="shadow-button-primary">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  const companyName = journeyMeta?.companyName || reports?.[0]?.companyName || 'This founder';
  const nothingVisible = !reportsLoading && (reports?.length || 0) === 0 && !journeyMeta;

  return (
    <main className="container space-y-8 py-8">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          <Eye className="h-3.5 w-3.5" /> Read-only investor view
        </span>
        <h1 className="text-3xl font-bold font-headline">{companyName}</h1>
        {journeyMeta?.startupDescription && (
          <p className="max-w-3xl text-muted-foreground">{journeyMeta.startupDescription}</p>
        )}
      </div>

      {nothingVisible ? (
        <Card className="glass-card p-8 text-center text-muted-foreground">
          There is nothing to show yet, or your account does not have access to this workspace. Make sure you are signed in with the email you were invited on.
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="glass-card p-5">
              <p className="text-sm text-muted-foreground">Validations</p>
              <p className="mt-1 text-2xl font-bold font-headline">{reports?.length || 0}</p>
            </Card>
            <Card className="glass-card p-5">
              <p className="text-sm text-muted-foreground">Vault evidence</p>
              <p className="mt-1 text-2xl font-bold font-headline">{evidence?.length || 0}</p>
            </Card>
            <Card className="glass-card p-5">
              <p className="text-sm text-muted-foreground">Decisions logged</p>
              <p className="mt-1 text-2xl font-bold font-headline">{decisions?.length || 0}</p>
            </Card>
            <Card className="glass-card p-5">
              <p className="text-sm text-muted-foreground">Current phase</p>
              <p className="mt-1 text-2xl font-bold font-headline">{journeyMeta?.currentPhase?.toUpperCase() || '—'}</p>
            </Card>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Journey progress</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {phases.map((p) => (
                <Card key={p.id} className="glass-card space-y-3 p-5">
                  <h3 className="text-sm font-bold font-headline">{p.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} />
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Validation reports</h2>
            {reportsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (reports?.length || 0) === 0 ? (
              <p className="text-muted-foreground">No validation reports yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {reports!.map((r) => (
                  <Card key={r.id} className="glass-card flex items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <p className="truncate font-bold">{r.companyName}</p>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{r.tagline || r.description}</p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={`/report/${ownerId}/${r.id}`}>
                        View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Archive className="h-3.5 w-3.5" />
            <ClipboardList className="h-3.5 w-3.5" />
            You are viewing this workspace in read-only mode. Only the founder can make changes.
          </div>
        </>
      )}
    </main>
  );
}

export default function SharedViewPage() {
  return <SharedViewInner />;
}
