'use server';

import { MODEL_ID, ai, assertGoogleAIConfigured } from '@/ai/genkit';
import { z } from 'genkit';

const extractedEvidenceSchema = z.object({
  summary: z.string(),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    unit: z.string().optional(),
  })),
  quotes: z.array(z.string()),
  entities: z.array(z.string()),
  signalType: z.enum(['behavioral', 'stated', 'quantitative', 'qualitative']),
});

const extractEvidenceInputSchema = z.object({
  rawContent: z.string(),
  hintContext: z.object({
    phaseName: z.string().optional(),
    activityName: z.string().optional(),
  }).optional(),
});

export type ExtractEvidenceInput = z.infer<typeof extractEvidenceInputSchema>;
export type ExtractEvidenceOutput = z.infer<typeof extractedEvidenceSchema>;

export async function extractEvidence(input: ExtractEvidenceInput): Promise<ExtractEvidenceOutput> {
  return extractEvidenceFlow(input);
}

const extractEvidencePrompt = ai.definePrompt({
  name: 'extractEvidencePrompt',
  model: MODEL_ID,
  input: { schema: extractEvidenceInputSchema },
  output: { schema: extractedEvidenceSchema },
  config: {
    temperature: 0.1,
  },
  prompt: `You extract structured startup evidence for LaunchCode.

Context:
Phase: {{hintContext.phaseName}}
Activity: {{hintContext.activityName}}

Raw founder material:
{{rawContent}}

Rules:
- No contractions in any output.
- Extract only what is present in the material.
- Never invent metrics, quotes, entities, customer behavior, or conclusions.
- Prefer behavioral and quantitative signal over stated opinion.
- Quotes must be exact snippets from the raw material.
- Metrics must be explicit numbers, counts, dates, percentages, prices, durations, or rates from the raw material.
- If the material is too thin to extract anything meaningful, return empty arrays and a plain summary that says the material is too thin to extract meaningful evidence.
- Choose signalType based on the strongest signal present: behavioral, stated, quantitative, or qualitative.`,
});

const extractEvidenceFlow = ai.defineFlow(
  {
    name: 'extractEvidence',
    inputSchema: extractEvidenceInputSchema,
    outputSchema: extractedEvidenceSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();

    const { output } = await extractEvidencePrompt(input);
    if (!output) {
      throw new Error('Evidence extraction failed');
    }
    return output;
  }
);
