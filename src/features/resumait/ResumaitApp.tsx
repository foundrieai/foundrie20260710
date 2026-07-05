'use client';

import ResumeOptimizerPage from '@/components/resume-optimizer-page';
import { calculateAtsMatch } from '@/lib/ats-logic';

const STOPWORDS = new Set([
  'about',
  'across',
  'after',
  'also',
  'and',
  'are',
  'building',
  'candidate',
  'clients',
  'company',
  'degree',
  'developing',
  'experience',
  'from',
  'have',
  'help',
  'including',
  'into',
  'minimum',
  'preferred',
  'requirements',
  'responsibilities',
  'role',
  'strong',
  'the',
  'this',
  'through',
  'using',
  'will',
  'with',
  'work',
  'years',
]);

function unique(items: string[]) {
  return Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));
}

function titleCase(text: string) {
  return text
    .split(/\s+/)
    .map(word => (word.length <= 3 && word === word.toUpperCase() ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join(' ');
}

function extractKeywordData(jobDescription: string) {
  const knownHard = [
    'Python',
    'SQL',
    'Machine Learning',
    'Predictive Modeling',
    'Statistical Analysis',
    'Data Visualization',
    'AI Strategy',
    'AWS',
    'Azure',
    'Spark',
    'Snowflake',
    'Generative AI',
    'LLMs',
    'Production Deployment',
    'Executive Dashboards',
    'NLP',
    'TensorFlow',
    'SageMaker',
    'PySpark',
  ];
  const knownSoft = [
    'Stakeholder Management',
    'Cross-Functional Collaboration',
    'Consulting',
    'Communication',
    'Leadership',
    'Problem Solving',
    'Agile',
  ];
  const lower = jobDescription.toLowerCase();
  const hardSkills = knownHard.filter(term => lower.includes(term.toLowerCase()));
  const softSkills = knownSoft.filter(term => lower.includes(term.toLowerCase()));
  const phrases = unique(Array.from(jobDescription.matchAll(/\b[A-Z][A-Za-z+#./-]*(?:\s+[A-Z][A-Za-z+#./-]*){0,3}\b/g)).map(match => match[0]))
    .filter(term => term.length > 2 && !STOPWORDS.has(term.toLowerCase()))
    .slice(0, 10);
  const requiredTitles = unique([
    ...Array.from(jobDescription.matchAll(/\b(?:Senior|Lead|Principal|Staff|Execution)?\s*(?:Data Scientist|Product Manager|Software Engineer|Founder|Analyst|Consultant|Manager)\b/gi)).map(match => titleCase(match[0])),
  ]).slice(0, 4);

  return {
    jobTitle: requiredTitles[0] || 'Target Position',
    hardSkills: unique([...hardSkills, ...phrases]).slice(0, 16),
    softSkills: unique(softSkills).slice(0, 8),
    orGroups: [],
    requiredTitles: requiredTitles.length ? requiredTitles : ['Data Scientist', 'Analyst', 'Manager'],
    minEducation: lower.includes('master') ? 'masters' : lower.includes('bachelor') ? 'bachelors' : 'Not Specified',
    lastUpdated: new Date().toISOString(),
    ownerUid: 'foundrie-dev',
  };
}

function buildOptimizedResume(resume: string, jobTitle: string, keywordData: any) {
  const keywords = unique([...(keywordData.hardSkills || []), ...(keywordData.softSkills || [])]).slice(0, 10);
  const hasSummary = /professional summary|summary|profile/i.test(resume);
  const summary = `PROFESSIONAL SUMMARY\n${jobTitle || keywordData.jobTitle || 'Targeted professional'} with proven experience across ${keywords.slice(0, 6).join(', ')}. Focused on measurable outcomes, stakeholder clarity, and execution-ready impact.\n\n`;
  const keywordLine = `\n\nTARGETED KEYWORD ALIGNMENT\n${keywords.map(keyword => `- ${keyword}`).join('\n')}`;
  return `${hasSummary ? resume : summary + resume.trim()}${keywordLine}\n\nRESUMAIT OPTIMIZATION NOTES\n- Strengthened ATS keyword alignment.\n- Preserved source resume content while adding targeted evidence prompts.\n- Reframed the document around the target role.`;
}

export function ResumaitApp() {
  const actions = {
    optimize: async () => ({ success: false, error: 'Use the main optimization engine.' }),
    getResumeScore: async () => ({ success: false, error: 'Use the weighted diagnostic engine.' }),
    runNewKeywordExtraction: async (jobDescription: string, ownerUid?: string) => ({
      success: true,
      data: { ...extractKeywordData(jobDescription), ownerUid: ownerUid || 'foundrie-dev' },
    }),
    getInitialAnalysis: async (input: {
      resume: string;
      jobDescription: string;
      extractedKeywordsJson: string;
      jobTitle: string;
      userId?: string;
    }) => {
      try {
        const extraction = JSON.parse(input.extractedKeywordsJson);
        const analysis = calculateAtsMatch(extraction, input.resume, input.jobTitle);
        return {
          success: true,
          data: {
            foundKeywords: analysis.foundKeywords,
            supportedKeywords: analysis.supportedKeywords,
            unsupportedKeywords: analysis.unsupportedKeywords,
            matchPercentage: analysis.score,
            fullScore: {
              compositeScore: analysis.score,
              qualitativeRating: analysis.score >= 75 ? 'Excellent' : analysis.score >= 60 ? 'Strong' : 'Needs Improvement',
              scoreBreakdown: analysis.breakdown,
              penalties: analysis.breakdown.penalties,
              topRecommendations: [
                analysis.unsupportedKeywords.length
                  ? `Incorporate critical keyword gaps: ${analysis.unsupportedKeywords.slice(0, 3).join(', ')}`
                  : 'Excellent technical alignment.',
                analysis.breakdown.titleAlignment < 100
                  ? 'Adjust professional headline to match target role titles.'
                  : 'Title alignment is strong.',
                ...analysis.breakdown.penalties.map((penalty: any) => penalty.reason),
              ],
            },
            humanAudit: analysis.humanAudit,
            atsPreview: {
              contactParsing: 'SUCCESS',
              educationBlock: 'Detected',
              experienceBlocks: analysis.humanAudit?.totalRoles || 1,
              keywordHitRate: analysis.score,
              ...analysis.atsPreview,
            },
          },
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    counselorChat: async (input: any) => ({
      success: true,
      data: {
        responseText: `Here is the next best move: align the top third of the resume to the target role, then add measurable proof for the most important missing keywords. For this role, focus first on ${extractKeywordData(input.jobDescription || '').hardSkills.slice(0, 4).join(', ') || 'the core requirements'}.`,
      },
    }),
    runSpellCheck: async (input: { resumeText: string; keywords: string[] }) => ({
      success: true,
      data: {
        correctedResume: input.resumeText.replace(/\bmanagment\b/gi, 'management').replace(/\banaltyics\b/gi, 'analytics'),
        typoCount: input.resumeText.match(/\b(managment|analtyics)\b/gi)?.length || 0,
      },
    }),
    runGenerateCoverLetter: async (input: { resume: string; jobDescription: string }) => ({
      success: true,
      data: {
        coverLetter: `Dear Hiring Team,\n\nI am excited to apply for this opportunity. My background aligns closely with the role's emphasis on ${extractKeywordData(input.jobDescription).hardSkills.slice(0, 5).join(', ')}. I have built a track record of translating complex work into measurable outcomes and clear stakeholder value.\n\nI would welcome the opportunity to discuss how my experience can support your team's goals.\n\nSincerely,\nCandidate`,
      },
    }),
  };

  return (
    <div className="resumait-skin min-h-[calc(100vh-74px)] px-4 py-6 md:px-8">
      <ResumeOptimizerPage actions={actions} />
    </div>
  );
}

export { buildOptimizedResume, extractKeywordData };
