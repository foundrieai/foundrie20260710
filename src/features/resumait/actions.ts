'use server';

import type { ActionResponse } from '@/types/actions';
import { hasGoogleAIKey } from '@/ai/genkit';
import { buildOptimizedResume, extractKeywordData, fallbackSpellCheck, formatAnalysis, formatPolishedResume } from './fallback';

export async function runNewKeywordExtraction(jobDescription: string, ownerUid?: string): Promise<ActionResponse<any>> {
  try {
    if (hasGoogleAIKey) {
      const { extractKeywords } = await import('@/ai/flows/resumait-keyword-extraction-flow');
      const data = await extractKeywords({ jobDescription });
      return { success: true, data: { ...data, ownerUid: ownerUid || 'foundrie-dev' } };
    }
    return { success: true, data: extractKeywordData(jobDescription, ownerUid || 'foundrie-dev') };
  } catch {
    return { success: true, data: extractKeywordData(jobDescription, ownerUid || 'foundrie-dev') };
  }
}

export async function getInitialAnalysis(input: {
  resume: string;
  jobDescription: string;
  extractedKeywordsJson: string;
  userId?: string;
  jobTitle: string;
}): Promise<ActionResponse<any>> {
  try {
    return { success: true, data: formatAnalysis(input) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function counselorChat(input: {
  resume: string;
  jobDescription: string;
  history: { role: 'user' | 'model'; content: string }[];
  userInput: string;
}): Promise<ActionResponse<any>> {
  try {
    if (hasGoogleAIKey) {
      const { counselorChat: counselorFlow } = await import('@/ai/flows/resumait-counselor-flow');
      const data = await counselorFlow({
        resumeText: input.resume,
        jobDescriptionText: input.jobDescription,
        history: input.history,
        userInput: input.userInput,
      });
      return { success: true, data };
    }
    const keywords = extractKeywordData(input.jobDescription).hardSkills.slice(0, 4).join(', ') || 'the core requirements';
    return {
      success: true,
      data: {
        responseText: `Here is the next best move: align the top third of the resume to the target role, then add measurable proof for the most important missing keywords. For this role, focus first on ${keywords}.`,
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function runSpellCheck(input: {
  resumeText: string;
  keywords: string[];
}): Promise<ActionResponse<any>> {
  try {
    if (hasGoogleAIKey) {
      const { spellCheckResume } = await import('@/ai/flows/resumait-spell-check-flow');
      return { success: true, data: await spellCheckResume(input) };
    }
    return { success: true, data: fallbackSpellCheck(input.resumeText) };
  } catch {
    return { success: true, data: fallbackSpellCheck(input.resumeText) };
  }
}

export async function runGenerateCoverLetter(input: {
  resume: string;
  jobDescription: string;
}): Promise<ActionResponse<any>> {
  try {
    if (hasGoogleAIKey) {
      const { generateCoverLetter } = await import('@/ai/flows/resumait-cover-letter-generation');
      const data = await generateCoverLetter({
        resumeText: input.resume,
        jobDescriptionText: input.jobDescription,
      });
      return { success: true, data };
    }
    const keywords = extractKeywordData(input.jobDescription).hardSkills.slice(0, 5).join(', ') || 'the role requirements';
    return {
      success: true,
      data: {
        coverLetter: `Dear Hiring Team,\n\nI am excited to apply for this opportunity. My background aligns closely with the role's emphasis on ${keywords}. I have built a track record of translating complex work into measurable outcomes and clear stakeholder value.\n\nI would welcome the opportunity to discuss how my experience can support your team's goals.\n\nSincerely,\nCandidate`,
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function optimize(input: any): Promise<ActionResponse<any>> {
  try {
    if (hasGoogleAIKey) {
      const { optimize: optimizeResume } = await import('@/ai/flows/resumait-ats-resume-optimization');
      const data = await optimizeResume({
        resumeText: input.resume || input.resumeText,
        jobDescriptionText: input.jobDescription || input.jobDescriptionText,
        targetJobTitle: input.jobTitle || input.targetJobTitle,
        keywordsJson: input.extractedKeywordsJson,
      });
      return { success: true, data };
    }
    const parsed = input.extractedKeywordsJson ? JSON.parse(input.extractedKeywordsJson) : extractKeywordData(input.jobDescription || '');
    return {
      success: true,
      data: {
        optimizedResumeText: buildOptimizedResume(input.resume || input.resumeText, input.jobTitle || input.targetJobTitle, parsed),
        summary: { keywordsAdded: parsed.hardSkills || [], sectionsModified: ['Summary', 'Skills'], estimatedScoreImprovement: 12 },
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function polish(input: {
  resumeText: string;
  keywords: string[];
}): Promise<ActionResponse<any>> {
  try {
    if (hasGoogleAIKey) {
      const { polishResume } = await import('@/ai/flows/resumait-polish-resume-flow');
      const data = await polishResume(input);
      return { success: true, data: { polishedResume: formatPolishedResume(data, input.resumeText) } };
    }
    return {
      success: true,
      data: {
        polishedResume: input.resumeText.replace(/\bresponsible for\b/gi, 'Led').replace(/\bworked on\b/gi, 'Delivered').replace(/\bhelped with\b/gi, 'Supported'),
      },
    };
  } catch {
    return {
      success: true,
      data: {
        polishedResume: input.resumeText.replace(/\bresponsible for\b/gi, 'Led').replace(/\bworked on\b/gi, 'Delivered').replace(/\bhelped with\b/gi, 'Supported'),
      },
    };
  }
}

export async function getResumeScore(input: any): Promise<ActionResponse<any>> {
  return getInitialAnalysis(input);
}
