'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { collection } from 'firebase/firestore';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  FileText,
  History,
  Image,
  Loader2,
  Mic,
  Paperclip,
  RotateCcw,
  Sparkles,
  Upload
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createEvidenceItem } from '@/firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type {
  ActivityAssessment,
  ActivityAuditEvent,
  ActivityAuditTrailEntry,
  ActivityData,
  ActivityState,
  FounderDecision,
  IdeamaitContext
} from '@/lib/phases/types';
import type { EvidenceItem, EvidenceSource, EvidenceStrength, ExtractedEvidence } from '@/lib/types';

type IntakeMode = 'paste' | 'manual' | null;

function evidenceSourceToStrength(source: EvidenceSource): EvidenceStrength {
  if (source === 'uploaded' || source === 'screenshot') return 'strong';
  if (source === 'pasted') return 'moderate';
  return 'weak';
}

function evidenceIcon(source: EvidenceSource) {
  if (source === 'screenshot') return Image;
  if (source === 'uploaded') return Paperclip;
  if (source === 'pasted') return FileText;
  return Mic;
}

function strengthClass(strength: EvidenceStrength) {
  if (strength === 'strong') return 'border-[var(--lc-ok-border)] bg-[var(--lc-ok-fill)] text-[var(--lc-ok-text)]';
  if (strength === 'moderate') return 'border-[var(--lc-info-border)] bg-[var(--lc-info-fill)] text-[var(--lc-info-text)]';
  return 'border-[var(--lc-warn-border)] bg-[var(--lc-warn-fill)] text-[var(--lc-warn-text)]';
}

function signalClass(signal?: ActivityAssessment['signal']) {
  if (signal === 'strong') return 'border-[var(--lc-ok-border)] bg-[var(--lc-ok-fill)] text-[var(--lc-ok-text)]';
  if (signal === 'developing') return 'border-[var(--lc-info-border)] bg-[var(--lc-info-fill)] text-[var(--lc-info-text)]';
  return 'border-[var(--lc-warn-border)] bg-[var(--lc-warn-fill)] text-[var(--lc-warn-text)]';
}

function signalLabel(signal: ActivityAssessment['signal']) {
  if (signal === 'insufficient') return 'Insufficient signal';
  if (signal === 'weak') return 'Weak signal';
  if (signal === 'developing') return 'Developing signal';
  return 'Strong signal';
}

function readEvidenceFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);

    if (file.type.startsWith('text/') || file.type === 'application/json') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
}

async function extractEvidence(rawContent: string, phaseName: string, activityName: string): Promise<ExtractedEvidence | null> {
  const response = await fetch('/api/ideamait/extract-evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawContent,
      hintContext: { phaseName, activityName },
    }),
  });

  if (!response.ok) return null;
  return response.json();
}

