'use server';

/**
 * @fileOverview A Genkit flow for polishing a section of a startup validation report.
 * It focuses on adding tables, fixing formatting, and improving strategic tone.
 * MANDATE: ZERO DELETION OF STRATEGIC PROSE.
 */

import {ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {z} from 'genkit';

const PolishSectionInputSchema = z.object({
  companyName: z.string().describe('The name of the company.'),
  sectionName: z.string().describe('The name of the section being polished.'),
  content: z.string().describe('The current markdown content of the section.'),
});
export type PolishSectionInput = z.infer<typeof PolishSectionInputSchema>;

const PolishSectionOutputSchema = z.object({
  polishedContent: z.string().describe('The enhanced, formatted, and polished markdown content.'),
});
export type PolishSectionOutput = z.infer<typeof PolishSectionOutputSchema>;

export async function polishReportSection(input: PolishSectionInput): Promise<PolishSectionOutput> {
  return polishReportSectionFlow(input);
}

const polishSectionPrompt = ai.definePrompt({
  name: 'polishSectionPrompt',
  system: `You are a high-fidelity Format & Grammar Sanitizer for an elite venture capital firm.

**CORE DIRECTIVE: ZERO CONTENT DELETION**
- You are STRICTLY FORBIDDEN from summarizing, truncating, or removing any prose provided in the input.
- Your output must be a format-enhanced version of the EXACT SAME text.
- Target Output Length: ≥ 98% of the input length.

**POLISHING MANDATES:**
1. **VISUAL DATA**: Identify metrics, financial figures, or competitive lists. You MUST convert these into clean Markdown Tables for maximum readability.
2. **TYPOGRAPHY**: Fix typos, spelling errors, and inconsistent casing. Standardize bolding for key strategic terms.
3. **FORMATTING**: Standardize sub-headers using '###'. Ensure 0.5" hanging indent patterns are preserved in logic.
4. **WHITELABEL**: Ensure ZERO mention of IDEAIT, IDEAMAIT, or LAUNCHCODE. Replace with "The Platform" or "Investment Intelligence".
5. **COMPLETION**: Append [ANALYSIS_COMPLETE] only when you have finished.`,
  input: {schema: PolishSectionInputSchema},
  output: {schema: PolishSectionOutputSchema},
  config: {
    temperature: 0.1, // Lower temperature for higher fidelity to original text
    maxOutputTokens: 4096,
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Polish the following strategic content for **{{companyName}}**.

SECTION: {{sectionName}}

CONTENT TO SANITIZE:
"""
{{content}}
"""

Return ONLY the polished markdown.`,
});

const polishReportSectionFlow = ai.defineFlow(
  {
    name: 'polishReportSectionFlow',
    inputSchema: PolishSectionInputSchema,
    outputSchema: PolishSectionOutputSchema,
  },
  async input => {
    assertGoogleAIConfigured();

    const {output} = await polishSectionPrompt(input);
    if (!output?.polishedContent) {
      throw new Error(`Failed to polish section: ${input.sectionName}`);
    }
    return {
      polishedContent: output.polishedContent.trim(),
    };
  }
);
