'use server';

/**
 * @fileOverview A Genkit flow for performing deep dive analysis on a specific section of a startup validation report.
 * Locked to Gemini 2.5.
 */

import {MODEL_ID, ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const DeepDiveAnalysisInputSchema = z.object({
  companyName: z.string().describe('The name of the company being analyzed.'),
  industry: z.string().describe('The industry the company operates in.'),
  originalContent: z.string().describe('The original content of the section to be analyzed.'),
  sectionName: z.string().describe('The name of the section to perform a deep dive on (e.g., Problem, Solution, Market Size).'),
});
export type DeepDiveAnalysisInput = z.infer<typeof DeepDiveAnalysisInputSchema>;

const DeepDiveAnalysisOutputSchema = z.object({
  content: z.string().describe('The content of the deep dive analysis, formatted as a markdown string.'),
});
export type DeepDiveAnalysisOutput = z.infer<typeof DeepDiveAnalysisOutputSchema>;

export async function deepDiveAnalysis(input: DeepDiveAnalysisInput): Promise<DeepDiveAnalysisOutput> {
  return deepDiveAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepDivePrompt',
  model: MODEL_ID,
  input: {schema: DeepDiveAnalysisInputSchema},
  output: {schema: DeepDiveAnalysisOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert Senior Venture Capital Analyst providing an "Optimistic Realism" Deep Dive for "{{companyName}}" in the {{industry}} industry.

The section to analyze is: **{{sectionName}}**.

**PERSONA GUIDELINES:**
- Challenge the original assumptions with the discipline of a post-AI market.
- Apply the 0.1% SOM penetration rule and 40% R&D cost reduction benchmarks.
- Evaluate defensibility against "vibe-coding" and rapid natural-language code generation.
- Offer actionable advice that favors high-volume models over monopolistic margins.

The original content of this section is:
"""
{{originalContent}}
"""

Provide additive insights. Do not repeat the original text.`,
});

const deepDiveAnalysisFlow = ai.defineFlow(
  {
    name: 'deepDiveAnalysisFlow',
    inputSchema: DeepDiveAnalysisInputSchema,
    outputSchema: DeepDiveAnalysisOutputSchema,
  },
  async input => {
    assertGoogleAIConfigured();

    console.log(`[deepDiveAnalysisFlow] Starting deep dive for section: ${input.sectionName}`);
    const {output} = await prompt(input);
    if (!output?.content) {
      console.error(`[deepDiveAnalysisFlow] AI returned empty content for section: ${input.sectionName}`);
      throw new Error('Deep dive analysis failed to generate content.');
    }
    console.log(`[deepDiveAnalysisFlow] Successfully generated deep dive for section: ${input.sectionName}`);
    return output;
  }
);
