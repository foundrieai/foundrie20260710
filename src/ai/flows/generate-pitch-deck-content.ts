'use server';

/**
 * @fileOverview A robust Genkit flow for distilling a full startup validation report into a 12-slide structured startup assessment deck.
 * Locked to Gemini 2.5.
 */

import {MODEL_ID, ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {z} from 'genkit';
import {Report} from '@/lib/types';

const PitchDeckContentInputSchema = z.object({
  reportData: z.string().describe('The full JSON string of the report data.'),
});
export type PitchDeckContentInput = z.infer<typeof PitchDeckContentInputSchema>;

const SlideContentSchema = z.object({
  title: z.string(),
  bullets: z.array(z.string()).max(5),
});

const PitchDeckContentOutputSchema = z.object({
  purpose: SlideContentSchema,
  problem: SlideContentSchema,
  solution: SlideContentSchema,
  whyNow: SlideContentSchema,
  marketSize: SlideContentSchema,
  competition: SlideContentSchema,
  product: SlideContentSchema,
  businessModel: SlideContentSchema,
  traction: SlideContentSchema,
  team: SlideContentSchema,
  financials: SlideContentSchema,
  vision: SlideContentSchema,
});
export type PitchDeckContentOutput = z.infer<typeof PitchDeckContentOutputSchema>;

export async function generatePitchDeckContent(report: Report): Promise<PitchDeckContentOutput> {
  return generatePitchDeckContentFlow({ reportData: JSON.stringify(report) });
}

const prompt = ai.definePrompt({
  name: 'generatePitchDeckContentPrompt',
  model: MODEL_ID,
  input: {schema: PitchDeckContentInputSchema},
  output: {schema: PitchDeckContentOutputSchema},
  config: {
    temperature: 0.2,
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an elite startup narrative consultant. Your task is to distill a comprehensive startup validation report into a high-impact, 12-slide pitch deck.

For each of the 12 slides defined in the output schema, extract the most critical, investor-ready insights from the provided report and format them as 3-5 concise, punchy bullet points. Focus on hard data, unique moats, and strategic timing catalysts.

SLIDES TO GENERATE:
1. purpose - (Company Purpose: A declarative statement of existence)
2. problem - (The Problem: User pain points + market depth)
3. solution - (The Solution: Value prop + "Aha" moment)
4. whyNow - (Why Now: Timing catalysts and market shifts)
5. marketSize - (Market Size: TAM/SAM/SOM using Bottom-Up logic)
6. competition - (Competition: Differentiation and Moats)
7. product - (Product: Key features and high-level tech stack)
8. businessModel - (Business Model: Revenue streams and unit economics)
9. traction - (Traction: Growth milestones and MRR projections)
10. team - (Team: Why this group has Founder-Market Fit)
11. financials - (Financials: 3-year P&L overview and The Ask)
12. vision - (Vision: The 5-year outlook and ultimate impact)

Report Data:
{{{reportData}}}

Return a valid JSON object matching the requested schema. Ensure every field is populated with professional, high-impact content.`,
});

const generatePitchDeckContentFlow = ai.defineFlow(
  {
    name: 'generatePitchDeckContentFlow',
    inputSchema: PitchDeckContentInputSchema,
    outputSchema: PitchDeckContentOutputSchema,
  },
  async input => {
    assertGoogleAIConfigured();

    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to distill structured startup assessment deck content.');
    }
    return output;
  }
);
