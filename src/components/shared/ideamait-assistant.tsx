'use client';

import { CounselorChat } from '@/components/counselor-chat';

/**
 * Generic IDEAMAIT assistant. Reuses the (superior) Resumait-style floating
 * CounselorChat widget and wires it to the multi-turn Ideamait conversation
 * endpoint, so Ideation and every LaunchCode phase get the same high-quality
 * chat that previously only lived in the Validation report / Resumait.
 */

export type IdeamaitAssistantContext = {
  companyName?: string;
  startupDescription?: string;
  currentPhaseName?: string;
  currentSubPhase?: string;
  currentActivityName?: string;
  daysInPhase?: number;
};

function toText(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.find((p: any) => p?.text)?.text || '';
  return '';
}

export function IdeamaitAssistant({ context }: { context: IdeamaitAssistantContext }) {
  const chatAction = async (input: any) => {
    try {
      const conversationHistory = [
        ...(((input.history as any[]) || []).map((m) => ({
          role: m.role === 'model' ? 'agent' : 'user',
          content: toText(m.content),
        }))),
        { role: 'user', content: input.userInput },
      ];

      const res = await fetch('/api/ideamait/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            companyName: context.companyName || 'your venture',
            startupDescription: context.startupDescription || '',
            currentActivityName: context.currentActivityName || context.currentPhaseName || 'this stage',
            currentPhaseName: context.currentPhaseName || 'LaunchCode',
            currentSubPhase: context.currentSubPhase || '',
            daysInPhase: context.daysInPhase || 1,
            conversationHistory,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        return { success: false, error: data.error || 'IDEAMAIT is unavailable right now.' };
      }
      return { success: true, data: { responseText: data.reply } };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error reaching IDEAMAIT.' };
    }
  };

  const company = context.companyName && context.companyName !== 'your venture' ? context.companyName : 'your venture';
  const intro =
    context.currentPhaseName === 'Ideation'
      ? `I am Ideamait. I have pressure-tested hundreds of founder ideas. Tell me the space you are drawn to — or point me at one of the ideas on screen — and I will tell you where the real opportunity sits and where it will break. One question at a time. Let us find the one worth your next few years.`
      : `I am Ideamait, your operator through ${context.currentPhaseName || 'this stage'}. I already know where ${company} stands. Tell me where you are stuck, or ask what to prioritize — I will cut straight to the next move that actually matters.`;

  return (
    <CounselorChat
      resumeText={context.startupDescription || ''}
      jobDescription={context.currentPhaseName || ''}
      onResumeUpdate={() => {}}
      chatAction={chatAction}
      introMessage={intro}
    />
  );
}
