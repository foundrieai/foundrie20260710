'use server';

import { MODEL_ID, ai, assertGoogleAIConfigured } from '@/ai/genkit';
import { z } from 'genkit';

const ideamaitPhaseCoachSchema = z.object({
  context: z.any(),
});

export async function ideamaitPhaseCoach(input: z.infer<typeof ideamaitPhaseCoachSchema>): Promise<string> {
  return ideamaitPhaseCoachFlow(input);
}

const phaseCoachPrompt = ai.definePrompt({
  name: 'ideamaitPhaseCoachPrompt',
  model: MODEL_ID,
  input: { schema: ideamaitPhaseCoachSchema },
  output: { format: 'text' },
  config: {
    temperature: 0.4,
  },
  prompt: `You are Ideamait - the AI advisor inside LaunchCode. A founder has asked for your overall assessment of where they stand in their current phase.

Startup: {{context.companyName}} - {{context.startupDescription}}
Phase: {{context.currentPhaseName}} ({{context.currentSubPhase}}), day {{context.daysInPhase}}, {{context.overallProgressPct}}% complete.
Activities completed: {{context.activitiesCompletedStr}}. Remaining: {{context.activitiesRemainingStr}}.
Deliverables completed: {{context.deliverablesCompletedStr}}. Remaining: {{context.deliverablesRemainingStr}}.
Milestones met: {{context.milestonesMetStr}}. Not yet met: {{context.milestonesRemainingStr}}.

Return a coaching response that:
1. Names the single highest-priority action right now.
2. Identifies the biggest risk given what is incomplete.
3. If pace (days in phase vs progress) suggests they are too slow or skipping hard work, says so plainly.
4. One sentence on what reaching the next milestone unlocks.

Rules:
- No contractions. No bullet points. Maximum 250 words.
- Do not summarize their progress back to them - assess it.
- Tone: a trusted board advisor who respects their time.

Return only the prose response. No preamble.`,
});

const ideamaitPhaseCoachFlow = ai.defineFlow(
  {
    name: 'ideamaitPhaseCoach',
    inputSchema: ideamaitPhaseCoachSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    assertGoogleAIConfigured();

    const formattedInput = {
      context: {
        ...input.context,
        activitiesCompletedStr: (input.context.activitiesCompleted || []).join(', ') || 'none',
        activitiesRemainingStr: (input.context.activitiesRemaining || []).join(', ') || 'none',
        deliverablesCompletedStr: (input.context.deliverablesCompleted || []).join(', ') || 'none',
        deliverablesRemainingStr: (input.context.deliverablesRemaining || []).join(', ') || 'none',
        milestonesMetStr: (input.context.milestonesMet || []).join(', ') || 'none',
        milestonesRemainingStr: (input.context.milestonesRemaining || []).join(', ') || 'none',
      }
    };
    const { text } = await phaseCoachPrompt(formattedInput);
    if (!text) {
      throw new Error("Coach failed");
    }
    return text;
  }
);
