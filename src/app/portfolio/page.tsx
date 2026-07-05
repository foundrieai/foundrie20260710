'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, doc } from 'firebase/firestore';
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Loader2,
  Lock,
  Map as MapIcon,
  ShieldAlert,
  Target,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { DecisionLogEntry, EvidenceItem } from '@/lib/types';
import type { FullPhaseData } from '@/lib/phases/types';
import { psfPhaseData } from '@/lib/phases/psf-data';
import { pmfPhaseData } from '@/lib/phases/pmf-data';
import { gtmPhaseData } from '@/lib/phases/gtm-data';
import { growthPhaseData } from '@/lib/phases/growth-data';
import { getPhaseProgress } from '@/lib/phases/progress';

type PhaseStatus = 'current' | 'next' | 'locked' | 'ready' | 'framework-pending';

interface PhaseSummary {
  id: string;
  name: string;
  href: string;
  data: FullPhaseData | null;
  state: any;
  progress: number;
  milestonePct: number;
  evidenceCount: number;
  strongEvidenceCount: number;
  decisionCount: number;
  overrideCount: number;
  status: PhaseStatus;
}

function countOverrides(phaseState: any): number {
  if (!phaseState || typeof phaseState !== 'object') return 0;

  return Object.values(phaseState).reduce<number>((total, subPhase: any) => {
    const activities = subPhase?.activities || {};
    return total + Object.values(activities).filter((activity: any) => activity?.isOverride).length;
  }, 0);
}

function getPhaseItemTotals(phaseData: FullPhaseData | null) {
  if (!phaseData) return { activities: 0, deliverables: 0, milestones: 0 };

  return phaseData.subPhasesData.reduce(
    (totals, subPhase) => ({
      activities: totals.activities + subPhase.activities.length,
      deliverables: totals.deliverables + subPhase.deliverables.length,
      milestones: totals.milestones + subPhase.exitMilestones.length,
    }),
    { activities: 0, deliverables: 0, milestones: 0 }
  );
}

function phaseProgress(phaseData: FullPhaseData | null, phaseState: any) {
  if (!phaseData) {
    return { masterProgress: 0, milestonePct: 0 };
  }

  return getPhaseProgress(phaseData, phaseState || {});
}

function statusLabel(status: PhaseStatus) {
  switch (status) {
    case 'ready':
      return 'ready';
    case 'current':
      return 'current';
    case 'next':
      return 'next';
    case 'framework-pending':
      return 'framework pending';
    case 'locked':
      return 'locked';
  }
}

function statusClass(status: PhaseStatus) {
  switch (status) {
    case 'ready':
      return 'bg-[#ff7a00]/20 text-[#ffc400] border-[#ff7a00]/30';
    case 'current':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'next':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'framework-pending':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    case 'locked':
      return 'bg-muted text-muted-foreground border-border';
  }
}

function signalForPhase(phase: PhaseSummary): string {
  if (phase.status === 'framework-pending') return 'Module scaffold is present; content remains to be built.';
  if (phase.progress >= 80 && phase.milestonePct >= 80) return 'Evidence and milestones are strong enough to support the next phase.';
  if (phase.evidenceCount === 0) return 'No Vault evidence is tagged to this phase yet.';
  if (phase.decisionCount === 0) return 'Evidence exists, but no founder decisions have been logged.';
  if (phase.overrideCount > 0) return 'Founder override is present; keep the risk visible.';
  return 'Work is in motion and still needs stronger proof.';
}

