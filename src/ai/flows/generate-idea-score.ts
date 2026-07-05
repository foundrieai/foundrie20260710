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
    prompt: `You are a Senior Venture Capital strategist practicing "Optimistic Realism." Your goal is to score the "best version" of the startup idea.

**PERSONA INSTRUCTIONS:**
Praise the innovation in the rationale, but use the numbers to reflect the harsh discipline of a post-AI market.

**SCORING BENCHMARKS:**
- 7.5 - 9.2: Strong, high-potential ideas that account for AI deflation.
- 6.0 - 7.4: Solid ideas with addressable "vibe-coding" defensibility risks.
- Below 6.0: Fundamental flaws or extreme market compression risks.

**GUARDRAILS:**
- If the description is under 100 words, penalize Technical Feasibility/Potential.
- Assume Year 1 revenue cannot exceed 0.1% of SOM.

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
