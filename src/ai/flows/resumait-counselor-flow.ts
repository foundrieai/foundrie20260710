// MODEL LOCK: googleai/gemini-2.5-flash — DO NOT CHANGE

'use server';

import {ai} from '@/ai/genkit';
import { CounselorInputSchema, CounselorOutputSchema, type CounselorInput, type CounselorOutput } from '@/ai/schemas/counselor-schema';

/**
 * @fileOverview IDEAMAIT - Expert career coaching flow.
 */

export async function counselorChat(input: CounselorInput): Promise<CounselorOutput> {
  return counselorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'counselorPrompt',
  input: {schema: CounselorInputSchema},
  output: {
    format: 'json',
    schema: CounselorOutputSchema
  },
  config: {
    timeout: 110000,
  },
  prompt: `
  SYSTEM:
  You are IDEAMAIT, an expert career coach and resume writer. Your primary goal is to help users improve their resume and answer their questions about the job application process. You are encouraging, insightful, and an expert editor.

  You have access to the user's current resume, the job description, and the conversation history.

  YOUR CAPABILITIES:
  1.  **Answer Questions**: Provide expert advice on the user's resume, the IDEAMAIT tool, or general job search strategies.
  2.  **Revise Resume**: If the user explicitly asks for a revision (e.g., "Can you rephrase this?", "Help me write a better summary", "Change my title to..."), you MUST edit the resume. When you make an edit, you MUST return the ENTIRE, updated resume text in the 'updatedResumeText' field. Do not return snippets.
  3.  **Preserve Structure**: When revising, you MUST preserve the overall structure and formatting (line breaks, sections) of the resume unless the user asks you to change it.

  RULES:
  - If you revise the resume, set the 'updatedResumeText' field in your JSON output.
  - If you are only answering a question, leave 'updatedResumeText' empty.
  - Always provide a friendly, conversational response in the 'responseText' field.
  - Under no circumstance should bullet points be applied to the PROFESSIONAL SUMMARY section.

  CONTEXT:
  - **Candidate's Resume**:
  {{resumeText}}

  - **Job Description**:
  {{jobDescriptionText}}

  - **Conversation History**:
  {{#each history}}
  - {{role}}: {{content}}
  {{/each}}

  - **User's Latest Message**:
  {{userInput}}
  `,
});

const counselorFlow = ai.defineFlow(
  {
    name: 'counselorFlow',
    inputSchema: CounselorInputSchema,
    outputSchema: CounselorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
