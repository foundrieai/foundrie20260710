// MODEL LOCK: googleai/gemini-3.5-flash (from genkit MODEL_ID) — keep Resumait on one model

'use server';

/**
 * @fileOverview An ATS resume optimization system strictly aligned with the 2026 Master ATS Template.
 * Transitions from marginal adjustment to comprehensive structural overhaul.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Robust JSON extractor for the summary task.
 */
function extractJSON(raw: string, taskLabel: string): any {
  if (!raw || raw.trim().length === 0) return null;

  let cleaned = raw
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) return null;

  const jsonString = cleaned.substring(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    const fixed = jsonString
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
      .replace(/'/g, '"');
    try {
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

export async function optimize(input: {
  resumeText: string;
  jobDescriptionText: string;
  targetJobTitle: string;
  keywordsJson?: string;
}) {
  // keywordsJson is a stringified extraction result. Support both the current
  // flat schema ({ hardSkills, softSkills, ... }) and any legacy tiered shape
  // ({ keywords: [{ requirementTier, canonicalTerm }] }) without throwing.
  let parsedKeywords: any = {};
  try {
    parsedKeywords = input.keywordsJson ? JSON.parse(input.keywordsJson) : {};
  } catch {
    parsedKeywords = {};
  }
  const requiredKeywords: string[] = Array.isArray(parsedKeywords?.keywords)
    ? parsedKeywords.keywords
        .filter((k: any) => k?.requirementTier === 'required')
        .map((k: any) => k?.canonicalTerm || k?.surfaceTerm)
        .filter(Boolean)
    : [
        ...(Array.isArray(parsedKeywords?.hardSkills) ? parsedKeywords.hardSkills : []),
        ...(Array.isArray(parsedKeywords?.softSkills) ? parsedKeywords.softSkills : []),
      ].filter(Boolean);

  // --- CALL 1: Optimized Resume Rewrite (Plain Text) ---
  const rewriteResponse = await ai.generate({
    config: { 
      temperature: 0.4, 
      maxOutputTokens: 8192 
    },
    system: `You are an expert ATS resume optimizer and Master Professional Writer. 
    Your mission is a COMPREHENSIVE STRUCTURAL OVERHAUL of the provided resume. 
    Do not make marginal adjustments; transform the narrative and layout into a high-impact, machine-readable executive story.

    **MASTER ATS TEMPLATE TO ENFORCE:**
    [NAME IN ALL CAPS]
    [PROFESSIONAL HEADLINE]
    [Phone Number] | [Email Address] | [City, State] | [LinkedIn Profile URL] [| GitHub/Portfolio/Website if provided]
    
    PROFESSIONAL SUMMARY
    [3–5 sentences. Lead with years of experience. Embed keywords. End with "Target Role: ${input.targetJobTitle}". This section MUST be a single cohesive paragraph block without bullet points.]

    CORE SKILLS
    Technical: [comma-separated hard skills]
    Professional: [comma-separated interpersonal skills]

    PROFESSIONAL EXPERIENCE
    [Company Name] | [Job Title] | [City, State] | [Month Year] – [Month Year or Present]
    • [Strong Action Verb] + [task] + [quantified result]

    EDUCATION
    • [University Name] | [Degree, Major] | [Year]

    **STRICT ARCHITECTURAL RULES:**
    1. **Paragraph Density**: Scan for any text block exceeding 40 words. You MUST split these into concise bullet points or significantly shorter paragraphs. (EXCLUSION: Do not apply this rule to the PROFESSIONAL SUMMARY section).
    2. **Layout Normalization**: Standardize all whitespace. Remove hidden tab characters or complex indentation. Ensure a clean, single-column ASCII structure.
    3. **Formatting Stability**: Use ONLY standard delimiters (pipe |) and bullets (bullet •). Remove non-standard symbols or graphics.
    4. **Keyword Preservation**: Use ${requiredKeywords.join(', ')} verbatim in context.
    5. **Verb Tense**: Present for current role, Past for all prior roles.
    6. **Summary**: Must end with "Target Role: ${input.targetJobTitle}" on its own line. Under no circumstances should bullet points be used in the summary.
    7. **No fabrication**. If exact metrics are missing, use credible relative descriptors (e.g., "significantly optimized").
    8. **Line Spacing**: Do NOT add blank lines between the Name and Headline. Do NOT add a blank line immediately after a section heading (Summary, Skills, Experience, Education) and the content below it.`,
    prompt: `Original Resume:\n${input.resumeText}\n\nJob Description:\n${input.jobDescriptionText}\n\nTarget Role: ${input.targetJobTitle}`,
  });

  const optimizedText = rewriteResponse.text;

  if (!optimizedText || optimizedText.length < 100) {
    throw new Error("Optimization failed: AI produced an empty or too-short resume.");
  }

  // --- CALL 2: Modification Summary (Small JSON) ---
  const summaryResponse = await ai.generate({
    config: { 
      temperature: 0.1, 
      maxOutputTokens: 1024 
    },
    system: `You are an ATS auditor. Summarize changes.`,
    prompt: `Original Resume:\n${input.resumeText.substring(0, 1000)}\n\nOptimized Resume:\n${optimizedText.substring(0, 1000)}\n\nReturn ONLY a JSON object:
{
  "keywordsAdded": ["list of 5-8 terms"],
  "sectionsModified": ["Summary", "Experience"],
  "estimatedScoreImprovement": number
}`,
  });

  const summary = extractJSON(summaryResponse.text, 'SummaryTask') || {
    keywordsAdded: [],
    sectionsModified: [],
    estimatedScoreImprovement: 10
  };

  return {
    optimizedResumeText: optimizedText,
    summary,
  };
}
