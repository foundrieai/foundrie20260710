/**
 * DETERMINISTIC ATS SCORING ENGINE
 * Pure TypeScript implementation of the Weighted Multi-Factor Scoring Model.
 * No AI calls are made within this file to ensure 100% consistent results.
 */

import { normalizeForMatch } from './utils';

/**
 * SEMANTIC MAPPING CONSTANTS
 */

const EDUCATION_LEVELS: Record<string, number> = {
  highschool: 1,
  bachelors: 2,
  masters: 3,
  phd: 4,
};

const EDUCATION_ALIASES: Record<string, string[]> = {
  bachelors: ["bs", "ba", "b.s.", "b.a.", "undergraduate", "bachelor"],
  masters: ["ms", "ma", "m.s.", "m.a.", "mba", "m.b.a.", "master"],
  phd: ["doctorate", "p.h.d.", "ph.d", "doctor"],
};

/**
 * TECHNICAL ALIAS RESOLVER
 * Maps canonical terms to common professional synonyms.
 */
const TECHNICAL_ALIASES: Record<string, string[]> = {
  "AWS": ["Amazon Web Services", "Amazon Cloud"],
  "GCP": ["Google Cloud Platform", "Google Cloud"],
  "Azure": ["Microsoft Azure"],
  "Machine Learning": ["ML", "Predictive Modeling", "Statistical Modeling"],
  "Artificial Intelligence": ["AI", "GenAI", "Generative AI"],
  "Software Engineer": ["SDE", "Full Stack Developer", "Software Developer"],
  "SQL": ["PostgreSQL", "MySQL", "T-SQL", "NoSQL"],
  "Python": ["PySpark", "Django", "Flask"],
  "Project Management": ["PMP", "Project Lead", "Program Management"],
  "Agile": ["Scrum", "Kanban", "Sprint Planning"],
  "CRM": ["Salesforce", "HubSpot", "Microsoft Dynamics"],
  "ERP": ["SAP", "Oracle NetSuite", "Workday Financials"],
  "Data Visualization": ["Tableau", "Power BI", "Looker", "D3.js"],
  "DevOps": ["CI/CD", "Site Reliability Engineering", "SRE"],
  "Cybersecurity": ["InfoSec", "Network Security", "Penetration Testing"],
  "REST API": ["RESTful", "Web Services", "GraphQL"],
  "Docker": ["Kubernetes", "K8s", "Containerization"],
  "UI/UX": ["Product Design", "User Interface", "User Experience"],
  "Business Intelligence": ["BI", "Data Analytics"],
  "Human Resources": ["HR", "People Operations", "Talent Acquisition"],
};

/**
 * HELPERS
 */

