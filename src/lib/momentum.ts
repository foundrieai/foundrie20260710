import type { DecisionLogEntry, EvidenceItem, Report } from './types';

/**
 * Founder Momentum — gamification/graphs computed from real activity
 * (validation reports, Vault evidence, decision log). No fabricated numbers:
 * every metric derives from timestamps the user actually created.
 */

export type Achievement = { id: string; label: string; description: string; earned: boolean };
export type MomentumWeek = { label: string; count: number };
export type Momentum = {
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  totalActivity: number;
  weeks: MomentumWeek[];
  achievements: Achievement[];
};

function toDate(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v?.toDate === 'function') {
    try { return v.toDate(); } catch { return null; }
  }
  if (typeof v?.seconds === 'number') return new Date(v.seconds * 1000);
  return null;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayKey = (d: Date) => startOfDay(d).getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

export function computeMomentum(input: {
  reports?: Report[] | null;
  evidence?: EvidenceItem[] | null;
  decisions?: DecisionLogEntry[] | null;
  now?: Date;
}): Momentum {
  const now = input.now ?? new Date();
  const today = startOfDay(now);

  const dates: Date[] = [
    ...(input.reports || []).map((r) => toDate(r.createdAt)),
    ...(input.evidence || []).map((e) => toDate((e as any).createdAt)),
    ...(input.decisions || []).map((d) => toDate((d as any).createdAt)),
  ].filter((d): d is Date => d !== null);

  const totalActivity = dates.length;

  // Unique active days (as start-of-day timestamps), sorted ascending.
  const dayStamps = Array.from(new Set(dates.map(dayKey))).sort((a, b) => a - b);
  const activeDays = dayStamps.length;

  // Best streak: longest run of consecutive days.
  let bestStreak = 0;
  let run = 0;
  for (let i = 0; i < dayStamps.length; i++) {
    if (i > 0 && dayStamps[i] - dayStamps[i - 1] === DAY_MS) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > bestStreak) bestStreak = run;
  }

  // Current streak: consecutive days ending today or yesterday.
  let currentStreak = 0;
  const daySet = new Set(dayStamps);
  const mostRecent = dayStamps[dayStamps.length - 1];
  if (mostRecent === today.getTime() || mostRecent === today.getTime() - DAY_MS) {
    let cursor = mostRecent;
    while (daySet.has(cursor)) {
      currentStreak += 1;
      cursor -= DAY_MS;
    }
  }

  // Activity per week for the last 8 weeks (oldest → newest).
  const WEEKS = 8;
  const weeks: MomentumWeek[] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const end = today.getTime() - (w * 7 - 1) * DAY_MS; // exclusive upper edge for the week
    const start = end - 7 * DAY_MS;
    const count = dates.filter((d) => {
      const t = startOfDay(d).getTime();
      return t >= start && t < end;
    }).length;
    const label = w === 0 ? 'This wk' : `${w}w ago`;
    weeks.push({ label, count });
  }

  const reportsCount = input.reports?.length || 0;
  const evidenceCount = input.evidence?.length || 0;
  const decisionsCount = input.decisions?.length || 0;

  const achievements: Achievement[] = [
    { id: 'first-validation', label: 'First Validation', description: 'Validated your first idea', earned: reportsCount >= 1 },
    { id: 'streak-3', label: 'On a Roll', description: '3-day activity streak', earned: bestStreak >= 3 },
    { id: 'evidence-5', label: 'Evidence Builder', description: 'Collected 5 pieces of evidence', earned: evidenceCount >= 5 },
    { id: 'decisive', label: 'Decisive Founder', description: 'Logged 3 decisions', earned: decisionsCount >= 3 },
    { id: 'committed', label: 'Committed', description: 'Active on 7 different days', earned: activeDays >= 7 },
    { id: 'portfolio-3', label: 'Serial Builder', description: 'Validated 3 ideas', earned: reportsCount >= 3 },
  ];

  return { activeDays, currentStreak, bestStreak, totalActivity, weeks, achievements };
}