function PortfolioMapInner() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, router, user]);

  const journeyMetaRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'meta') : null),
    [firestore, user]
  );
  const psfRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'psf') : null),
    [firestore, user]
  );
  const pmfRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'pmf') : null),
    [firestore, user]
  );
  const gtmRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'gtm') : null),
    [firestore, user]
  );
  const growthRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'journey', 'growth') : null),
    [firestore, user]
  );
  const evidenceRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'evidence') : null),
    [firestore, user]
  );
  const decisionsRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'decisions') : null),
    [firestore, user]
  );

  const { data: journeyMeta, isLoading: isMetaLoading } = useDoc<any>(journeyMetaRef, { suppressGlobalPermissionError: true });
  const { data: psfState, isLoading: isPsfLoading } = useDoc<any>(psfRef, { suppressGlobalPermissionError: true });
  const { data: pmfState, isLoading: isPmfLoading } = useDoc<any>(pmfRef, { suppressGlobalPermissionError: true });
  const { data: gtmState, isLoading: isGtmLoading } = useDoc<any>(gtmRef, { suppressGlobalPermissionError: true });
  const { data: growthState, isLoading: isGrowthLoading } = useDoc<any>(growthRef, { suppressGlobalPermissionError: true });
  const { data: evidenceItems, isLoading: isEvidenceLoading } = useCollection<EvidenceItem>(evidenceRef, { suppressGlobalPermissionError: true });
  const { data: decisions, isLoading: isDecisionsLoading } = useCollection<DecisionLogEntry>(decisionsRef, { suppressGlobalPermissionError: true });

  const isLoading = isUserLoading || isMetaLoading || isPsfLoading || isPmfLoading || isGtmLoading || isGrowthLoading || isEvidenceLoading || isDecisionsLoading;

  const phaseSummaries = useMemo<PhaseSummary[]>(() => {
    const phaseInputs = [
      { id: 'psf', name: psfPhaseData.name, href: '/phases/psf', data: psfPhaseData, state: psfState || {} },
      { id: 'pmf', name: pmfPhaseData.name, href: '/phases/pmf', data: pmfPhaseData, state: pmfState || {} },
      { id: 'gtm', name: gtmPhaseData.name, href: '/phases/gtm', data: gtmPhaseData, state: gtmState || {} },
      { id: 'growth', name: 'Growth', href: '/phases/growth', data: growthPhaseData, state: growthState || {} },
      { id: 'exit', name: 'Exit', href: '#', data: null, state: {} },
    ];

    const progressById = new Map(
      phaseInputs.map((phase) => {
        const progress = phaseProgress(phase.data, phase.state);
        return [phase.id, progress];
      })
    );

    const psfReady = (progressById.get('psf')?.masterProgress || 0) >= 80 && (progressById.get('psf')?.milestonePct || 0) >= 80;
    const pmfReady = (progressById.get('pmf')?.masterProgress || 0) >= 80 && (progressById.get('pmf')?.milestonePct || 0) >= 80;
    const gtmHasContent = gtmPhaseData.subPhasesData.some((subPhase) => subPhase.activities.length > 0 || subPhase.deliverables.length > 0 || subPhase.exitMilestones.length > 0);
    const gtmReady = !gtmHasContent || ((progressById.get('gtm')?.masterProgress || 0) >= 80 && (progressById.get('gtm')?.milestonePct || 0) >= 80);
    const growthReady = (progressById.get('growth')?.masterProgress || 0) >= 80 && (progressById.get('growth')?.milestonePct || 0) >= 80;

    return phaseInputs.map((phase) => {
      const progress = progressById.get(phase.id) || { masterProgress: 0, milestonePct: 0 };
      const phaseEvidence = (evidenceItems || []).filter((item) => item.tags?.phaseId === phase.id);
      const phaseDecisions = (decisions || []).filter((decision) => decision.phaseId === phase.id);
      let status: PhaseStatus = 'locked';

      if (phase.id === 'psf') {
        status = psfReady ? 'ready' : 'current';
      } else if (phase.id === 'pmf') {
        status = psfReady ? (pmfReady ? 'ready' : 'current') : 'locked';
      } else if (phase.id === 'gtm') {
        status = !gtmHasContent ? 'framework-pending' : pmfReady ? (gtmReady ? 'ready' : 'current') : 'locked';
      } else if (phase.id === 'growth') {
        status = gtmReady ? (growthReady ? 'ready' : 'current') : 'locked';
      } else {
        status = growthReady ? 'next' : 'locked';
      }

      return {
        id: phase.id,
        name: phase.name,
        href: phase.href,
        data: phase.data,
        state: phase.state,
        progress: Math.round(progress.masterProgress),
        milestonePct: Math.round(progress.milestonePct),
        evidenceCount: phaseEvidence.length,
        strongEvidenceCount: phaseEvidence.filter((item) => item.strength === 'strong').length,
        decisionCount: phaseDecisions.length,
        overrideCount: countOverrides(phase.state),
        status,
      };
    });
  }, [decisions, evidenceItems, growthState, gtmState, pmfState, psfState]);

  if (isLoading || !user) {
    return (
      <main className="container py-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
      </main>
    );
  }

  const activePhase = phaseSummaries.find((phase) => phase.status === 'current') || phaseSummaries.find((phase) => phase.status === 'next') || phaseSummaries[0];
  const totalEvidence = evidenceItems?.length || 0;
  const totalDecisions = decisions?.length || 0;
  const totalOverrides = phaseSummaries.reduce((sum, phase) => sum + phase.overrideCount, 0);
  const phasesReady = phaseSummaries.filter((phase) => phase.status === 'ready').length;

  return (
    <main className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <MapIcon className="h-8 w-8 text-primary" />
            Portfolio Horizon Map
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            See how phase progress, Vault evidence, and founder decisions line up across the LaunchCode journey.
          </p>
        </div>
        <Button asChild className="shadow-button-primary">
          <Link href={activePhase.href === '#' ? '/phases/growth' : activePhase.href}>
            Continue current phase <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Current focus</p>
          <p className="text-2xl font-bold font-headline mt-1">{activePhase.name}</p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Vault evidence</p>
          <p className="text-2xl font-bold font-headline mt-1">{totalEvidence}</p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Decisions logged</p>
          <p className="text-2xl font-bold font-headline mt-1">{totalDecisions}</p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Ready phases</p>
          <p className="text-2xl font-bold font-headline mt-1">{phasesReady}</p>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-headline">Horizon</h2>
          {totalOverrides > 0 && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              <ShieldAlert className="mr-1 h-3 w-3" />
              {totalOverrides} override{totalOverrides === 1 ? '' : 's'}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {phaseSummaries.map((phase) => {
            const totals = getPhaseItemTotals(phase.data);
            const isLocked = phase.status === 'locked';
            const isPending = phase.status === 'framework-pending';

            return (
              <Card key={phase.id} className="glass-card p-5 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="outline" className={statusClass(phase.status)}>{statusLabel(phase.status)}</Badge>
                    <h3 className="text-lg font-bold font-headline mt-3">{phase.name}</h3>
                  </div>
                  {isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Target className="h-5 w-5 text-primary" />}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Composite progress</span>
                    <span className="font-semibold">{phase.progress}%</span>
                  </div>
                  <Progress value={isPending ? 0 : phase.progress} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-white/5 p-2">
                    <Archive className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-1 text-sm font-bold">{phase.evidenceCount}</p>
                    <p className="text-[11px] text-muted-foreground">evidence</p>
                  </div>
                  <div className="rounded-md bg-white/5 p-2">
                    <CheckCircle2 className="mx-auto h-4 w-4 text-[#ffc400]" />
                    <p className="mt-1 text-sm font-bold">{phase.strongEvidenceCount}</p>
                    <p className="text-[11px] text-muted-foreground">strong</p>
                  </div>
                  <div className="rounded-md bg-white/5 p-2">
                    <ClipboardList className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-1 text-sm font-bold">{phase.decisionCount}</p>
                    <p className="text-[11px] text-muted-foreground">decisions</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{totals.activities} activities · {totals.deliverables} deliverables · {totals.milestones} milestones</p>
                  <p>{signalForPhase(phase)}</p>
                </div>

                {phase.overrideCount > 0 && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    {phase.overrideCount} override{phase.overrideCount === 1 ? '' : 's'} recorded in this phase.
                  </div>
                )}

                <Button asChild variant={isLocked ? 'secondary' : 'outline'} size="sm" className="w-full" disabled={isLocked || phase.href === '#'}>
                  <Link href={isLocked || phase.href === '#' ? '/portfolio' : phase.href}>
                    {isLocked ? 'Locked' : isPending ? 'Open scaffold' : 'Open phase'}
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-headline">Next Best Move</h2>
          </div>
          <p className="text-muted-foreground">{signalForPhase(activePhase)}</p>
          <Button asChild variant="outline">
            <Link href={activePhase.href === '#' ? '/phases/growth' : activePhase.href}>Go to {activePhase.name}</Link>
          </Button>
        </Card>

        <Card className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold font-headline">Portfolio Context</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Company: {journeyMeta?.companyName || 'Your Startup'}</p>
            <p>{journeyMeta?.startupDescription || 'Validation context will appear here after a report starts the journey.'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline">
              <Link href="/vault">Review Vault</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/decisions">Review Decisions</Link>
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}

export default function PortfolioMapPage() {
  return <PortfolioMapInner />;
}
