'use server';

/**
 * @fileOverview AI flow to suggest a company name based on the company description.
 *
 * - suggestCompanyName - A function that suggests a company name.
 * - SuggestCompanyNameInput - The input type for the suggestCompanyName function.
 * - SuggestCompanyNameOutput - The return type for the suggestCompanyName function.
 */

import {ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCompanyNameInputSchema = z.object({
  companyDescription: z
    .string()
    .min(100)
    .describe('The description of the company. Minimum 100 characters.'),
});
export type SuggestCompanyNameInput = z.infer<typeof SuggestCompanyNameInputSchema>;

const SuggestCompanyNameOutputSchema = z.object({
  companyName: z.string().describe('The suggested name of the company.'),
});
export type SuggestCompanyNameOutput = z.infer<typeof SuggestCompanyNameOutputSchema>;

export async function suggestCompanyName(input: SuggestCompanyNameInput): Promise<SuggestCompanyNameOutput> {
  return suggestCompanyNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCompanyNamePrompt',
  input: {schema: SuggestCompanyNameInputSchema},
  output: {schema: SuggestCompanyNameOutputSchema},
  prompt: `Suggest a company name based on the following company description: {{{companyDescription}}}. The company name should be short, memorable, and relevant to the company's mission.`,
});

const suggestCompanyNameFlow = ai.defineFlow(
  {
    name: 'suggestCompanyNameFlow',
    inputSchema: SuggestCompanyNameInputSchema,
    outputSchema: SuggestCompanyNameOutputSchema,
  },
  async input => {
    assertGoogleAIConfigured();

    const {text, output} = await prompt(input);
    console.log('[suggestCompanyNameFlow] Raw AI Response:', text);
    if (!output) {
      console.error('[suggestCompanyNameFlow] Parsed output is invalid.');
      throw new Error('Failed to suggest company name. The model returned an invalid structure.');
    }
    return output;
  }
);
