'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { psfPhaseData } from '@/lib/phases/psf-data';
import { pmfPhaseData } from '@/lib/phases/pmf-data';
import { gtmPhaseData } from '@/lib/phases/gtm-data';
import { growthPhaseData } from '@/lib/phases/growth-data';
import { exitPhaseData } from '@/lib/phases/exit-data';
import { getPhaseProgress } from '@/lib/phases/progress';

/** A phase counts as done at the same 80% bar that unlocks the next one. */
const COMPLETION_THRESHOLD = 80;

const EXECUTION_PHASES = [
  { id: 'psf', data: psfPhaseData },
  { id: 'pmf', data: pmfPhaseData },
  { id: 'gtm', data: gtmPhaseData },
  { id: 'growth', data: growthPhaseData },
  { id: 'exit', data: exitPhaseData },
] as const;

export type JourneyProgress = {
  completedPhases: string[];
  unlockedPhases: string[];
  isLoading: boolean;
};

/**
 * Single source of truth for how far a founder has come, across the whole
 * journey: the Ideation and Validation entry stages plus the five execution
 * phases. Completion is read from real state — never inferred from which page
 * the user happens to be on.
 */
export function useJourneyProgress(): JourneyProgress {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const journeyDoc = (name: string) => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', name) : null);

  const metaRef = useMemoFirebase(() => journeyDoc('meta'), [user, firestore]);
  const psfRef = useMemoFirebase(() => journeyDoc('psf'), [user, firestore]);
  const pmfRef = useMemoFirebase(() => journeyDoc('pmf'), [user, firestore]);
  const gtmRef = useMemoFirebase(() => journeyDoc('gtm'), [user, firestore]);
  const growthRef = useMemoFirebase(() => journeyDoc('growth'), [user, firestore]);
  const exitRef = useMemoFirebase(() => journeyDoc('exit'), [user, firestore]);

  const { data: meta, isLoading: metaLoading } = useDoc<any>(metaRef, { suppressGlobalPermissionError: true });
  const { data: psf, isLoading: psfLoading } = useDoc<any>(psfRef, { suppressGlobalPermissionError: true });
  const { data: pmf, isLoading: pmfLoading } = useDoc<any>(pmfRef, { suppressGlobalPermissionError: true });
  const { data: gtm, isLoading: gtmLoading } = useDoc<any>(gtmRef, { suppressGlobalPermissionError: true });
  const { data: growth, isLoading: growthLoading } = useDoc<any>(growthRef, { suppressGlobalPermissionError: true });
  const { data: exit, isLoading: exitLoading } = useDoc<any>(exitRef, { suppressGlobalPermissionError: true });

  // The report that anchors this journey tells us whether Validation finished.
  const reportRef = useMemoFirebase(
    () =>
      user && firestore && meta?.linkedReportId
        ? doc(firestore, 'users', user.uid, 'reports', meta.linkedReportId)
        : null,
    [user, firestore, meta?.linkedReportId]
  );
  const { data: linkedReport, isLoading: reportLoading } = useDoc<any>(reportRef, { suppressGlobalPermissionError: true });

  const isLoading =
    isUserLoading || metaLoading || psfLoading || pmfLoading || gtmLoading || growthLoading || exitLoading || reportLoading;

  return useMemo(() => {
    const states: Record<string, any> = { psf, pmf, gtm, growth, exit };

    const isPhaseDone = (id: string) => {
      const entry = EXECUTION_PHASES.find((p) => p.id === id);
      if (!entry) return false;
      const state = states[id];
      if (!state) return false;
      const { masterProgress, milestonePct } = getPhaseProgress(entry.data, state);
      return masterProgress >= COMPLETION_THRESHOLD && milestonePct >= COMPLETION_THRESHOLD;
    };

    const completedPhases: string[] = [];

    // Validation is done once its report finished generating. Reaching the
    // execution phases at all requires having come through it.
    const validationDone =
      linkedReport?.status === 'complete' || !!linkedReport?.scores || !!meta?.linkedReportId;
    // Ideation is done once an idea exists to validate.
    if (validationDone || !!meta?.startupDescription) completedPhases.push('ideation');
    if (validationDone) completedPhases.push('validation');

    for (const { id } of EXECUTION_PHASES) {
      if (isPhaseDone(id)) completedPhases.push(id);
    }

    // A step unlocks once the step before it is complete. The entry stages are
    // always reachable.
    const unlockedPhases = ['ideation', 'validation'];
    if (validationDone) unlockedPhases.push('psf');
    for (let i = 1; i < EXECUTION_PHASES.length; i++) {
      if (isPhaseDone(EXECUTION_PHASES[i - 1].id)) unlockedPhases.push(EXECUTION_PHASES[i].id);
    }

    return { completedPhases, unlockedPhases, isLoading };
  }, [meta, psf, pmf, gtm, growth, exit, linkedReport, isLoading]);
}
