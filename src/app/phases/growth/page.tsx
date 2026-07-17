'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { PhaseView } from '@/components/phases/phase-view';
import { growthPhaseData } from '@/lib/phases/growth-data';
import { gtmPhaseData } from '@/lib/phases/gtm-data';
import { Loader2 } from 'lucide-react';
import type { IdeamaitContext } from '@/lib/phases/types';
import { getCompletedPhaseItems, getPhaseProgress, getRemainingPhaseItems } from '@/lib/phases/progress';
import { readPhaseCache, writePhaseCache } from '@/lib/phase-cache';

export default function GrowthPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const journeyMetaRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'meta') : null), [user, firestore]);
  const { data: journeyMeta, isLoading: isMetaLoading } = useDoc<any>(journeyMetaRef, { suppressGlobalPermissionError: true });

  const gtmDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'gtm') : null), [user, firestore]);
  const { data: gtmState, isLoading: isGtmLoading } = useDoc<any>(gtmDataRef, { suppressGlobalPermissionError: true });

  const phaseDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'growth') : null), [user, firestore]);
  const { data: phaseState, isLoading: isPhaseLoading } = useDoc<any>(phaseDataRef, { suppressGlobalPermissionError: true });

  const [localState, setLocalState] = useState<any>({});

  useEffect(() => {
    if (phaseState) {
      setLocalState(phaseState);
      return;
    }

    const savedState = readPhaseCache(user?.uid, 'growth');
    if (savedState) setLocalState(savedState);
  }, [phaseState, user?.uid]);

  const isLoading = isUserLoading || isMetaLoading || isPhaseLoading || isGtmLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpdateState = async (newState: any) => {
    setLocalState(newState);
    writePhaseCache(user?.uid, 'growth', newState);
    if (user && firestore) {
      try {
        await setDoc(doc(firestore, 'users', user.uid, 'journey', 'growth'), newState, { merge: true });
      } catch (error) {
        console.warn('Could not save Growth progress to Firestore. Using local dev state.', error);
      }
    }
  };

  const getCompletedList = (type: 'activities' | 'deliverables') => getCompletedPhaseItems(growthPhaseData, localState, type);
  const getRemainingList = (type: 'activities' | 'deliverables') => getRemainingPhaseItems(growthPhaseData, localState, type);

  const milestonesMet: string[] = [];
  const milestonesRemaining: string[] = [];
  growthPhaseData.subPhasesData.forEach(sp => {
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

  const { masterProgress } = getPhaseProgress(growthPhaseData, localState);
  const enableDevAutofill =
    process.env.NODE_ENV !== 'production' ||
    user?.email?.toLowerCase() === 'hello@thesiliconhill.com';

  const context: IdeamaitContext = {
    companyName: journeyMeta?.companyName || 'Your Startup',
    startupDescription: journeyMeta?.startupDescription || '',
    reportScores: journeyMeta?.reportScores || {},
    currentPhase: 'growth',
    currentSubPhase: 'growth-a', 
    currentPhaseName: 'Growth & Scale-Up',
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

  // Compute unlocked phases
  const unlockedPhases = ['psf', 'pmf', 'gtm'];
  
  // Need to compute GTM progress to know if Growth is unlocked
  const { masterProgress: gtmMasterProgress, milestonePct: gtmMilPct } = getPhaseProgress(gtmPhaseData, gtmState || {});

  // Fallback to true if GTM is a stub without content, so user can actually view Growth
  if ((gtmMasterProgress >= 80 && (gtmMilPct >= 80)) || gtmPhaseData.subPhasesData[0].activities.length === 0) {
    unlockedPhases.push('growth');
  }

  if (!unlockedPhases.includes('growth') && !enableDevAutofill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Growth & Scale-Up phase is locked. You must complete 80% of Go-to-Market Fit first.</p>
      </div>
    );
  }

  return (
    <>
      <PhaseView
        phaseData={growthPhaseData}
        context={context}
        phaseState={localState}
        onUpdateState={handleUpdateState}
        enableDevAutofill={enableDevAutofill}
        devNextHref="/phases/exit"
        devNextLabel="Dev open Exit"
      />
    </>
  );
}
