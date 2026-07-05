'use server';

import { MODEL_ID, ai, assertGoogleAIConfigured } from '@/ai/genkit';
import { z } from 'genkit';

const ideamaitValidateActivitySchema = z.object({
  context: z.any(),
});

export async function ideamaitValidateActivity(
  input: z.infer<typeof ideamaitValidateActivitySchema>
): Promise<z.infer<typeof ideamaitValidationSchema>> {
  return ideamaitValidateActivityFlow(input);
}

const ideamaitValidationSchema = z.object({
  verdict: z.enum(['validated', 'needs-work', 'flag']),
  assessment: z.string(),
  nextAction: z.string(),
});

const validatePrompt = ai.definePrompt({
  name: 'ideamaitValidateActivityPrompt',
  model: MODEL_ID,
  input: { schema: ideamaitValidateActivitySchema },
  output: { schema: ideamaitValidationSchema },
  config: {
    temperature: 0.2,
  },
  prompt: `You are Ideamait - the AI advisor embedded inside LaunchCode, Foundrie AI's founder journey platform. You are reviewing the evidence a founder has logged for a specific activity.

The founder is building: {{context.companyName}} - {{context.startupDescription}}
They are in Phase {{context.currentPhaseName}} ({{context.currentPhase}}), sub-phase {{context.currentSubPhase}}, day {{context.daysInPhase}}.
Overall phase progress: {{context.overallProgressPct}}%.
Activities completed: {{context.activitiesCompleted}}. Activities remaining: {{context.activitiesRemaining}}.

They are asking you to validate: {{context.currentActivityName}}
The evidence they recorded:
{{context.currentActivityEvidence}}

Your task:
1. Assess whether the evidence is sufficient and credible for this stage.
2. Identify any red flags - evidence that suggests the founder is skipping work or rationalizing rather than validating.
3. Give one specific directive for what to do next.
4. If the evidence is insufficient, name exactly what is missing.

Rules:
- Do not repeat the evidence back at length.
- No bullet points - direct, confident prose.
- No contractions.
- Maximum 200 words.
- Tone: a respected operator who tells the truth quickly and respectfully.
- Never open with praise like "Great work" - get to the substance.`,
});

const ideamaitValidateActivityFlow = ai.defineFlow(
  {
    name: 'ideamaitValidateActivity',
    inputSchema: ideamaitValidateActivitySchema,
    outputSchema: ideamaitValidationSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();

    // stringify the evidence and join arrays for the template
    const formattedInput = {
      context: {
        ...input.context,
        activitiesCompleted: (input.context.activitiesCompleted || []).join(', ') || 'none',
        activitiesRemaining: (input.context.activitiesRemaining || []).join(', ') || 'none',
        currentActivityEvidence: JSON.stringify(input.context.currentActivityEvidence, null, 2),
      }
    };
    const { output } = await validatePrompt(formattedInput);
    if (!output) {
      throw new Error("Validation failed");
    }
    return output;
  }
);
