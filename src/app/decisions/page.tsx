'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection } from 'firebase/firestore';
import { Archive, ClipboardList, Loader2, Plus, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createDecisionLogEntry, updateDecisionOutcome } from '@/firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { DecisionLogEntry, EvidenceItem } from '@/lib/types';

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDisplayDate(value: DecisionLogEntry['createdAt']): string {
  if (!value) return 'Just now';
  const maybeTimestamp = value as { toDate?: () => Date };
  const date = maybeTimestamp.toDate ? maybeTimestamp.toDate() : new Date(String(value));
  return Number.isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString();
}

function evidenceLabel(item: EvidenceItem): string {
  return item.extracted?.summary || item.rawContent.slice(0, 110) || item.id;
}

function DecisionLogInner() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [rationale, setRationale] = useState('');
  const [optionsRejected, setOptionsRejected] = useState('');
  const [knownRisks, setKnownRisks] = useState('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [outcomeDrafts, setOutcomeDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savingOutcomeId, setSavingOutcomeId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, router, user]);

  useEffect(() => {
    const nextTitle = searchParams.get('title');
    const nextPhaseId = searchParams.get('phaseId');
    const nextRationale = searchParams.get('rationale');
    const nextEvidenceIds = searchParams.get('evidenceIds');

    if (nextTitle) setTitle(nextTitle);
    if (nextPhaseId) setPhaseId(nextPhaseId);
    if (nextRationale) setRationale(nextRationale);
    if (nextEvidenceIds) {
      setSelectedEvidenceIds(nextEvidenceIds.split(',').map((id) => id.trim()).filter(Boolean));
    }
  }, [searchParams]);

  const decisionsRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'decisions') : null),
    [firestore, user]
  );
  const evidenceRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'evidence') : null),
    [firestore, user]
  );

  const { data: decisions, isLoading: isDecisionsLoading } = useCollection<DecisionLogEntry>(decisionsRef, { suppressGlobalPermissionError: true });
  const { data: evidenceItems } = useCollection<EvidenceItem>(evidenceRef, { suppressGlobalPermissionError: true });

  const sortedDecisions = useMemo(() => {
    return [...(decisions || [])].sort((a, b) => {
      const aDate = (a.createdAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
      const bDate = (b.createdAt as { toMillis?: () => number })?.toMillis?.() ?? 0;
      return bDate - aDate;
    });
  }, [decisions]);

  const evidenceById = useMemo(() => {
    return new Map((evidenceItems || []).map((item) => [item.id, item]));
  }, [evidenceItems]);

  const toggleEvidence = (evidenceId: string) => {
    setSelectedEvidenceIds((current) => (
      current.includes(evidenceId)
        ? current.filter((id) => id !== evidenceId)
        : [...current, evidenceId]
    ));
  };

  const resetForm = () => {
    setTitle('');
    setPhaseId('');
    setRationale('');
    setOptionsRejected('');
    setKnownRisks('');
    setSelectedEvidenceIds([]);
  };

  const handleCreateDecision = async () => {
    if (!user || !firestore || !title.trim() || !rationale.trim()) return;
    setSaving(true);
    try {
      await createDecisionLogEntry(firestore, user.uid, {
        ...(phaseId.trim() ? { phaseId: phaseId.trim() } : {}),
        title: title.trim(),
        rationale: rationale.trim(),
        supportingEvidenceIds: selectedEvidenceIds,
        optionsRejected: splitLines(optionsRejected),
        knownRisks: splitLines(knownRisks),
        decidedBy: user.displayName || user.email || 'Founder',
      });
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOutcome = async (decisionId: string) => {
    const outcomeNote = outcomeDrafts[decisionId]?.trim();
    if (!user || !firestore || !outcomeNote) return;
    setSavingOutcomeId(decisionId);
    try {
      await updateDecisionOutcome(firestore, user.uid, decisionId, outcomeNote);
      setOutcomeDrafts((current) => ({ ...current, [decisionId]: '' }));
    } finally {
      setSavingOutcomeId(null);
    }
  };

  if (isUserLoading || !user) {
    return (
      <main className="container py-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
      </main>
    );
  }

  return (
    <main className="container py-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            Decision Log
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Keep the reasoning behind important founder calls connected to the evidence that supported them.
          </p>
        </div>
        <Badge variant="outline">{sortedDecisions.length} decision{sortedDecisions.length === 1 ? '' : 's'}</Badge>
      </div>

      <Card className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold font-headline">Add Decision</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="decision-title">Decision</Label>
            <Input
              id="decision-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: accept the PSF segment definition"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decision-phase">Phase</Label>
            <Input
              id="decision-phase"
              value={phaseId}
              onChange={(event) => setPhaseId(event.target.value)}
              placeholder="psf, pmf, gtm, growth"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="decision-rationale">Rationale</Label>
          <Textarea
            id="decision-rationale"
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            placeholder="What evidence, constraints, and judgment led to this call?"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="options-rejected">Options rejected</Label>
            <Textarea
              id="options-rejected"
              value={optionsRejected}
              onChange={(event) => setOptionsRejected(event.target.value)}
              placeholder="One rejected option per line"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="known-risks">Known risks</Label>
            <Textarea
              id="known-risks"
              value={knownRisks}
              onChange={(event) => setKnownRisks(event.target.value)}
              placeholder="One risk per line"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label>Supporting evidence</Label>
            <Badge variant="secondary">{selectedEvidenceIds.length} selected</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
            {(evidenceItems || []).length > 0 ? (
              (evidenceItems || []).map((item) => (
                <label key={item.id} className="flex items-start gap-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm">
                  <Checkbox
                    checked={selectedEvidenceIds.includes(item.id)}
                    onCheckedChange={() => toggleEvidence(item.id)}
                    className="mt-1"
                  />
                  <span className="space-y-2">
                    <span className="flex flex-wrap gap-2">
                      <Badge>{item.strength}</Badge>
                      <Badge variant="outline">{item.source}</Badge>
                      {item.tags?.phaseId && <Badge variant="secondary">{item.tags.phaseId}</Badge>}
                    </span>
                    <span className="block text-muted-foreground">{evidenceLabel(item)}</span>
                  </span>
                </label>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-white/20 p-6 text-sm text-muted-foreground md:col-span-2">
                <Archive className="mb-2 h-5 w-5" />
                No Vault evidence is available yet.
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleCreateDecision}
          disabled={saving || !title.trim() || !rationale.trim()}
          className="shadow-button-primary"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save decision
        </Button>
      </Card>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">Saved Decisions</h2>
        {isDecisionsLoading ? (
          <Card className="glass-card p-8 text-center text-muted-foreground">Loading decisions...</Card>
        ) : sortedDecisions.length > 0 ? (
          <div className="space-y-4">
            {sortedDecisions.map((decision) => {
              const linkedEvidence = decision.supportingEvidenceIds
                .map((id) => evidenceById.get(id))
                .filter((item): item is EvidenceItem => Boolean(item));

              return (
                <Card key={decision.id} className="glass-card p-6 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {decision.phaseId && <Badge variant="secondary">{decision.phaseId}</Badge>}
                        <Badge variant="outline">{toDisplayDate(decision.createdAt)}</Badge>
                      </div>
                      <h3 className="text-xl font-bold font-headline">{decision.title}</h3>
                      <p className="text-sm text-muted-foreground">Decided by {decision.decidedBy}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-6">{decision.rationale}</p>

                  {linkedEvidence.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold font-mono tracking-wider text-muted-foreground">SUPPORTING EVIDENCE</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {linkedEvidence.map((item) => (
                          <div key={item.id} className="rounded-md bg-white/5 p-3 text-sm">
                            <div className="mb-2 flex flex-wrap gap-2">
                              <Badge>{item.strength}</Badge>
                              <Badge variant="outline">{item.source}</Badge>
                            </div>
                            <p className="text-muted-foreground">{evidenceLabel(item)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(decision.optionsRejected.length > 0 || decision.knownRisks.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {decision.optionsRejected.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold font-mono tracking-wider text-muted-foreground mb-2">OPTIONS REJECTED</h4>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {decision.optionsRejected.map((option, index) => <li key={index}>{option}</li>)}
                          </ul>
                        </div>
                      )}
                      {decision.knownRisks.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold font-mono tracking-wider text-muted-foreground mb-2">KNOWN RISKS</h4>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {decision.knownRisks.map((risk, index) => <li key={index}>{risk}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {decision.outcomeNote && (
                    <div className="rounded-md border border-[#ff7a00]/30 bg-[#ff7a00]/10 p-3 text-sm">
                      <p className="font-semibold text-[#ffc400]">Outcome note</p>
                      <p className="text-muted-foreground mt-1">{decision.outcomeNote}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 md:flex-row">
                    <Input
                      value={outcomeDrafts[decision.id] || ''}
                      onChange={(event) => setOutcomeDrafts((current) => ({ ...current, [decision.id]: event.target.value }))}
                      placeholder="Add what happened after this decision"
                    />
                    <Button
                      onClick={() => handleUpdateOutcome(decision.id)}
                      disabled={savingOutcomeId === decision.id || !outcomeDrafts[decision.id]?.trim()}
                      variant="outline"
                    >
                      {savingOutcomeId === decision.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save outcome
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-card text-center py-16 px-6">
            <ClipboardList className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="text-xl font-bold font-headline">No decisions saved yet</h3>
            <p className="text-muted-foreground mt-2">Save the first important founder call when the evidence justifies it.</p>
          </Card>
        )}
      </section>
    </main>
  );
}

export default function DecisionLogPage() {
  return (
    <Suspense fallback={<main className="container py-8 text-center"><Loader2 className="mx-auto h-12 w-12 animate-spin" /></main>}>
      <DecisionLogInner />
    </Suspense>
  );
}
