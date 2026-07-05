'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { DeliverableData } from '@/lib/phases/types';

export function DeliverableCard({
  deliverable,
  deliverableState,
  onUpdateState
}: {
  deliverable: DeliverableData;
  deliverableState?: any;
  onUpdateState: (newState: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completed = deliverableState?.completed || false;
  const notes = deliverableState?.notes || '';
  const linkedToolOpened = deliverableState?.linkedToolOpened || false;

  const handleToggleCompleted = () => {
    if (deliverable.linkedTool && !linkedToolOpened) return;
    onUpdateState({ ...deliverableState, completed: !completed });
  };

  const handleOpenLinkedTool = () => {
    onUpdateState({ ...deliverableState, linkedToolOpened: true });
  };

  return (
    <Card className={cn('lc-card mb-3 overflow-hidden transition-colors', completed && 'border-[var(--lc-ok-border)]')}>
      <div
        role="button"
        tabIndex={0}
        className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
        onClick={() => setExpanded((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setExpanded((current) => !current);
          }
        }}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
            <Checkbox
              checked={completed}
              onCheckedChange={handleToggleCompleted}
              disabled={!!deliverable.linkedTool && !linkedToolOpened}
              className={cn('h-6 w-6 rounded-md', completed && 'data-[state=checked]:border-[var(--lc-ok-border)] data-[state=checked]:bg-[var(--lc-ok)]')}
            />
          </div>
          <div>
            <h3 className={cn('text-lg font-semibold text-[var(--lc-text)]', completed && 'text-[var(--lc-text-faint)] line-through')}>
              {deliverable.title}
            </h3>
            {deliverable.linkedTool && (
              <span className="mt-2 inline-block rounded-[var(--lc-radius-pill)] border border-[var(--lc-border-muted)] px-2 py-0.5 font-code text-[11px] uppercase text-[var(--lc-text-faint)]">
                Linked tool: {deliverable.linkedTool}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className={cn('h-5 w-5 text-[var(--lc-text-faint)] transition-transform', expanded && 'rotate-90')} />
      </div>

      {expanded && (
        <div className="mt-2 space-y-4 border-t border-[var(--lc-divider)] p-4 pt-4">
          <p className="text-sm leading-6 text-[var(--lc-text-2)]">{deliverable.description}</p>

          {deliverable.linkedTool && (
            <div className="lc-inset flex items-center justify-between gap-3 p-3">
              <span className="text-sm text-[var(--lc-text-2)]">{deliverable.linkedToolLabel}</span>
              <Button size="sm" onClick={handleOpenLinkedTool} variant="outline" className="lc-secondary-button h-8">
                Open
              </Button>
            </div>
          )}

          {deliverable.linkedTool && !linkedToolOpened && (
            <p className="text-xs text-[var(--lc-warn-text)]">Open the linked tool first to mark this complete.</p>
          )}

          <div className="mt-4 space-y-2">
            <label className="lc-eyebrow">Notes</label>
            <Textarea
              value={notes}
              onChange={(event) => onUpdateState({ ...deliverableState, notes: event.target.value })}
              placeholder="Record notes, links, or methods here."
              className="h-20 border-[var(--lc-border)] bg-[var(--lc-bg)] text-sm"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
