'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Archive, ClipboardList, FileText, Flag, MessageSquare, WandSparkles } from 'lucide-react';
import { ActivityCard } from './activity-card';
import { DeliverableCard } from './deliverable-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { FullPhaseData, IdeamaitContext } from '@/lib/phases/types';
import { buildDevAutofillPhaseState } from '@/lib/phases/dev-autofill';
import { getPhaseProgress } from '@/lib/phases/progress';
import { useToast } from '@/hooks/use-toast';

export function PhaseView({
  phaseData,
  context,
  phaseState,
  onUpdateState,
  enableDevAutofill = false,
  devNextHref,
  devNextLabel
}: {
  phaseData: FullPhaseData;
  context: IdeamaitContext;
  phaseState: any;
  onUpdateState: (newState: any) => void | Promise<void>;
  enableDevAutofill?: boolean;
  devNextHref?: string;
  devNextLabel?: string;
}) {
  const [activeSubPhaseIndex, setActiveSubPhaseIndex] = useState(0);
  const activeSubPhase = phaseData.subPhasesData[activeSubPhaseIndex];
  const { toast } = useToast();

  const handleUpdateActivity = (activityId: string, newState: any) => {
    onUpdateState({
      ...phaseState,
      [activeSubPhase.id]: {
        ...(phaseState[activeSubPhase.id] || {}),
        activities: {
          ...(phaseState[activeSubPhase.id]?.activities || {}),
          [activityId]: newState
        }
      }
    });
  };

  const handleUpdateDeliverable = (deliverableId: string, newState: any) => {
    onUpdateState({
      ...phaseState,
      [activeSubPhase.id]: {
        ...(phaseState[activeSubPhase.id] || {}),
        deliverables: {
          ...(phaseState[activeSubPhase.id]?.deliverables || {}),
          [deliverableId]: newState
        }
      }
    });
  };

  const handleToggleMilestone = (milestoneId: string, checked: boolean) => {
    onUpdateState({
      ...phaseState,
      [activeSubPhase.id]: {
        ...(phaseState[activeSubPhase.id] || {}),
        milestones: {
          ...(phaseState[activeSubPhase.id]?.milestones || {}),
          [milestoneId]: checked
        }
      }
    });
  };

  const handlePhaseCoach = async () => {
    toast({ title: 'Ideamait coaching', description: 'Reading your current phase state.' });
    try {
      const res = await fetch('/api/ideamait/phase-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      if (!res.ok) throw new Error('Phase coaching request failed');
      const { response } = await res.json();
      toast({ title: 'Ideamait coaching', description: response, duration: 10000 });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Phase coaching failed.' });
    }
  };

  const handleDevAutofill = async () => {
    await Promise.resolve(onUpdateState(buildDevAutofillPhaseState(phaseData)));
    toast({
      title: 'Dev autofill applied',
      description: `${phaseData.name} is marked complete for admin testing.`,
    });
  };

  const handleDevCompleteAndGo = async () => {
    await Promise.resolve(onUpdateState(buildDevAutofillPhaseState(phaseData)));
    toast({
      title: 'Dev phase completed',
      description: devNextHref && devNextLabel
        ? `Opening ${devNextLabel.replace(/^Dev open /, '')}.`
        : `${phaseData.name} is marked complete for admin testing.`,
    });
    if (devNextHref) {
      window.location.href = `${devNextHref}${devNextHref.includes('?') ? '&' : '?'}dev=1`;
    }
  };

  const { activityPct, deliverablePct, milestonePct, masterProgress } = getPhaseProgress(phaseData, phaseState);
  const isJourneyComplete = phaseData.id === 'exit' && masterProgress >= 80 && milestonePct >= 80;
  const devActionLabel = devNextLabel
    ? devNextLabel.replace('Dev open', 'Dev complete + open').replace('Dev finish', 'Dev complete + finish')
    : 'Dev complete';

  return (
    <main className="min-h-screen bg-[var(--lc-bg)] pb-24 text-[var(--lc-text)]">
      <div className="sticky top-0 z-40 border-b border-[var(--lc-divider)] bg-[var(--lc-bg)]/95 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="lc-eyebrow">Deep work</p>
            <div className="font-headline text-lg font-semibold">{phaseData.name}</div>
          </div>
          <nav className="flex items-center gap-2">
            {enableDevAutofill && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDevAutofill}
                className="lc-secondary-button text-xs"
              >
                <WandSparkles className="mr-2 h-4 w-4" />
                Dev autofill
              </Button>
            )}
            {enableDevAutofill && devNextLabel && (
              <Button type="button" size="sm" className="text-xs" onClick={handleDevCompleteAndGo}>
                {devActionLabel}
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="text-xs text-[var(--lc-text-muted)]">
              <Link href="/portfolio">Journey</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[var(--lc-text-muted)]">
              <Link href="/vault">Vault</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[var(--lc-text-muted)]">
              <Link href="/decisions">Decisions</Link>
            </Button>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-6 pt-10">
        <section className="lc-card p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="lc-eyebrow">
                Current - Phase {phaseData.journeyPosition} of {phaseData.journeyTotal}{phaseData.id === 'exit' ? ' - Final' : ''}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-normal text-[var(--lc-text)] md:text-5xl">{phaseData.name}</h1>
              <p className="mt-4 text-sm leading-6 text-[var(--lc-text-2)]">{phaseData.tagline}</p>
            </div>
            <div className="font-code text-6xl font-bold" style={{ color: phaseData.accentColor }}>
              {Math.round(masterProgress)}%
            </div>
          </div>

          {enableDevAutofill && (
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleDevAutofill}
                className="lc-secondary-button"
              >
                <WandSparkles className="mr-2 h-4 w-4" />
                Dev autofill phase
              </Button>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between font-code text-xs text-[var(--lc-text-faint)]">
                <span>ACTIVITIES 30%</span>
                <span>{Math.round(activityPct)}%</span>
              </div>
              <Progress value={activityPct} className="h-1.5 bg-[var(--lc-border)]" indicatorColor={phaseData.accentColor} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-code text-xs text-[var(--lc-text-faint)]">
                <span>DELIVERABLES 40%</span>
                <span>{Math.round(deliverablePct)}%</span>
              </div>
              <Progress value={deliverablePct} className="h-1.5 bg-[var(--lc-border)]" indicatorColor={phaseData.accentColor} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-code text-xs text-[var(--lc-text-faint)]">
                <span>MILESTONES 30%</span>
                <span>{Math.round(milestonePct)}%</span>
              </div>
              <Progress value={milestonePct} className="h-1.5 bg-[var(--lc-border)]" indicatorColor={phaseData.accentColor} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 border-b border-[var(--lc-divider)] pb-3">
          {phaseData.subPhasesData.map((subPhase, index) => (
            <button
              key={subPhase.id}
              type="button"
              onClick={() => setActiveSubPhaseIndex(index)}
              className={cn(
                'rounded-[var(--lc-radius-pill)] border px-4 py-2 font-code text-xs font-bold uppercase tracking-[0.12em] transition-colors',
                activeSubPhaseIndex === index
                  ? 'border-[var(--lc-psf)] bg-[var(--lc-ok-fill)] text-[var(--lc-ok-text)]'
                  : 'border-[var(--lc-border-muted)] text-[var(--lc-text-muted)] hover:text-[var(--lc-text)]'
              )}
            >
              {subPhase.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="lc-eyebrow">Activities</h2>
                <p className="text-xs text-[var(--lc-text-faint)]">Add evidence, assess it, then make the founder decision.</p>
              </div>
              <div>
                {activeSubPhase.activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    phaseId={phaseData.id}
                    subPhaseId={activeSubPhase.id}
                    context={context}
                    activityState={phaseState[activeSubPhase.id]?.activities?.[activity.id]}
                    onUpdateState={(state) => handleUpdateActivity(activity.id, state)}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="lc-eyebrow flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Deliverables
              </h2>
              <div>
                {activeSubPhase.deliverables.map((deliverable) => (
                  <DeliverableCard
                    key={deliverable.id}
                    deliverable={deliverable}
                    deliverableState={phaseState[activeSubPhase.id]?.deliverables?.[deliverable.id]}
                    onUpdateState={(state) => handleUpdateDeliverable(deliverable.id, state)}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:col-span-4">
            {isJourneyComplete && (
              <Card className="border-[#1D9E75]/50 bg-[#1D9E75]/10 p-5 text-[#5DCAA5]">
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-[#1D9E75]/50 bg-[#1D9E75]/15">
                    <Flag className="h-4 w-4" />
                  </span>
                  <h2 className="font-headline text-lg font-bold text-[#D6FFF0]">Journey completion</h2>
                </div>
                <p className="text-sm leading-6 text-[#B7F3DC]">
                  The phases are a map, not a verdict. Most companies revisit earlier phases more than once, and the discipline to do so is what separates durable businesses from fragile ones.
                </p>
              </Card>
            )}

            <Card className="lc-card p-5">
              <h2 className="lc-eyebrow mb-4">Exit milestones</h2>
              <div className="space-y-4">
                {activeSubPhase.exitMilestones.map((milestone) => {
                  const isMet = phaseState[activeSubPhase.id]?.milestones?.[milestone.id] || false;
                  return (
                    <label key={milestone.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={isMet}
                        onCheckedChange={(checked) => handleToggleMilestone(milestone.id, !!checked)}
                        className="mt-1 data-[state=checked]:border-[var(--lc-ok-border)] data-[state=checked]:bg-[var(--lc-ok)]"
                      />
                      <span>
                        <span className={cn('block text-sm font-semibold text-[var(--lc-text)]', isMet && 'text-[var(--lc-text-faint)] line-through')}>
                          {milestone.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--lc-text-faint)]">{milestone.target}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Card>

            <Card className="lc-card p-5">
              <h2 className="lc-eyebrow mb-4">Watchouts</h2>
              <div className="space-y-3">
                {activeSubPhase.pitfalls.map((pitfall, index) => (
                  <div
                    key={index}
                    className={cn(
                      'rounded-[var(--lc-radius-ctrl)] border p-3 text-sm leading-5',
                      pitfall.severity === 'critical'
                        ? 'border-[var(--lc-danger)] text-[var(--lc-danger-text)]'
                        : pitfall.severity === 'warning'
                          ? 'border-[var(--lc-warn-border)] bg-[var(--lc-warn-fill)] text-[var(--lc-warn-text)]'
                          : 'border-[var(--lc-info-border)] bg-[var(--lc-info-fill)] text-[var(--lc-info-text)]'
                    )}
                  >
                    <div className="flex gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{pitfall.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-3">
              <Button asChild variant="outline" className="lc-secondary-button justify-start">
                <Link href="/vault">
                  <Archive className="mr-2 h-4 w-4" />
                  Review Vault
                </Link>
              </Button>
              <Button asChild variant="outline" className="lc-secondary-button justify-start">
                <Link href="/decisions">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Review decisions
                </Link>
              </Button>
              <Button
                type="button"
                onClick={handlePhaseCoach}
                className="h-auto min-h-10 w-full justify-start whitespace-normal bg-[var(--lc-psf)] py-3 text-left text-[0.72rem] leading-tight tracking-[0.08em] text-white hover:bg-[var(--lc-psf)]/90"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="min-w-0 flex-1">Ask Ideamait for phase coaching</span>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
