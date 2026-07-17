'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { PhaseView } from '@/components/phases/phase-view';
import { gtmPhaseData } from '@/lib/phases/gtm-data';
import { Loader2 } from 'lucide-react';
import type { IdeamaitContext } from '@/lib/phases/types';
import { getCompletedPhaseItems, getPhaseProgress, getRemainingPhaseItems } from '@/lib/phases/progress';
import { readPhaseCache, writePhaseCache } from '@/lib/phase-cache';

export default function GoToMarketPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const journeyMetaRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'meta') : null), [user, firestore]);
  const { data: journeyMeta, isLoading: isMetaLoading } = useDoc<any>(journeyMetaRef, { suppressGlobalPermissionError: true });

  const phaseDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'gtm') : null), [user, firestore]);
  const { data: phaseState, isLoading: isPhaseLoading } = useDoc<any>(phaseDataRef, { suppressGlobalPermissionError: true });

  const [localState, setLocalState] = useState<any>({});

  useEffect(() => {
    if (phaseState) {
      setLocalState(phaseState);
      return;
    }

    const savedState = readPhaseCache(user?.uid, 'gtm');
    if (savedState) setLocalState(savedState);
  }, [phaseState, user?.uid]);

  const isLoading = isUserLoading || isMetaLoading || isPhaseLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpdateState = async (newState: any) => {
    setLocalState(newState);
    writePhaseCache(user?.uid, 'gtm', newState);
    if (user && firestore) {
      try {
        await setDoc(doc(firestore, 'users', user.uid, 'journey', 'gtm'), newState, { merge: true });
      } catch (error) {
        console.warn('Could not save Go-to-Market Fit progress to Firestore. Using local dev state.', error);
      }
    }
  };

  const getCompletedList = (type: 'activities' | 'deliverables') => getCompletedPhaseItems(gtmPhaseData, localState, type);
  const getRemainingList = (type: 'activities' | 'deliverables') => getRemainingPhaseItems(gtmPhaseData, localState, type);

  const milestonesMet: string[] = [];
  const milestonesRemaining: string[] = [];
  gtmPhaseData.subPhasesData.forEach(sp => {
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
  const { masterProgress } = getPhaseProgress(gtmPhaseData, localState);

  const context: IdeamaitContext = {
    companyName: journeyMeta?.companyName || 'Your Startup',
    startupDescription: journeyMeta?.startupDescription || '',
    reportScores: journeyMeta?.reportScores || {},
    currentPhase: 'gtm',
    currentSubPhase: 'gtm-a', 
    currentPhaseName: 'Go-to-Market Fit',
    daysInPhase,
    activitiesCompleted: getCompletedList('activities'),
    activitiesRemaining: getRemainingList('activities'),
    deliverablesCompleted: getCompletedList('deliverables'),
    deliverablesRemaining: getRemainingList('deliverables'),
    milestonesMet,
    milestonesRemaining,
    overallProgressPct: Math.round(masterProgress),
  };
  const enableDevAutofill =
    process.env.NODE_ENV !== 'production' ||
    user?.email?.toLowerCase() === 'hello@thesiliconhill.com';

  return (
    <>
      <PhaseView
        phaseData={gtmPhaseData}
        context={context}
        phaseState={localState}
        onUpdateState={handleUpdateState}
        enableDevAutofill={enableDevAutofill}
        devNextHref="/phases/growth"
        devNextLabel="Dev open Growth"
      />
    </>
  );
}