function resolveEducationLevel(text: string): number {
  const norm = normalizeForMatch(text);
  let highest = 0;

  for (const [level, value] of Object.entries(EDUCATION_LEVELS)) {
    if (norm.includes(level)) {
      highest = Math.max(highest, value);
    }
    const aliases = EDUCATION_ALIASES[level] || [];
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias.replace(/\./g, '\\.')}\\b`, 'i');
      if (regex.test(text)) {
        highest = Math.max(highest, value);
      }
    }
  }
  return highest;
}

/**
 * Check match quality: exact, semantic (alias), or missing.
 */
function checkMatchQuality(kw: string, normalizedResumeText: string): 'found' | 'supported' | 'missing' {
  const normKw = normalizeForMatch(kw);
  if (normalizedResumeText.includes(normKw)) return 'found';
  
  for (const [canonical, synonyms] of Object.entries(TECHNICAL_ALIASES)) {
    const normCanonical = normalizeForMatch(canonical);
    const normSynonyms = synonyms.map(s => normalizeForMatch(s));
    const clique = [normCanonical, ...normSynonyms];
    
    if (clique.includes(normKw)) {
      if (clique.some(term => normalizedResumeText.includes(term))) {
        return 'supported';
      }
    }
  }
  return 'missing';
}

/**
 * Robustly isolates a resume section by identifying header boundaries.
 * Permissive keywords and fuzzy matching for raw user resumes.
 */
export function getSection(text: string, targetKeywords: string[]): string {
  const lines = text.split(/\r?\n/);
  const allKnownHeaders = [
    'EDUCATION', 'EXPERIENCE', 'WORK HISTORY', 'PROFESSIONAL EXPERIENCE', 'SKILLS', 
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'PROFILE', 'PROJECTS', 'CERTIFICATIONS', 
    'AWARDS', 'LANGUAGES', 'ACADEMIC', 'EMPLOYMENT', 'EXECUTIVE SUMMARY', 'OBJECTIVE',
    'CORE SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'WORK EXPERIENCE', 'VOLUNTEER'
  ];

  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Strip markers and normalization
    const cleanLine = rawLine.toUpperCase()
      .replace(/^[#\s•\-\*]+/, '') 
      .replace(/[#\s•\-\*]+$/, '')
      .replace(/:$/, '')
      .trim();

    if (cleanLine.length < 60 && targetKeywords.some(kw => cleanLine === kw || cleanLine.includes(kw))) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return '';

  let endIdx = lines.length;
  for (let j = startIdx + 1; j < lines.length; j++) {
    const rawLine = lines[j].trim();
    if (!rawLine) continue;

    const cleanLine = rawLine.toUpperCase()
      .replace(/^[#\s•\-\*]+/, '')
      .replace(/[#\s•\-\*]+$/, '')
      .replace(/:$/, '')
      .trim();

    // If it looks like a NEW section header
    if (cleanLine.length > 2 && cleanLine.length < 50 && 
        allKnownHeaders.some(h => cleanLine === h) && 
        !targetKeywords.some(kw => cleanLine === kw)) {
       endIdx = j;
       break;
    }
  }

  return lines.slice(startIdx + 1, endIdx).join('\n').trim();
}

/**
 * Recruiter Audit - Impact Rating Calculation logic.
 * Robust metric detection and role identification.
 */
export function auditImpact(resumeText: string) {
  const expSection = getSection(resumeText, ['EXPERIENCE', 'WORK HISTORY', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT', 'WORK EXPERIENCE']);
  if (!expSection || expSection.trim().length < 10) return { score: 0, highImpactCount: 0, totalRoles: 0 };

  const lines = expSection.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const bulletStart = /^[•\-*·●▪◦○\u2022\u2023\u25E6\u25A0\u25AA\u00B7\u2012\u2013\u2014\u2212+>]|^\d+[\.\)]/;
  
  // High-fidelity metric regex: handles $, %, decimals, currency, and quantities while excluding years
  const metricRegex = /%|\$|£|€|\b\d+(?:,\d+)?\s*(?:%|percent|dollars|USD|users|clients|leads|hours|weeks|months|X|x|times|growth|reduction|savings|ROI|revenue)\b|\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b(?!\s*(?:st|nd|rd|th|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20|19))/i;

  const roles: { header: string; bullets: string[] }[] = [];
  let currentHeader = "";
  let currentBullets: string[] = [];

  lines.forEach(line => {
    const isBullet = bulletStart.test(line);
    
    if (isBullet) {
      currentBullets.push(line);
    } else {
      if (currentHeader !== "" && currentBullets.length > 0) {
        roles.push({ header: currentHeader, bullets: [...currentBullets] });
        currentHeader = line;
        currentBullets = [];
      } else if (currentHeader === "") {
        currentHeader = line;
      } else {
        currentHeader += " " + line;
      }
    }
  });

  if (currentHeader !== "" || currentBullets.length > 0) {
    roles.push({ header: currentHeader, bullets: currentBullets });
  }

  const validRoles = roles.filter(r => r.bullets.length > 0);
  if (validRoles.length === 0) {
    // Fallback for flat lists or sections without clear headers: treat whole section as one role
    const rolesWithImpact = lines.filter(l => bulletStart.test(l) && metricRegex.test(l)).length;
    const totalPossible = lines.filter(l => bulletStart.test(l)).length;
    
    return {
      score: totalPossible > 0 ? Math.round((rolesWithImpact / Math.max(1, Math.ceil(totalPossible / 4))) * 100) : (lines.some(l => metricRegex.test(l)) ? 100 : 0),
      highImpactCount: rolesWithImpact,
      totalRoles: 1
    };
  }

  let rolesWithMetrics = 0;
  validRoles.forEach(role => {
    if (role.bullets.some(b => metricRegex.test(b))) {
      rolesWithMetrics++;
    }
  });

  return {
    score: Math.round((rolesWithMetrics / validRoles.length) * 100),
    highImpactCount: rolesWithMetrics,
    totalRoles: validRoles.length
  };
}

/**
 * Weighted Multi-Factor Scoring Engine.
 * Formula: S = (K * 0.45) + (T * 0.20) + (R * 0.10) + (E * 0.15) + (H * 0.10) - P
 */
export function calculateAtsMatch(extraction: any, resumeText: string, targetJobTitle: string) {
  const normalizedResume = normalizeForMatch(resumeText);
  const normalizedTargetTitle = normalizeForMatch(targetJobTitle);
  
  const allHard = extraction.hardSkills || [];
  const allSoft = extraction.softSkills || [];
  
  const foundKeywords: string[] = [];
  const supportedKeywords: string[] = [];
  const unsupportedKeywords: string[] = [];

  [...allHard, ...allSoft].forEach(kw => {
    const quality = checkMatchQuality(kw, normalizedResume);
    if (quality === 'found') foundKeywords.push(kw);
    else if (quality === 'supported') supportedKeywords.push(kw);
    else unsupportedKeywords.push(kw);
  });

  // 1. Keyword Vector (K) - 45%
  const matchedList = [...foundKeywords, ...supportedKeywords];
  const kHard = (allHard.length > 0) ? (allHard.filter((k: string) => matchedList.includes(k)).length / allHard.length) * 0.8 : 0.8;
  const kSoft = (allSoft.length > 0) ? (allSoft.filter((k: string) => matchedList.includes(k)).length / allSoft.length) * 0.2 : 0.2;
  const kScore = (kHard + kSoft) * 100;

  // 2. Title Alignment (T) - 20%
  let tScore = 0;
  const requiredTitles = extraction.requiredTitles || [];
  const foundTitleMatch = requiredTitles.some((title: string) => {
    const norm = normalizeForMatch(title);
    return normalizedResume.includes(norm) || normalizedTargetTitle.includes(norm);
  });
  if (foundTitleMatch) tScore = 100;
  else if (requiredTitles.some((title: string) => normalizedTargetTitle.includes(normalizeForMatch(title).split(' ')[0]))) tScore = 50;

  // 3. Recency & Frequency (R) - 10%
  const expSection = getSection(resumeText, ['EXPERIENCE', 'WORK HISTORY', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT', 'WORK EXPERIENCE']);
  const expMatches = matchedList.filter(kw => normalizeForMatch(expSection).includes(normalizeForMatch(kw)));
  const rScore = Math.min(100, (expMatches.length / Math.max(1, matchedList.length)) * 120);

  // 4. Education (E) - 15%
  let eScore = 0;
  const eduSection = getSection(resumeText, ['EDUCATION', 'ACADEMIC', 'SCHOOLING']);
  const requiredLevel = resolveEducationLevel(extraction.minEducation || 'highschool');
  const userLevel = resolveEducationLevel(eduSection);

  if (userLevel >= requiredLevel && requiredLevel > 0) {
    eScore = 100;
  } else if (!extraction.minEducation || extraction.minEducation.toLowerCase().includes('not specified')) {
    eScore = 100;
  } else if (userLevel > 0) {
    eScore = 50;
  }

  // 5. Human Appeal (H) - 10%
  const hAudit = auditImpact(resumeText);
  const hScore = hAudit.score;

  // 6. Formatting Penalties (P)
  const penalties = [];
  let pDeduction = 0;

  // EXCESSIVE BULLET LENGTH: ONLY check individual bullets in Experience section
  if (expSection) {
    const bulletStart = /^[•\-*·●▪◦○\u2022\u2023\u25E6\u25A0\u25AA\u00B7\u2012\u2013\u2014\u2212+>]|^\d+[\.\)]/;
    const expLines = expSection.split('\n');
    const hasLongBulletInExp = expLines.some(line => {
      const trimmed = line.trim();
      if (trimmed.length < 20) return false;
      const isBullet = bulletStart.test(trimmed);
      const wordCount = trimmed.split(/\s+/).length;
      return wordCount > 40 && isBullet;
    });

    if (hasLongBulletInExp) {
      penalties.push({ 
        label: 'EXCESSIVE BULLET LENGTH', 
        points: -10, 
        reason: 'Detected bullet points within the Professional Experience section exceeding 40 words. These diminish readability and ATS scan quality.' 
      });
      pDeduction += 10;
    }
  }

  if (/ {3,}/.test(resumeText)) {
    penalties.push({ label: 'LAYOUT COMPLEXITY', points: -10, reason: 'Detected multi-column spacing markers which scramble ATS text mapping. Use standard single-column text.' });
    pDeduction += 10;
  }

  const hasEmail = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const headerCheckLimit = Math.min(resumeText.length, 1000);
  const headerContent = resumeText.substring(0, headerCheckLimit);
  const hasContactInHeader = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(headerContent) || /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(headerContent);

  if (!hasEmail || !hasPhone || !hasContactInHeader) {
    penalties.push({ label: 'CONTACT ACCESSIBILITY', points: -10, reason: 'Contact details not found in the top 10% of the document.' });
    pDeduction += 10;
  }

  const finalScore = Math.max(0, Math.round(
    (kScore * 0.45) + 
    (tScore * 0.20) + 
    (rScore * 0.10) + 
    (eScore * 0.15) +
    (hScore * 0.10) - 
    pDeduction
  ));

  // Parsing Preview Logic
  const resumeLines = resumeText.split('\n').filter(l => l.trim().length > 0);
  const fullName = resumeLines[0]?.trim() || 'Unknown';
  const nameParts = fullName.split(' ');
  const legalFirstName = nameParts[0] || 'Unknown';
  const legalLastName = nameParts.slice(1).join(' ') || 'Not Found';
  
  const mostRecentTitleLine = expSection.split('\n').find(l => l.includes('|') || l.includes('-') || l.includes('–'));
  let extractedRecentTitle = 'Not Found';
  let extractedRecentCompany = 'Not Found';
  if (mostRecentTitleLine) {
    const parts = mostRecentTitleLine.split(/[|\-–—]/);
    extractedRecentTitle = parts[0]?.trim() || 'Not Found';
    extractedRecentCompany = parts[1]?.trim() || 'Not Found';
  }

  const targetRoleLine = resumeText.split('\n').find(l => l.toLowerCase().includes('target role:'));
  const targetRoleFound = targetRoleLine ? targetRoleLine.split(':')[1]?.trim() : targetJobTitle;

  return {
    score: finalScore,
    breakdown: {
      hardSkillsMatch: Math.round(kHard * 100),
      softSkillsMatch: Math.round(kSoft * 100),
      titleAlignment: tScore,
      experienceWeight: Math.round(rScore),
      educationMatch: eScore,
      humanAppeal: Math.round(hScore),
      penalties
    },
    foundKeywords,
    supportedKeywords,
    unsupportedKeywords,
    humanAudit: {
      percentage: hScore,
      highImpactCount: hAudit.highImpactCount,
      totalRoles: hAudit.totalRoles
    },
    atsPreview: {
      legalFirstName,
      legalLastName,
      targetRole: targetRoleFound,
      latestExp: extractedRecentTitle !== 'Not Found' ? `${extractedRecentTitle} at ${extractedRecentCompany}` : '⚠️ Review formatting in Header',
      eduParse: 'Detected',
      skillsAutoFill: matchedList.slice(0, 5)
    }
  };
}
