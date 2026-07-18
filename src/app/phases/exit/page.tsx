'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { PhaseView } from '@/components/phases/phase-view';
import { exitPhaseData } from '@/lib/phases/exit-data';
import { growthPhaseData } from '@/lib/phases/growth-data';
import { Loader2 } from 'lucide-react';
import type { IdeamaitContext } from '@/lib/phases/types';
import { getCompletedPhaseItems, getPhaseProgress, getRemainingPhaseItems } from '@/lib/phases/progress';
import { readPhaseCache, writePhaseCache } from '@/lib/phase-cache';

export default function ExitReadinessPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const journeyMetaRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'meta') : null), [user, firestore]);
  const { data: journeyMeta, isLoading: isMetaLoading } = useDoc<any>(journeyMetaRef, { suppressGlobalPermissionError: true });

  const growthDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'growth') : null), [user, firestore]);
  const { data: growthState, isLoading: isGrowthLoading } = useDoc<any>(growthDataRef, { suppressGlobalPermissionError: true });

  const phaseDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'exit') : null), [user, firestore]);
  const { data: phaseState, isLoading: isPhaseLoading } = useDoc<any>(phaseDataRef, { suppressGlobalPermissionError: true });

  const [localState, setLocalState] = useState<any>({});
  const [localGrowthState, setLocalGrowthState] = useState<any>({});

  useEffect(() => {
    if (phaseState) {
      setLocalState(phaseState);
      return;
    }

    const savedState = readPhaseCache(user?.uid, 'exit');
    if (savedState) setLocalState(savedState);
  }, [phaseState, user?.uid]);

  useEffect(() => {
    if (growthState) {
      setLocalGrowthState(growthState);
      return;
    }

    const savedState = readPhaseCache(user?.uid, 'growth');
    if (savedState) setLocalGrowthState(savedState);
  }, [growthState, user?.uid]);

  const isLoading = isUserLoading || isMetaLoading || isPhaseLoading || isGrowthLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpdateState = async (newState: any) => {
    setLocalState(newState);
    writePhaseCache(user?.uid, 'exit', newState);
    if (user && firestore) {
      try {
        await setDoc(doc(firestore, 'users', user.uid, 'journey', 'exit'), newState, { merge: true });
      } catch (error) {
        console.warn('Could not save Maturity and Exit-Readiness progress to Firestore. Using local dev state.', error);
      }
    }
  };

  const getCompletedList = (type: 'activities' | 'deliverables') => getCompletedPhaseItems(exitPhaseData, localState, type);
  const getRemainingList = (type: 'activities' | 'deliverables') => getRemainingPhaseItems(exitPhaseData, localState, type);

  const milestonesMet: string[] = [];
  const milestonesRemaining: string[] = [];
  exitPhaseData.subPhasesData.forEach(sp => {
    sp.exitMilestones.forEach(m => {
      if (localState[sp.id]?.milestones?.[m.id]) {
        milestonesMet.push(m.id);
      } else {
        milestonesRemaining.push(m.id);
      }
    });
  });

  const startedAt = journeyMeta?.journeyStartedAt?.toDate ? journeyMeta.journeyStartedAt.toDate() : new Date();
  const daysInPhase = Math.max(1, Math.floor((new Date().getTime() - startedAt.getTime()) / (1000 * 3600 * 24)));

  const { masterProgress } = getPhaseProgress(exitPhaseData, localState);
  const { masterProgress: growthMasterProgress, milestonePct: growthMilPct } = getPhaseProgress(growthPhaseData, localGrowthState || {});
  const enableDevAutofill =
    process.env.NODE_ENV !== 'production' ||
    user?.email?.toLowerCase() === 'hello@thesiliconhill.com';

  if (!(growthMasterProgress >= 80 && growthMilPct >= 80) && !enableDevAutofill) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="max-w-xl text-center text-muted-foreground">
          Maturity and Exit-Readiness is locked. You must complete 80% of Growth and Scale-Up first.
        </p>
      </div>
    );
  }

  const context: IdeamaitContext = {
    companyName: journeyMeta?.companyName || 'Your Startup',
    startupDescription: journeyMeta?.startupDescription || '',
    reportScores: journeyMeta?.reportScores || {},
    currentPhase: 'exit',
    currentSubPhase: 'exit-a',
    currentPhaseName: 'Maturity & Exit-Readiness',
    daysInPhase,
    activitiesCompleted: getCompletedList('activities'),
    activitiesRemaining: getRemainingList('activities'),
    deliverablesCompleted: getCompletedList('deliverables'),
    deliverablesRemaining: getRemainingList('deliverables'),
    milestonesMet,
    milestonesRemaining,
    overallProgressPct: Math.round(masterProgress),
    latestFounderOsMetrics: journeyMeta?.latestFounderOsMetrics || {}
  };

  return (
    <PhaseView
      phaseData={exitPhaseData}
      context={context}
      phaseState={localState}
      onUpdateState={handleUpdateState}
      enableDevAutofill={enableDevAutofill}
      devNextLabel="Dev finish journey"
      devPrevHref="/phases/growth"
      devPrevLabel="Dev open Growth"
    />
  );
}
