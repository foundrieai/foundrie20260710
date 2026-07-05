'use server';

import { MODEL_ID, ai, assertGoogleAIConfigured } from '@/ai/genkit';
import { z } from 'genkit';

const activityAssessmentSchema = z.object({
  signal: z.enum(['insufficient', 'weak', 'developing', 'strong']),
  confidence: z.number().min(0).max(100),
  rationale: z.string(),
  gaps: z.array(z.string()),
  recommendedStatus: z.enum(['keep-gathering', 'ready-to-accept']),
});

const assessActivityInputSchema = z.object({
  context: z.any(),
  taggedEvidence: z.array(z.object({
    id: z.string(),
    strength: z.enum(['weak', 'moderate', 'strong']).optional(),
    source: z.string().optional(),
    summary: z.string().optional(),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
      unit: z.string().optional(),
    })).optional(),
    quotes: z.array(z.string()).optional(),
    signalType: z.string().optional(),
  })).optional(),
});

export type ActivityAssessmentOutput = z.infer<typeof activityAssessmentSchema>;

export async function assessActivity(input: z.infer<typeof assessActivityInputSchema>): Promise<ActivityAssessmentOutput> {
  return assessActivityFlow(input);
}

const assessActivityPrompt = ai.definePrompt({
  name: 'assessActivityPrompt',
  model: MODEL_ID,
  input: { schema: assessActivityInputSchema },
  output: { schema: activityAssessmentSchema },
  config: {
    temperature: 0.2,
  },
  prompt: `You are Ideamait, the AI advisor inside LaunchCode by Foundrie AI.

You assess evidence. You do not judge, validate, approve, reject, or decide completion. The founder makes the decision.

Founder context:
Company: {{context.companyName}}
Startup description: {{context.startupDescription}}
Current phase: {{context.currentPhaseName}}
Activity: {{context.currentActivityName}}
Business model or stage context if present: {{context.businessModelType}}

Tagged Vault evidence summaries:
{{taggedEvidence}}

Rules:
- No contractions in any output.
- Lead with an evidence signal band, not a verdict.
- Treat confidence as secondary detail.
- Rationale must be direct and no more than 180 words.
- Always name specific evidence gaps.
- Prefer behavioral and quantitative evidence over stated opinion.
- Do not assume SaaS. Service, marketplace, public-sector, nonprofit, and government-contracting founders exist.
- If the business model is unclear, say what evidence would fit the founder's model instead of forcing SaaS-shaped milestones.
- recommendedStatus is ready-to-accept only when the evidence is strong enough that a founder could reasonably choose to advance. It is not an automatic decision.`,
});

const assessActivityFlow = ai.defineFlow(
  {
    name: 'assessActivity',
    inputSchema: assessActivityInputSchema,
    outputSchema: activityAssessmentSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();

    const formattedInput = {
      ...input,
      taggedEvidence: (input.taggedEvidence || []).map((item) => ({
        ...item,
        metrics: item.metrics || [],
        quotes: item.quotes || [],
      })),
    };
    const { output } = await assessActivityPrompt(formattedInput);
    if (!output) {
      throw new Error('Activity assessment failed');
    }
    return output;
  }
);
