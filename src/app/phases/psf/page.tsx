'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { PhaseView } from '@/components/phases/phase-view';
import { psfPhaseData } from '@/lib/phases/psf-data';
import { Loader2, ArrowRight } from 'lucide-react';
import type { IdeamaitContext } from '@/lib/phases/types';
import type { Report } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { getCompletedPhaseItems, getPhaseProgress, getRemainingPhaseItems } from '@/lib/phases/progress';
import { readPhaseCache, writePhaseCache } from '@/lib/phase-cache';
import { canAccessPhases } from '@/lib/entitlements';

function ProblemSolutionFitPageInner() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const routeReportId = searchParams.get('reportId');
  
  const journeyMetaRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'meta') : null), [user, firestore]);
  const { data: journeyMeta, isLoading: isMetaLoading, error: journeyMetaError } = useDoc<any>(journeyMetaRef, { suppressGlobalPermissionError: true });

  const phaseDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'psf') : null), [user, firestore]);
  const { data: phaseState, isLoading: isPhaseLoading } = useDoc<any>(phaseDataRef, { suppressGlobalPermissionError: true });

  const linkedReportRef = useMemoFirebase(() => (user && firestore && routeReportId ? doc(firestore, 'users', user.uid, 'reports', routeReportId) : null), [user, firestore, routeReportId]);
  const { data: linkedReport, isLoading: isLinkedReportLoading } = useDoc<Report>(linkedReportRef, { suppressGlobalPermissionError: true });

  const reportsRef = useMemoFirebase(() => (user && firestore && !routeReportId ? collection(firestore, 'users', user.uid, 'reports') : null), [firestore, routeReportId, user]);
  const { data: reports, isLoading: isReportsLoading } = useCollection<Report>(reportsRef, { suppressGlobalPermissionError: true });

  const userProfileRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
  const { data: userProfile } = useDoc<any>(userProfileRef, { suppressGlobalPermissionError: true });

  const [localState, setLocalState] = useState<any>({});

  useEffect(() => {
    if (phaseState) {
      setLocalState(phaseState);
      return;
    }

    const savedState = readPhaseCache(user?.uid, 'psf');
    if (savedState) setLocalState(savedState);
  }, [phaseState, user?.uid]);

  const isLoading = isUserLoading || isMetaLoading || isPhaseLoading || isLinkedReportLoading || isReportsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const fallbackReport = (reports || [])
    .filter((report) => report.status === 'complete')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const hasValidationContext = !!journeyMeta || !!linkedReport || !!fallbackReport;

  if (!hasValidationContext) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-mono uppercase tracking-wider text-primary">Validation Required</p>
            <h1 className="text-4xl font-bold font-headline">Start with a validated idea</h1>
            <p className="text-muted-foreground">
              Problem-Solution Fit uses the startup description, validation report, and scores created during Validation. Start in Ideation if you need an idea, or go straight to Validation if you already have one.
            </p>
            {journeyMetaError && (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                LaunchCode could not read journey metadata from Firestore. If a validation report exists, this page will use it as the source of context once access is available.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild className="shadow-button-primary">
              <Link href="/ideation">Start with Ideation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/new">Go to Validation</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Paid gate: the validation report is free, but the post-validation journey
  // (psf→exit) requires a paid plan once plan gating is enabled. Admins pass;
  // gating is a no-op until NEXT_PUBLIC_PLAN_GATING=on (no billing exists yet).
  const phaseLocked = !canAccessPhases(user, userProfile);
  if (phaseLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-mono uppercase tracking-wider text-primary">Upgrade required</p>
            <h1 className="text-4xl font-bold font-headline">Unlock the full LaunchCode journey</h1>
            <p className="text-muted-foreground">
              Your validation report stays free forever. To work through Problem-Solution Fit and the rest of the founder journey — with Ideamait guiding every phase — upgrade your plan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild className="shadow-button-primary">
              <Link href="/pricing">See plans</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const contextReport = linkedReport || fallbackReport;
  const validationCompanyName = journeyMeta?.companyName || contextReport?.companyName || 'Your Startup';
  const validationDescription = journeyMeta?.startupDescription || contextReport?.description || '';
  const validationScores = journeyMeta?.reportScores || contextReport?.scores || {};

  const handleUpdateState = async (newState: any) => {
    setLocalState(newState);
    writePhaseCache(user?.uid, 'psf', newState);
    if (user && firestore) {
      try {
        await setDoc(doc(firestore, 'users', user.uid, 'journey', 'psf'), newState, { merge: true });
      } catch (error) {
        console.warn('Could not save Problem-Solution Fit progress to Firestore. Using local dev state.', error);
      }
    }
  };

  const getCompletedList = (type: 'activities' | 'deliverables') => getCompletedPhaseItems(psfPhaseData, localState, type);
  const getRemainingList = (type: 'activities' | 'deliverables') => getRemainingPhaseItems(psfPhaseData, localState, type);

  const milestonesMet: string[] = [];
  const milestonesRemaining: string[] = [];
  psfPhaseData.subPhasesData.forEach(sp => {
    sp.exitMilestones.forEach(m => {
      if (localState[sp.id]?.milestones?.[m.id]) {
        milestonesMet.push(m.id);
      } else {
        milestonesRemaining.push(m.id);
      }
    });
  });

  const startedAt = journeyMeta?.journeyStartedAt?.toDate
    ? journeyMeta.journeyStartedAt.toDate()
    : contextReport?.createdAt
      ? new Date(contextReport.createdAt)
      : new Date();
  const daysInPhase = Math.max(1, Math.floor((new Date().getTime() - startedAt.getTime()) / (1000 * 3600 * 24)));

  const { milestonePct: milPct, masterProgress } = getPhaseProgress(psfPhaseData, localState);
  const enableDevAutofill =
    process.env.NODE_ENV !== 'production' ||
    user?.email?.toLowerCase() === 'hello@thesiliconhill.com';

  const context: IdeamaitContext = {
    companyName: validationCompanyName,
    startupDescription: validationDescription,
    reportScores: validationScores,
    currentPhase: 'psf',
    currentSubPhase: 'psf-a', // can be dynamic based on active tab later
    currentPhaseName: 'Problem-Solution Fit',
    daysInPhase,
    activitiesCompleted: getCompletedList('activities'),
    activitiesRemaining: getRemainingList('activities'),
    deliverablesCompleted: getCompletedList('deliverables'),
    deliverablesRemaining: getRemainingList('deliverables'),
    milestonesMet,
    milestonesRemaining,
    overallProgressPct: Math.round(masterProgress),
    location: contextReport?.location,
    industry: contextReport?.industry,
  };

  // Compute unlocked phases
  const unlockedPhases = ['psf'];
  if (masterProgress >= 80 && (milPct >= 80)) {
    unlockedPhases.push('pmf');
  }

  return (
    <>
      <PhaseView
        phaseData={psfPhaseData}
        context={context}
        phaseState={localState}
        onUpdateState={handleUpdateState}
        enableDevAutofill={enableDevAutofill}
        devNextHref="/phases/pmf"
        devNextLabel="Dev open PMF"
      />
      {unlockedPhases.includes('pmf') && (
        <div className="container mx-auto px-4 pb-24 flex justify-end">
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/phases/pmf'}
            className="h-14 px-8 text-lg font-bold shadow-button-primary"
          >
            Proceed to Product-Market Fit <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}

export default function ProblemSolutionFitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ProblemSolutionFitPageInner />
    </Suspense>
  );
}
