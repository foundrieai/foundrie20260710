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

export function unique(items: string[]) {
  return Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));
}

function titleCase(text: string) {
  return text
    .split(/\s+/)
    .map(word => (word.length <= 3 && word === word.toUpperCase() ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join(' ');
}

export function extractKeywordData(jobDescription: string, ownerUid = 'foundrie-dev') {
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
    ownerUid,
  };
}

export function buildOptimizedResume(resume: string, jobTitle: string, keywordData: any) {
  const keywords = unique([...(keywordData.hardSkills || []), ...(keywordData.softSkills || [])]).slice(0, 10);
  const hasSummary = /professional summary|summary|profile/i.test(resume);
  const summary = `PROFESSIONAL SUMMARY\n${jobTitle || keywordData.jobTitle || 'Targeted professional'} with proven experience across ${keywords.slice(0, 6).join(', ') || 'the target role requirements'}. Focused on measurable outcomes, stakeholder clarity, and execution-ready impact.\n\n`;
  const keywordLine = keywords.length ? `\n\nTARGETED KEYWORD ALIGNMENT\n${keywords.map(keyword => `- ${keyword}`).join('\n')}` : '';
  return `${hasSummary ? resume.trim() : summary + resume.trim()}${keywordLine}\n\nRESUMAIT OPTIMIZATION NOTES\n- Strengthened ATS keyword alignment.\n- Preserved source resume content while adding targeted evidence prompts.\n- Reframed the document around the target role.`;
}

export function formatAnalysis(input: {
  resume: string;
  extractedKeywordsJson: string;
  jobTitle: string;
}) {
  const extraction = JSON.parse(input.extractedKeywordsJson);
  const analysis = calculateAtsMatch(extraction, input.resume, input.jobTitle);
  return {
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
  };
}

export function formatPolishedResume(data: any, fallbackText: string) {
  if (!data || typeof data === 'string') return data || fallbackText;
  const header = data.header || {};
  const experience = Array.isArray(data.professionalExperience) ? data.professionalExperience : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const sections = [
    header.name?.toUpperCase(),
    header.headline,
    [header.phone, header.email, header.location, header.linkedin].filter(Boolean).join(' | '),
    '',
    'PROFESSIONAL SUMMARY',
    data.summary,
    '',
    'CORE SKILLS',
    Array.isArray(data.coreSkills) ? data.coreSkills.join(' | ') : '',
    '',
    'PROFESSIONAL EXPERIENCE',
    experience.flatMap((role: any) => [
      [role.company, role.title, role.location, `${role.startDate || ''} - ${role.endDate || ''}`].filter(Boolean).join(' | '),
      ...(role.bullets || []).map((bullet: string) => `- ${bullet}`),
      '',
    ]).join('\n'),
    'EDUCATION',
    education.map((edu: any) => `- ${[edu.institution, edu.degree, edu.location, `${edu.startDate || ''} - ${edu.endDate || ''}`].filter(Boolean).join(' | ')}`).join('\n'),
  ].filter(part => part !== undefined && part !== null);
  return sections.join('\n').replace(/\n{3,}/g, '\n\n').trim() || fallbackText;
}

export function fallbackSpellCheck(resumeText: string) {
  return {
    correctedResume: resumeText.replace(/\bmanagment\b/gi, 'management').replace(/\banaltyics\b/gi, 'analytics'),
    typoCount: resumeText.match(/\b(managment|analtyics)\b/gi)?.length || 0,
  };
}
