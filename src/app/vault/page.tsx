'use client';

import React, { useMemo, useState } from 'react';
import { collection } from 'firebase/firestore';
import { FileText, Loader2, Plus, Sparkles } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { createEvidenceItem, updateEvidenceExtraction } from '@/firebase/firestore';
import type { EvidenceItem, EvidenceSource, EvidenceStrength, ExtractedEvidence, EvidenceTags } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const phaseOptions = [
  { value: 'psf', label: 'Problem-Solution Fit' },
  { value: 'pmf', label: 'Product-Market Fit' },
  { value: 'gtm', label: 'Go-to-Market Fit' },
  { value: 'growth', label: 'Growth' },
  { value: 'exit', label: 'Maturity & Exit-Readiness' },
];

const sourceOptions: EvidenceSource[] = ['typed', 'pasted', 'uploaded', 'screenshot'];
const strengthOptions: EvidenceStrength[] = ['weak', 'moderate', 'strong'];

function sourceToStrength(source: EvidenceSource): EvidenceStrength {
  if (source === 'uploaded' || source === 'screenshot') return 'strong';
  if (source === 'pasted') return 'moderate';
  return 'weak';
}

async function extractRawEvidence(rawContent: string, hintContext?: { phaseName?: string; activityName?: string }): Promise<ExtractedEvidence | null> {
  const response = await fetch('/api/ideamait/extract-evidence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawContent, hintContext }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function readFileAsRawContent(file: File): Promise<string> {
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

function formatDate(value: any) {
  if (!value) return 'Recently';
  if (typeof value.toDate === 'function') return value.toDate().toLocaleDateString();
  if (typeof value === 'string') return new Date(value).toLocaleDateString();
  return 'Recently';
}

export default function EvidenceVaultPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [rawContent, setRawContent] = useState('');
  const [source, setSource] = useState<EvidenceSource>('typed');
  const [phaseId, setPhaseId] = useState('');
  const [activityId, setActivityId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [segment, setSegment] = useState('');
  const [strengthFilter, setStrengthFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const evidenceRef = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'evidence') : null),
    [user, firestore]
  );
  const { data: evidenceItems, isLoading } = useCollection<EvidenceItem>(evidenceRef, { suppressGlobalPermissionError: true });

  const filteredEvidence = useMemo(() => {
    return (evidenceItems || []).filter((item) => {
      if (phaseFilter && item.tags?.phaseId !== phaseFilter) return false;
      if (activityFilter && item.tags?.activityId !== activityFilter) return false;
      if (milestoneFilter && item.tags?.milestoneId !== milestoneFilter) return false;
      if (segmentFilter && item.tags?.segment !== segmentFilter) return false;
      if (strengthFilter && item.strength !== strengthFilter) return false;
      return true;
    });
  }, [activityFilter, evidenceItems, milestoneFilter, phaseFilter, segmentFilter, strengthFilter]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setSource(file.type.startsWith('image/') ? 'screenshot' : 'uploaded');
    setRawContent(await readFileAsRawContent(file));
  };

  const handleAddEvidence = async () => {
    if (!user || !firestore || !rawContent.trim()) return;
    setIsSaving(true);

    try {
      const selectedPhase = phaseOptions.find((phase) => phase.value === phaseId);
      const extracted = await extractRawEvidence(rawContent, {
        phaseName: selectedPhase?.label,
        activityName: activityId || undefined,
      });
      const tags: EvidenceTags = {
        ...(phaseId ? { phaseId } : {}),
        ...(activityId ? { activityId } : {}),
        ...(milestoneId ? { milestoneId } : {}),
        ...(segment ? { segment } : {}),
      };

      await createEvidenceItem(firestore, user.uid, {
        source,
        rawContent,
        storagePath: selectedFileName || undefined,
        extracted,
        tags,
        strength: sourceToStrength(source),
      });

      setRawContent('');
      setSelectedFileName('');
      setActivityId('');
      setMilestoneId('');
      setSegment('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtractExisting = async (item: EvidenceItem) => {
    if (!user || !firestore) return;
    const selectedPhase = phaseOptions.find((phase) => phase.value === item.tags?.phaseId);
    const extracted = await extractRawEvidence(item.rawContent, {
      phaseName: selectedPhase?.label,
      activityName: item.tags?.activityId,
    });
    if (extracted) {
      await updateEvidenceExtraction(firestore, user.uid, item.id, extracted);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-lg p-8 text-center space-y-4 bg-black/30">
          <h1 className="text-3xl font-bold font-headline">Evidence Vault</h1>
          <p className="text-muted-foreground">Sign in to collect founder evidence across your LaunchCode journey.</p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-mono uppercase tracking-wider text-primary">Founder Memory</p>
            <h1 className="text-4xl font-bold font-headline">Evidence Vault</h1>
          </div>
          <Badge variant="outline" className="w-fit">{filteredEvidence.length} items shown</Badge>
        </div>

        <Card className="p-5 bg-black/30 border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 space-y-3">
              <label className="text-sm font-semibold">Raw evidence</label>
              <Textarea
                value={rawContent}
                onChange={(event) => setRawContent(event.target.value)}
                placeholder="Paste an interview note, customer quote, metric, transcript, or observation."
                rows={7}
                className="bg-black/50"
              />
              <Input type="file" onChange={handleFileChange} className="bg-black/50" />
              {selectedFileName && <p className="text-xs text-muted-foreground">Selected file: {selectedFileName}</p>}
            </div>
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
              <label className="space-y-1 text-sm font-semibold">
                <span>Source</span>
                <select value={source} onChange={(event) => setSource(event.target.value as EvidenceSource)} className="w-full rounded-md border border-input bg-black/50 px-3 py-2 text-sm">
                  {sourceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Phase</span>
                <select value={phaseId} onChange={(event) => setPhaseId(event.target.value)} className="w-full rounded-md border border-input bg-black/50 px-3 py-2 text-sm">
                  <option value="">No phase tag</option>
                  {phaseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Activity ID</span>
                <Input value={activityId} onChange={(event) => setActivityId(event.target.value)} placeholder="activity id" className="bg-black/50" />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Milestone ID</span>
                <Input value={milestoneId} onChange={(event) => setMilestoneId(event.target.value)} placeholder="milestone id" className="bg-black/50" />
              </label>
              <label className="space-y-1 text-sm font-semibold sm:col-span-2">
                <span>Segment</span>
                <Input value={segment} onChange={(event) => setSegment(event.target.value)} placeholder="customer segment, buyer, cohort, or market" className="bg-black/50" />
              </label>
              <Button onClick={handleAddEvidence} disabled={isSaving || !rawContent.trim()} className="sm:col-span-2">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add evidence
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-black/20 border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)} className="rounded-md border border-input bg-black/50 px-3 py-2 text-sm">
              <option value="">All phases</option>
              {phaseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <Input value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)} placeholder="Filter activity" className="bg-black/50" />
            <Input value={milestoneFilter} onChange={(event) => setMilestoneFilter(event.target.value)} placeholder="Filter milestone" className="bg-black/50" />
            <Input value={segmentFilter} onChange={(event) => setSegmentFilter(event.target.value)} placeholder="Filter segment" className="bg-black/50" />
            <select value={strengthFilter} onChange={(event) => setStrengthFilter(event.target.value)} className="rounded-md border border-input bg-black/50 px-3 py-2 text-sm">
              <option value="">All strengths</option>
              {strengthOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </Card>

        <div className="space-y-4">
          {isLoading && <div className="text-muted-foreground">Loading evidence...</div>}
          {!isLoading && filteredEvidence.length === 0 && (
            <Card className="p-8 text-center bg-black/20 border-white/10">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No evidence matches the current filters.</p>
            </Card>
          )}
          {filteredEvidence.map((item) => (
            <Card key={item.id} className="p-5 bg-black/30 border-white/10 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{item.strength}</Badge>
                <Badge variant="outline">{item.source}</Badge>
                {item.tags?.phaseId && <Badge variant="secondary">{item.tags.phaseId}</Badge>}
                {item.tags?.activityId && <Badge variant="secondary">{item.tags.activityId}</Badge>}
                {item.tags?.milestoneId && <Badge variant="secondary">{item.tags.milestoneId}</Badge>}
                {item.tags?.segment && <Badge variant="secondary">{item.tags.segment}</Badge>}
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
              </div>
              {item.extracted ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-200">{item.extracted.summary}</p>
                  {item.extracted.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.extracted.metrics.map((metric, index) => (
                        <Badge key={`${metric.label}-${index}`} variant="outline">
                          {metric.label}: {metric.value}{metric.unit ? ` ${metric.unit}` : ''}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.extracted.quotes.length > 0 && (
                    <div className="space-y-2">
                      {item.extracted.quotes.map((quote, index) => (
                        <blockquote key={index} className="border-l-2 border-primary pl-3 text-sm text-muted-foreground">
                          {quote}
                        </blockquote>
                      ))}
                    </div>
                  )}
                  {item.extracted.entities.length > 0 && <p className="text-xs text-muted-foreground">Entities: {item.extracted.entities.join(', ')}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">This item has raw content but no extracted summary yet.</p>
                  <Button variant="outline" size="sm" onClick={() => handleExtractExisting(item)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask AI to extract this
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