export function ActivityCard({
  activity,
  phaseId,
  subPhaseId,
  context,
  activityState,
  onUpdateState
}: {
  activity: ActivityData;
  phaseId: string;
  subPhaseId: string;
  context: IdeamaitContext;
  activityState?: ActivityState;
  onUpdateState: (newState: ActivityState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [intakeMode, setIntakeMode] = useState<IntakeMode>(null);
  const [rawContent, setRawContent] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [source, setSource] = useState<EvidenceSource>('pasted');
  const [segment, setSegment] = useState('');
  const [fileName, setFileName] = useState('');
  const [savingEvidence, setSavingEvidence] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const status = activityState?.status || 'not-started';
  const evidenceIds = activityState?.evidenceIds || [];
  const aiAssessment = activityState?.aiAssessment || null;
  const founderDecision: FounderDecision = activityState?.founderDecision ?? null;
  const isOverride = !!activityState?.isOverride;
  const auditTrail: ActivityAuditTrailEntry[] = activityState?.auditTrail || [];
  const isAccepted = founderDecision === 'accepted' || founderDecision === 'overridden';

  const evidenceCollectionRef = useMemoFirebase(
    () => (expanded && user && firestore ? collection(firestore, 'users', user.uid, 'evidence') : null),
    [expanded, user, firestore]
  );
  const { data: allEvidence } = useCollection<EvidenceItem>(evidenceCollectionRef, { suppressGlobalPermissionError: true });

  const taggedEvidence = useMemo(() => {
    return (allEvidence || []).filter((item) => (
      item.tags?.phaseId === phaseId &&
      item.tags?.subPhaseId === subPhaseId &&
      item.tags?.activityId === activity.id
    ));
  }, [activity.id, allEvidence, phaseId, subPhaseId]);

  const linkedDecisionEvidenceIds = Array.from(new Set([...evidenceIds, ...taggedEvidence.map((item) => item.id)]));
  const decisionParams = new URLSearchParams({ phaseId, title: activity.subtitle });
  if (linkedDecisionEvidenceIds.length > 0) decisionParams.set('evidenceIds', linkedDecisionEvidenceIds.join(','));
  if (aiAssessment?.rationale) decisionParams.set('rationale', aiAssessment.rationale);
  const decisionLogHref = `/decisions?${decisionParams.toString()}`;

  const appendAudit = (event: ActivityAuditEvent, detail: string): ActivityAuditTrailEntry[] => ([
    ...auditTrail,
    { at: new Date().toISOString(), event, detail },
  ]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSource(file.type.startsWith('image/') ? 'screenshot' : 'uploaded');
    setRawContent(await readEvidenceFile(file));
  };

  const saveEvidence = async (mode: Exclude<IntakeMode, null>) => {
    const content = mode === 'manual' ? manualContent : rawContent;
    if (!user || !firestore || !content.trim()) return;

    setSavingEvidence(true);
    try {
      const evidenceSource: EvidenceSource = mode === 'manual' ? 'typed' : source;
      const extracted = await extractEvidence(content, context.currentPhaseName, activity.subtitle);
      const evidenceId = await createEvidenceItem(firestore, user.uid, {
        source: evidenceSource,
        rawContent: content,
        storagePath: fileName || undefined,
        extracted,
        tags: {
          phaseId,
          subPhaseId,
          activityId: activity.id,
          ...(segment ? { segment } : {}),
        },
        strength: evidenceSourceToStrength(evidenceSource),
      });

      onUpdateState({
        ...activityState,
        evidenceIds: Array.from(new Set([...evidenceIds, evidenceId])),
        status: status === 'not-started' ? 'in-progress' : status,
        auditTrail: appendAudit('evidence-added', `Evidence item ${evidenceId} was added.`),
      });

      setRawContent('');
      setManualContent('');
      setSegment('');
      setFileName('');
      setSource('pasted');
      setIntakeMode(null);
    } finally {
      setSavingEvidence(false);
    }
  };

  const handleAssessEvidence = async () => {
    setAssessing(true);
    try {
      const taggedVaultEvidence = taggedEvidence.map((item) => ({
        id: item.id,
        strength: item.strength,
        source: item.source,
        summary: item.extracted?.summary,
        metrics: item.extracted?.metrics || [],
        quotes: item.extracted?.quotes || [],
        signalType: item.extracted?.signalType,
      }));

      const res = await fetch('/api/ideamait/assess-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            ...context,
            currentActivityName: activity.subtitle,
            taggedVaultEvidence,
          },
          taggedEvidence: taggedVaultEvidence,
        }),
      });

      if (!res.ok) throw new Error('Activity assessment request failed');
      const result = await res.json();

      onUpdateState({
        ...activityState,
        status: status === 'not-started' ? 'in-progress' : status,
        aiAssessment: { ...result, assessedAt: new Date().toISOString() },
        auditTrail: appendAudit('assessed', `Evidence assessed as ${result.signal} with ${result.confidence}% confidence.`),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAssessing(false);
    }
  };

  const handleFounderDecision = (decision: 'accepted' | 'still-testing' | 'overridden') => {
    const signal = aiAssessment?.signal;
    const weakAccept = decision === 'accepted' && (signal === 'insufficient' || signal === 'weak');
    const override = decision === 'overridden' || weakAccept;
    const decisionEvent: ActivityAuditEvent =
      decision === 'still-testing' ? 'still-testing' : override ? 'overridden' : 'accepted';

    onUpdateState({
      ...activityState,
      status: decision === 'still-testing' ? 'in-progress' : 'accepted',
      founderDecision: decision,
      isOverride: override,
      auditTrail: appendAudit(
        decisionEvent,
        decision === 'still-testing'
          ? 'Founder chose to keep testing.'
          : override
            ? 'Founder accepted despite a weak or insufficient signal; override recorded.'
            : 'Founder accepted the activity and advanced.'
      ),
    });
  };

  const handleReopen = () => {
    onUpdateState({
      ...activityState,
      status: 'in-progress',
      founderDecision: null,
      isOverride: false,
      auditTrail: appendAudit('reopened', 'Founder reopened the activity for more testing.'),
    });
  };

  return (
    <Card
      className={cn(
        'mb-4 overflow-hidden transition-colors lc-card',
        isAccepted && 'border-[var(--lc-ok-border)]'
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        onClick={() => setExpanded((current) => !current)}
      >
        <div className="flex min-w-0 items-center gap-4">
          {isAccepted ? (
            <CheckCircle2 className="h-6 w-6 shrink-0 text-[var(--lc-ok-text)]" />
          ) : status === 'in-progress' ? (
            <Circle className="h-6 w-6 shrink-0 text-[var(--lc-info-text)]" />
          ) : (
            <Circle className="h-6 w-6 shrink-0 text-[var(--lc-text-faint)]" />
          )}
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-[var(--lc-text)]">{activity.subtitle}</h3>
            <p className="mt-1 font-code text-xs text-[var(--lc-text-faint)]">{activity.id}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              'rounded-[var(--lc-radius-pill)] border px-2.5 py-1 font-code text-[11px] uppercase tracking-[0.12em]',
              isAccepted
                ? 'border-[var(--lc-ok-border)] bg-[var(--lc-ok-fill)] text-[var(--lc-ok-text)]'
                : 'border-[var(--lc-border-muted)] text-[var(--lc-text-faint)]'
            )}
          >
            {founderDecision === 'overridden' ? 'Override accepted' : founderDecision === 'accepted' ? 'Accepted' : founderDecision === 'still-testing' ? 'Still testing' : 'Open'}
          </span>
          <ChevronRight className={cn('h-5 w-5 text-[var(--lc-text-faint)] transition-transform', expanded && 'rotate-90')} />
        </div>
      </button>

      {expanded && (
        <div className="space-y-6 border-t border-[var(--lc-divider)] p-4">
          <div className="lc-inset p-4">
            <p className="text-sm leading-6 text-[var(--lc-text-2)]">{activity.learnMore}</p>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="lc-eyebrow">Evidence - {taggedEvidence.length} item{taggedEvidence.length === 1 ? '' : 's'} tagged to this activity</h4>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-[var(--lc-text-muted)]">
                <Link href="/vault">Open Vault</Link>
              </Button>
            </div>

            <div className="space-y-2">
              {taggedEvidence.length > 0 ? (
                taggedEvidence.map((item) => {
                  const Icon = evidenceIcon(item.source);
                  return (
                    <div key={item.id} className="lc-inset flex items-start gap-3 p-3">
                      <div className="mt-0.5 rounded-[var(--lc-radius-ctrl)] border border-[var(--lc-border)] bg-[var(--lc-card)] p-2 text-[var(--lc-text-muted)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-5 text-[var(--lc-text-2)]">
                          {item.extracted?.summary || 'Raw evidence is saved. Run extraction from the Vault if more structure is needed.'}
                        </p>
                        {item.extracted?.quotes?.[0] && (
                          <p className="mt-2 border-l border-[var(--lc-border-muted)] pl-3 text-xs text-[var(--lc-text-faint)]">
                            {item.extracted.quotes[0]}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={cn('shrink-0 rounded-[var(--lc-radius-pill)] font-code text-[11px] uppercase', strengthClass(item.strength))}>
                        {item.strength}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="lc-inset p-4 text-sm text-[var(--lc-text-muted)]">
                  No evidence has been tagged to this activity yet.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" className="lc-dashed-button h-11" onClick={() => setIntakeMode(intakeMode === 'paste' ? null : 'paste')}>
                <Upload className="mr-2 h-4 w-4" />
                Paste or upload
              </Button>
              <Button type="button" variant="outline" className="lc-dashed-button h-11" onClick={() => setIntakeMode(intakeMode === 'manual' ? null : 'manual')}>
                <FileText className="mr-2 h-4 w-4" />
                Enter manually
              </Button>
            </div>

            {intakeMode === 'paste' && (
              <div className="lc-inset space-y-3 p-4">
                <Textarea
                  value={rawContent}
                  onChange={(event) => setRawContent(event.target.value)}
                  placeholder="Paste interview notes, transcript excerpts, waitlist results, customer quotes, or other raw evidence."
                  rows={4}
                  className="border-[var(--lc-border)] bg-[var(--lc-bg)] text-[var(--lc-text)]"
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <select
                    value={source}
                    onChange={(event) => setSource(event.target.value as EvidenceSource)}
                    className="rounded-[var(--lc-radius-ctrl)] border border-[var(--lc-border)] bg-[var(--lc-bg)] px-3 py-2 text-sm text-[var(--lc-text)]"
                  >
                    <option value="pasted">pasted</option>
                    <option value="typed">typed</option>
                    <option value="uploaded">uploaded</option>
                    <option value="screenshot">screenshot</option>
                  </select>
                  <Input
                    value={segment}
                    onChange={(event) => setSegment(event.target.value)}
                    placeholder="Optional segment"
                    className="border-[var(--lc-border)] bg-[var(--lc-bg)]"
                  />
                  <Input type="file" onChange={handleFileChange} className="border-[var(--lc-border)] bg-[var(--lc-bg)]" />
                </div>
                {fileName && <p className="text-xs text-[var(--lc-text-faint)]">Selected file: {fileName}</p>}
                <Button
                  type="button"
                  onClick={() => saveEvidence('paste')}
                  disabled={savingEvidence || !rawContent.trim()}
                  className="w-full bg-[var(--lc-psf)] text-white hover:bg-[var(--lc-psf)]/90"
                >
                  {savingEvidence ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Save evidence and extract
                </Button>
              </div>
            )}

            {intakeMode === 'manual' && (
              <div className="lc-inset space-y-3 p-4">
                <Textarea
                  value={manualContent}
                  onChange={(event) => setManualContent(event.target.value)}
                  placeholder="Record a manual observation. Include what happened, who it involved, and why it matters."
                  rows={4}
                  className="border-[var(--lc-border)] bg-[var(--lc-bg)] text-[var(--lc-text)]"
                />
                <Button
                  type="button"
                  onClick={() => saveEvidence('manual')}
                  disabled={savingEvidence || !manualContent.trim()}
                  className="w-full bg-[var(--lc-psf)] text-white hover:bg-[var(--lc-psf)]/90"
                >
                  {savingEvidence ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Save manual evidence
                </Button>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <Button
              type="button"
              onClick={handleAssessEvidence}
              disabled={assessing || taggedEvidence.length === 0}
              variant="outline"
              className="lc-secondary-button h-12 w-full"
            >
              {assessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Assess my evidence with Ideamait
            </Button>
            {taggedEvidence.length === 0 && (
              <p className="text-center text-xs text-[var(--lc-warn-text)]">Add Vault evidence before asking for an assessment.</p>
            )}

            {aiAssessment && (
              <div className="lc-inset space-y-4 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={cn('rounded-[var(--lc-radius-pill)] font-code text-[11px] uppercase', signalClass(aiAssessment.signal))}>
                    {signalLabel(aiAssessment.signal)}
                  </Badge>
                  <span className="font-code text-xs text-[var(--lc-text-faint)]">Ideamait confidence {aiAssessment.confidence}%</span>
                </div>
                <p className="text-sm leading-6 text-[var(--lc-text-2)]">{aiAssessment.rationale}</p>
                {aiAssessment.gaps.length > 0 && (
                  <div className="rounded-[var(--lc-radius-ctrl)] border border-[var(--lc-warn-border)] bg-[var(--lc-warn-fill)] p-3 text-[var(--lc-warn-text)]">
                    <div className="mb-2 flex items-center gap-2 font-code text-xs uppercase tracking-[0.12em]">
                      <AlertTriangle className="h-4 w-4" />
                      Evidence gap
                    </div>
                    <ul className="space-y-1 text-sm">
                      {aiAssessment.gaps.map((gap, index) => <li key={index}>{gap}</li>)}
                    </ul>
                  </div>
                )}
                <div className="space-y-3">
                  <p className="lc-eyebrow">Your decision - Ideamait recommends: {aiAssessment.recommendedStatus.replace(/-/g, ' ')}</p>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <Button type="button" onClick={() => handleFounderDecision('accepted')} className="bg-[var(--lc-ok)] text-white hover:bg-[var(--lc-ok)]/90">
                      Accept and advance
                    </Button>
                    <Button type="button" onClick={() => handleFounderDecision('still-testing')} variant="outline" className="lc-secondary-button">
                      Keep testing
                    </Button>
                    <Button type="button" onClick={() => handleFounderDecision('overridden')} variant="outline" className="border-[var(--lc-warn-border)] bg-[var(--lc-warn-fill)] text-[var(--lc-warn-text)]">
                      Override anyway
                    </Button>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-[var(--lc-text-faint)]">
                    <History className="h-4 w-4" />
                    Any decision is recorded in the audit trail. Overrides against weak evidence stay flagged.
                  </p>
                </div>
              </div>
            )}
          </section>

          {isOverride && (
            <div className="rounded-[var(--lc-radius-ctrl)] border border-[var(--lc-warn-border)] bg-[var(--lc-warn-fill)] p-3 text-sm text-[var(--lc-warn-text)]">
              Founder accepted despite a weak or insufficient signal. Override recorded.
            </div>
          )}

          {founderDecision && founderDecision !== 'still-testing' && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Button asChild variant="outline" className="lc-secondary-button">
                <Link href={decisionLogHref}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Log the decision behind this
                </Link>
              </Button>
              <Button type="button" onClick={handleReopen} variant="outline" className="lc-secondary-button">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reopen activity
              </Button>
            </div>
          )}

          {auditTrail.length > 0 && (
            <section className="lc-inset space-y-3 p-4">
              <h4 className="lc-eyebrow flex items-center gap-2">
                <History className="h-4 w-4" />
                Audit trail
              </h4>
              <div className="space-y-2">
                {auditTrail.slice().reverse().map((entry, index) => (
                  <div key={`${entry.event}-${index}`} className="flex gap-3 text-xs text-[var(--lc-text-2)]">
                    <span className="min-w-24 font-code uppercase text-[var(--lc-text-faint)]">{entry.event}</span>
                    <span>{entry.detail}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Card>
  );
}
