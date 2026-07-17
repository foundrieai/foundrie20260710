// MODEL LOCK: googleai/gemini-3.5-flash (from genkit MODEL_ID) — keep Resumait on one model

'use server';

/**
 * @fileOverview A World-Class Professional Resume Writer flow for the final "Polish" phase.
 * Transforms an ATS-optimized resume into a high-impact professional story strictly conforming to the 2026 Master ATS Template.
 */

import { ai } from '@/ai/genkit';
import { PolishResumeInputSchema, PolishResumeOutputSchema, type PolishResumeInput, type PolishResumeOutput } from '@/ai/schemas/polish-schema';

export async function polishResume(input: PolishResumeInput): Promise<PolishResumeOutput> {
  return polishResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'polishResumePrompt',
  input: { schema: PolishResumeInputSchema },
  output: { schema: PolishResumeOutputSchema },
  config: {
    timeout: 110000,
    temperature: 0.1, 
  },
  prompt: `
  SYSTEM ROLE:
  You are a world-class professional resume writer and editor with 25+ years of experience. You have written and edited thousands of resumes that consistently beat ATS systems and land interviews at Fortune 500 companies. 

  Your mission is to act as the final human-quality proofreader, editor, and ATS-optimizer. The resume has already had required keywords incorporated; your task is to refine the narrative and structure to strictly conform to the 2026 Master ATS Template.

  **MASTER ATS TEMPLATE TO ENFORCE:**
  [NAME IN ALL CAPS]
  [PROFESSIONAL HEADLINE]
  [Phone Number] | [Email Address] | [City, State] | [LinkedIn Profile URL] [| GitHub/Portfolio/Website if provided]

  PROFESSIONAL SUMMARY
  [3–5 sentences. Lead with years of experience and title. Embed high-impact keywords. Close with a quantified major achievement.]
  Target Role: [Job Title sought]

  CORE SKILLS
  Technical: [Skill 1], [Skill 2], [Skill 3], [Skill 4], [Skill 5], [Skill 6]
  Professional: [Skill A], [Skill B], [Skill C], [Skill D], [Skill E], [Skill F]

  PROFESSIONAL EXPERIENCE
  [Company Name] | [Job Title] | [City, State] | [Month Year] – [Month Year or Present]
  - [Strong Action Verb] + [specific task] + [quantified result or business impact]

  EDUCATION
  - [University Name] | [Degree, Major] | [Graduation Year]

  **STRICT RULES:**
  1. **Keyword Preservation**: You MUST NOT remove or eliminate ANY instance of these job description keywords: {{#each keywords}}{{{this}}}, {{/each}}.
  2. **Verb Tense**: Current jobs must use Present Tense. All prior jobs must use Past Tense. Enforce this strictly across all bullet points.
  3. **No Fabrication**: Never invent new metrics or achievements. Every fact, date, employer, and skill must be traceable to the source data. If a quantified metric is not available, use a credible relative descriptor (e.g., "significantly reduced").
  4. **Formatting Enforcement**:
     - Name: ALL CAPS. No title, credentials, or job title on the name line.
     - Headline: MUST be on its own line immediately below the Name. You MUST extract this from the second line of the input resume. Do not delete it.
     - Summary: Must end with the line "Target Role: [Exact Job Title from user input]" on its own line, within the summary block. The Summary MUST be a single cohesive paragraph and MUST NOT contain bullet points or lists.
     - Core Skills: Provide a flat array of 12-18 skills in the JSON. The first half MUST be Technical tools/languages/methodologies. The second half MUST be Professional interpersonal/leadership traits.
     - Experience: Header format must be exactly: [Company] | [Title] | [Location] | [Date Range]. Bullets must start with strong action verbs. No weak openers like "Responsible for".
     - Education: Format as - [University] | [Degree, Major] | [Year]. No high school. No GPA unless > 3.5.
     - Technical rules: ASCII characters only. No graphics, tables, columns, or text boxes. Use only bullet (•) or hyphen (-) bullets and pipe (|) separators.
  5. **Acronyms**: Use ALL CAPS for acronyms (SQL, AWS, AI, NLP).
  6. **Line Spacing**: Ensure there are no extra blank lines between the Name and Headline, or between section headers and their starting text.

  **Thinking Process:**
  1. Audit keywords and lock in correct verb tenses for every role.
  2. Map content to JSON fields. 
  3. MANDATORY: The 'headline' field must be extracted from the input text (it is the line immediately following the name). Do not leave this field empty.
  4. Categorize coreSkills array: Technical tools/hard skills first, then Professional interpersonal traits.
  5. Perform a final structure audit to confirm template compliance before returning JSON.

  Original Resume to Polish:
  {{{resumeText}}}
  `,
});

const polishResumeFlow = ai.defineFlow(
  {
    name: 'polishResumeFlow',
    inputSchema: PolishResumeInputSchema,
    outputSchema: PolishResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a polished resume.");
    }
    return output;
  }
);
