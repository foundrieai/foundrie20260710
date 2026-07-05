'use server';

/**
 * @fileOverview A Genkit flow for generating an executive summary for a startup validation report.
 */

import {ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {z} from 'genkit';
import {Report} from '@/lib/types';

const ExecutiveSummaryInputSchema = z.object({
  reportData: z.string().describe('The full JSON string of the report data.'),
});
export type ExecutiveSummaryInput = z.infer<typeof ExecutiveSummaryInputSchema>;

const ExecutiveSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, professional executive summary in markdown format.'),
});
export type ExecutiveSummaryOutput = z.infer<typeof ExecutiveSummaryOutputSchema>;

export async function generateExecutiveSummary(report: Report): Promise<ExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow({ reportData: JSON.stringify(report) });
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: ExecutiveSummaryInputSchema},
  output: {schema: ExecutiveSummaryOutputSchema},
  prompt: `You are a professional investment analyst. Your task is to write a compelling, high-level Executive Summary for a startup validation report based on the provided report data.

The summary should:
1. Briefly state the company purpose and the core problem it solves.
2. Highlight the market opportunity and the unique solution.
3. Summarize the key strengths and potential risks found in the analysis.
4. Conclude with a clear perspective on the venture's viability.

Use professional, concise language. Format the output in clear markdown.

Report Data:
{{{reportData}}}`,
});

const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: ExecutiveSummaryInputSchema,
    outputSchema: ExecutiveSummaryOutputSchema,
  },
  async input => {
    assertGoogleAIConfigured();

    const {output} = await prompt(input);
    if (!output?.summary) {
      throw new Error('Executive summary generation failed.');
    }
    return output;
  }
);
