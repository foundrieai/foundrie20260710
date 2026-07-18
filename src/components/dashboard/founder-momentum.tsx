'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Flame, Trophy, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { computeMomentum } from '@/lib/momentum';
import type { DecisionLogEntry, EvidenceItem, Report } from '@/lib/types';

const EMBER = '#ff7a00';
const GOLD = '#ffc400';

export function FounderMomentum({
  reports,
  evidence,
  decisions,
}: {
  reports?: Report[] | null;
  evidence?: EvidenceItem[] | null;
  decisions?: DecisionLogEntry[] | null;
}) {
  const m = useMemo(() => computeMomentum({ reports, evidence, decisions }), [reports, evidence, decisions]);
  const [hover, setHover] = useState<number | null>(null);

  // Nothing to gamify until there is at least one real action.
  if (m.totalActivity === 0) return null;

  const W = 320;
  const H = 120;
  const padB = 22;
  const padT = 10;
  const plotH = H - padB - padT;
  const n = m.weeks.length;
  const gap = 10;
  const barW = (W - gap * (n - 1)) / n;
  const maxCount = Math.max(1, ...m.weeks.map((w) => w.count));
  const earnedCount = m.achievements.filter((a) => a.earned).length;

  return (
    <Card className="glass-card mb-8 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Founder Momentum</h2>
        {m.currentStreak > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff7a00]/30 bg-[#ff7a00]/15 px-3 py-1 text-sm font-bold text-[#ffc400]">
            <Flame className="h-4 w-4" /> {m.currentStreak}-day streak
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-5 flex gap-8">
            <Stat label="Current streak" value={m.currentStreak} />
            <Stat label="Best streak" value={m.bestStreak} />
            <Stat label="Active days" value={m.activeDays} />
          </div>

          <p className="mb-2 text-[11px] uppercase tracking-wider text-white/40">Activity · last 8 weeks</p>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Weekly founder activity over the last 8 weeks">
            <line x1="0" y1={H - padB} x2={W} y2={H - padB} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            {m.weeks.map((wk, i) => {
              const x = i * (barW + gap);
              const h = (wk.count / maxCount) * plotH;
              const y = H - padB - h;
              const active = hover === i;
              return (
                <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={x} y={padT} width={barW} height={plotH} rx="3" fill="rgba(255,255,255,0.05)" />
                  {wk.count > 0 && <rect x={x} y={y} width={barW} height={h} rx="3" fill={active ? GOLD : EMBER} />}
                  <rect x={x} y={0} width={barW} height={H} fill="transparent" />
                  <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
                    {wk.label}
                  </text>
                  {active && (
                    <text x={x + barW / 2} y={Math.max(y - 6, padT + 8)} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                      {wk.count}
                    </text>
                  )}
                  <title>
                    {wk.label}: {wk.count} {wk.count === 1 ? 'action' : 'actions'}
                  </title>
                </g>
              );
            })}
          </svg>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40">
            <Trophy className="h-3.5 w-3.5" /> Achievements ({earnedCount}/{m.achievements.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {m.achievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'rounded-lg border p-3',
                  a.earned ? 'border-[#ffc400]/30 bg-[#ffc400]/10' : 'border-white/10 bg-white/[0.02] opacity-60'
                )}
              >
                <div className="flex items-center gap-2">
                  {a.earned ? <Check className="h-3.5 w-3.5 shrink-0 text-[#ffc400]" /> : <Lock className="h-3.5 w-3.5 shrink-0 text-white/40" />}
                  <p className={cn('text-xs font-bold', a.earned ? 'text-white' : 'text-white/60')}>{a.label}</p>
                </div>
                <p className="mt-1 text-[10px] leading-tight text-white/40">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-headline text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}
