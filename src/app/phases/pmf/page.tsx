'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { PhaseView } from '@/components/phases/phase-view';
import { pmfPhaseData } from '@/lib/phases/pmf-data';
import { psfPhaseData } from '@/lib/phases/psf-data';
import { Loader2, ArrowRight } from 'lucide-react';
import type { IdeamaitContext } from '@/lib/phases/types';
import { Button } from '@/components/ui/button';
import { getCompletedPhaseItems, getPhaseProgress, getRemainingPhaseItems } from '@/lib/phases/progress';

export default function ProductMarketFitPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const journeyMetaRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'meta') : null), [user, firestore]);
  const { data: journeyMeta, isLoading: isMetaLoading } = useDoc<any>(journeyMetaRef, { suppressGlobalPermissionError: true });

  const psfDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'psf') : null), [user, firestore]);
  const { data: psfState, isLoading: isPsfLoading } = useDoc<any>(psfDataRef, { suppressGlobalPermissionError: true });

  const phaseDataRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'pmf') : null), [user, firestore]);
  const { data: phaseState, isLoading: isPhaseLoading } = useDoc<any>(phaseDataRef, { suppressGlobalPermissionError: true });

  const [localState, setLocalState] = useState<any>({});

  useEffect(() => {
    if (phaseState) {
      setLocalState(phaseState);
      return;
    }

    const savedState = window.localStorage.getItem('launchcode:phase:pmf');
    if (savedState) {
      try {
        setLocalState(JSON.parse(savedState));
      } catch {
        window.localStorage.removeItem('launchcode:phase:pmf');
      }
    }
  }, [phaseState]);

  const isLoading = isUserLoading || isMetaLoading || isPhaseLoading || isPsfLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpdateState = async (newState: any) => {
    setLocalState(newState);
    window.localStorage.setItem('launchcode:phase:pmf', JSON.stringify(newState));
    if (user && firestore) {
      try {
        await setDoc(doc(firestore, 'users', user.uid, 'journey', 'pmf'), newState, { merge: true });
      } catch (error) {
        console.warn('Could not save Product-Market Fit progress to Firestore. Using local dev state.', error);
      }
    }
  };

  const getCompletedList = (type: 'activities' | 'deliverables') => getCompletedPhaseItems(pmfPhaseData, localState, type);
  const getRemainingList = (type: 'activities' | 'deliverables') => getRemainingPhaseItems(pmfPhaseData, localState, type);

  const milestonesMet: string[] = [];
  const milestonesRemaining: string[] = [];
  pmfPhaseData.subPhasesData.forEach(sp => {
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

  const { masterProgress } = getPhaseProgress(pmfPhaseData, localState);
  const enableDevAutofill =
    process.env.NODE_ENV !== 'production' ||
    user?.email?.toLowerCase() === 'hello@thesiliconhill.com';

  const context: IdeamaitContext = {
    companyName: journeyMeta?.companyName || 'Your Startup',
    startupDescription: journeyMeta?.startupDescription || '',
    reportScores: journeyMeta?.reportScores || {},
    currentPhase: 'pmf',
    currentSubPhase: 'pmf-a', 
    currentPhaseName: 'Product-Market Fit',
    daysInPhase,
    activitiesCompleted: getCompletedList('activities'),
    activitiesRemaining: getRemainingList('activities'),
    deliverablesCompleted: getCompletedList('deliverables'),
    deliverablesRemaining: getRemainingList('deliverables'),
    milestonesMet,
    milestonesRemaining,
    overallProgressPct: Math.round(masterProgress)
  };

  // Compute unlocked phases
  const unlockedPhases = ['psf'];
  
  // Need to compute PSF progress to know if PMF is unlocked
  const { masterProgress: psfMasterProgress, milestonePct: psfMilPct } = getPhaseProgress(psfPhaseData, psfState || {});

  if (psfMasterProgress >= 80 && (psfMilPct >= 80)) {
    unlockedPhases.push('pmf');
  }

  if (!unlockedPhases.includes('pmf') && !enableDevAutofill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product-Market Fit phase is locked. You must complete 80% of Problem-Solution Fit first.</p>
      </div>
    );
  }

  return (
    <>
      <PhaseView
        phaseData={pmfPhaseData}
        context={context}
        phaseState={localState}
        onUpdateState={handleUpdateState}
        enableDevAutofill={enableDevAutofill}
        devNextHref="/phases/gtm"
        devNextLabel="Dev open GTM"
      />
      {(masterProgress >= 80 || enableDevAutofill) && (
        <div className="container mx-auto px-4 pb-24 flex justify-end">
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/phases/gtm'}
            className="h-14 px-8 text-lg font-bold shadow-button-primary"
          >
            Proceed to Go-to-Market Fit <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}
