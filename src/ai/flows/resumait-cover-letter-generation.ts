// MODEL LOCK: googleai/gemini-3.5-flash (from genkit MODEL_ID) — keep Resumait on one model

'use server';

/**
 * @fileOverview Generates a tailored cover letter based on a resume and job description.
 *
 * - generateCoverLetter - A function that generates a cover letter.
 */

import {ai} from '@/ai/genkit';
import { CoverLetterInputSchema, CoverLetterOutputSchema, type CoverLetterInput, type CoverLetterOutput } from '@/ai/schemas/cover-letter-schema';


export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterPrompt',
  input: {schema: CoverLetterInputSchema},
  output: {schema: CoverLetterOutputSchema},
  config: {
  },
  prompt: `You are an expert resume writer specializing in creating cover letters.

  Given the following resume and job description, generate a tailored cover letter that highlights the relevant skills and experience from the resume.

  Resume:
  {{resumeText}}

  Job Description:
  {{jobDescriptionText}}

  Cover Letter:`, // Prompt for cover letter generation
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: CoverLetterInputSchema,
    outputSchema: CoverLetterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
