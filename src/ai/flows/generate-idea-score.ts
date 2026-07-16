'use server';

import {ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const IdeaScoreInputSchema = z.object({
  description: z.string().describe('A detailed description of the startup idea.'),
  industry: z.string().describe('The industry the company operates in.'),
});
export type IdeaScoreInput = z.infer<typeof IdeaScoreInputSchema>;

const IdeaScoreOutputSchema = z.object({
  score: z.number().min(0).max(10).describe('A score from 0.0 to 10.0 representing the potential of the startup idea.'),
  rationale: z.string().describe('A concise, one or two-sentence rationale justifying the score.'),
});
export type IdeaScoreOutput = z.infer<typeof IdeaScoreOutputSchema>;

export async function generateIdeaScore(input: IdeaScoreInput): Promise<IdeaScoreOutput> {
  return generateIdeaScoreFlow(input);
}

const scoringPrompt = ai.definePrompt({
    name: 'generateIdeaScorePrompt',
    input: { schema: IdeaScoreInputSchema },
    output: { schema: IdeaScoreOutputSchema },
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    },
    prompt: `You are a Senior Venture Capital strategist scoring a startup idea at investment committee. You are respected because your scores discriminate: a founder can tell from your number alone whether they have something real. Inflated scores are a failure of your job.

**CALIBRATION (binding):**
- 9.0 - 10.0: Exceptional. Rare. A genuinely category-defining opportunity. Most portfolios contain none of these.
- 7.0 - 8.9: Strong. A clear, differentiated opportunity with a credible moat.
- 5.0 - 6.9: Median. THE TYPICAL IDEA LANDS HERE. Plausible, but the advantage is unproven.
- 3.0 - 4.9: Weak. A material flaw in the market, the moat, the economics, or the feasibility.
- 0.0 - 2.9: Fatally flawed. No viable path as described.

**ANTI-INFLATION RULES (binding):**
1. Score the idea AS DESCRIBED, not the best version you can imagine it becoming. Do not credit potential the description does not support.
2. Absence of evidence is not evidence. An unproven or unvalidated advantage caps the score at 6.9.
3. A vague or thin description cannot score above 6.0. You cannot infer strength the founder never demonstrated.
4. If the value proposition can be replicated via "vibe-coding" in under a week, cap the score at 6.0.
5. Never round toward optimism. When torn, take the lower score and explain the gap that would close it.

**GUARDRAILS:**
- If the description is under 100 words, treat feasibility and potential as substantially unproven and score accordingly.
- Assume Year 1 revenue cannot exceed 0.1% of SOM.

**RATIONALE:**
Name the specific weakness that held the score down, then the concrete action that would raise it and what it would raise it to. Be direct about the problem and constructive about the path. Never praise to cushion a low score, and never soften the number.

Startup Idea: "{{description}}"
Industry: "{{industry}}"

Return ONLY a JSON object with the keys "score" and "rationale".`
});


const generateIdeaScoreFlow = ai.defineFlow(
  {
    name: 'generateIdeaScoreFlow',
    inputSchema: IdeaScoreInputSchema,
    outputSchema: IdeaScoreOutputSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();

    const { output } = await scoringPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate score.');
    }
    return output;
  }
);
