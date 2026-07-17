// MODEL LOCK: googleai/gemini-3.5-flash (from genkit MODEL_ID) — keep Resumait on one model

'use server';

/**
 * @fileOverview Elite ATS Configuration Engine for Requirement Extraction.
 * Mandates flat schema extraction to prevent Firestore nested array errors.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Schemas ---

// Fields are made optional to handle cases where the model might fail to generate 
// every key, preventing high-level schema validation errors while still 
// encouraging the model to provide them via the prompt.
const ExtractionOutputSchema = z.object({
  jobTitle: z.string().optional().describe('The core job title identified in the description.'),
  hardSkills: z.array(z.string()).optional().describe('Technical tools, languages, and methodologies.'),
  softSkills: z.array(z.string()).optional().describe('Interpersonal and leadership traits.'),
  requiredTitles: z.array(z.string()).optional().describe('The exact job title and 2-3 closely related seniorities.'),
  minEducation: z.string().optional().describe('The minimum degree mentioned (e.g., "Bachelor\'s").'),
  orGroups: z.array(z.string()).optional().describe('Return orGroups as a flat array of strings. If multiple terms are related (OR logic), join them into a single string separated by a comma (e.g., "Computer Science, Statistics"). DO NOT return an array of arrays.'),
});

// --- Orchestrator ---

export async function extractKeywords(input: {
  jobDescription: string;
}) {
  return extractKeywordsFlow(input);
}

export const extractKeywordsFlow = ai.defineFlow(
  {
    name: 'analyzeJobRequirements',
    inputSchema: z.object({
      jobDescription: z.string(),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    const response = await ai.generate({
      config: { 
        temperature: 0, 
        maxOutputTokens: 4096, // Increased to prevent truncated JSON for long JDs
        timeout: 110000 
      },
      output: { schema: ExtractionOutputSchema },
      system: `You are an elite Applicant Tracking System (ATS) Configuration Engine. Your purpose is to parse a raw Job Description and extract a deduplicated, high-signal Requirement Schema.

CORE EXTRACTION RULES (NON-NEGOTIABLE)
1. Dynamic Quantity: Extract ALL unique technical and soft skills identified in the Job Description. Do not attempt to hit a specific number. Accuracy and deduplication are the only priorities.
2. Strict Semantic Deduplication: Consolidate synonyms (e.g., "ML" and "Machine Learning" -> "Machine Learning").
3. Eliminate Fluff: Ignore boilerplate marketing like "Value-Driven AI" or "Fast-paced environment".
4. Title Extraction: Identify the core job title and 2-3 equivalent seniorities. Populate 'jobTitle' with the primary title and 'requiredTitles' with variations.
5. Education: Identify the absolute minimum degree mentioned.
6. OR Groups / Related Terms: Return these as flat strings within the array. If multiple terms are related (OR logic), join them into a single string separated by a comma (e.g., "Python, PySpark"). NEVER return nested arrays (arrays inside arrays).
7. Consistency: Return an empty array [] for skill fields if no matches are found. Do not return empty strings "" inside the arrays.

CRITICAL: All output must be a flat JSON structure. 'orGroups' and 'keywordGroups' must be arrays of STRINGS. Example: ['React, Next.js', 'Tailwind, CSS']. Never return [['React', 'Next.js']].

Return a strictly formatted JSON object matching the Requirement Schema.`,
      prompt: `JOB DESCRIPTION:\n${input.jobDescription}`,
    });
    
    const result = response.output;
    if (!result) throw new Error("AI failed to extract requirement schema.");

    // Ensure we return a structure that the rest of the app expects, 
    // applying defaults if the model missed any optional fields.
    return {
      jobTitle: result.jobTitle || 'Position',
      hardSkills: result.hardSkills || [],
      softSkills: result.softSkills || [],
      requiredTitles: result.requiredTitles || [],
      minEducation: result.minEducation || 'Not Specified',
      orGroups: result.orGroups || [],
      summary: {
        totalHardSkills: result.hardSkills?.length || 0,
        totalSoftSkills: result.softSkills?.length || 0,
      }
    };
  }
);
