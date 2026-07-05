import { stripTrackingMarkers, normalizeForMatch } from './utils';

export type KeywordToInject = {
  keyword: string;
  evidence?: string;
  category?: string;
};

export type InjectionResult = {
  updatedText: string;
  injectedCount: number;
};

function smartCase(keyword: string, preserveTitleCase: boolean = false): string {
  if (!keyword) return '';
  if (preserveTitleCase) return keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  if (keyword === keyword.toUpperCase() && keyword.length > 1) return keyword;
  if (!keyword.includes(' ')) return keyword;
  return keyword.toLowerCase();
}

/**
 * Intelligent injection logic with dynamic structural auditing.
 * Enhanced for high-fidelity detection across varied Markdown and plain-text formats.
 */
export function injectKeywords(
  resumeText: string,
  keywords: KeywordToInject[],
  markerType: 'ADDED_SUPPORTED' | 'ADDED_UNSUPPORTED'
): InjectionResult {
  let currentText = resumeText;
  let count = 0;

  for (const kw of keywords) {
    // Check if specific tracking marker already exists to prevent duplicates
    const casedKw = smartCase(kw.keyword, markerType === 'ADDED_UNSUPPORTED');
    const marker = `@@${markerType}:${kw.category || 'hard_skill'}:${casedKw}@@`;
    
    if (currentText.includes(marker)) continue;

    // Fresh structural audit for every keyword to account for shifting indices
    let lines = currentText.split('\n');
    
    const findSection = (patterns: RegExp[]) => lines.findIndex(l => {
      // Robust detection: Strip markdown (# or ##) and common bullet symbols or whitespace to find the core label
      const cleanLine = l.trim().replace(/^[#\s•\-\*]+/, '');
      return patterns.some(p => p.test(cleanLine));
    });
    
    // Aggressive patterns for key ATS sections
    const expIdx = findSection([/^PROFESSIONAL EXPERIENCE$/i, /^WORK EXPERIENCE$/i, /^EXPERIENCE$/i, /^WORK HISTORY$/i]);
    const skillIdx = findSection([/^CORE SKILLS$/i, /^SKILLS$/i, /^TECHNICAL SKILLS$/i, /^CORE COMPETENCIES$/i]);
    const eduIdx = findSection([/^EDUCATION$/i, /^ACADEMIC$/i]);

    let injected = false;

    // Strategy: Prefer most recent experience bullet for supported keywords
    if (expIdx !== -1 && markerType === 'ADDED_SUPPORTED') {
      const expEnd = skillIdx !== -1 && skillIdx > expIdx ? skillIdx : (eduIdx !== -1 && eduIdx > expIdx ? eduIdx : lines.length);
      const firstBulletIdx = lines.findIndex((l, i) => i > expIdx && i < expEnd && (l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('*')));
      
      if (firstBulletIdx !== -1) {
        lines[firstBulletIdx] = lines[firstBulletIdx].trimEnd().replace(/\.?$/, '') + `, utilizing ${marker}.`;
        injected = true;
      }
    }

    // Fallback: Skills Section (Primary for Unsupported/Gap keywords)
    if (!injected && skillIdx !== -1) {
      let contentLine = skillIdx + 1;
      // Skip empty lines after heading to find the content block
      while (contentLine < lines.length && lines[contentLine].trim() === '') contentLine++;
      
      if (contentLine < lines.length) {
        // Detect current separator style (pipes or commas)
        const separator = lines[contentLine].includes('|') ? ' | ' : ', ';
        lines[contentLine] = lines[contentLine].trimEnd() + separator + marker;
        injected = true;
      } else if (contentLine >= lines.length) {
        // Handle trailing section with no content
        lines.push(marker);
        injected = true;
      }
    }

    // FINAL FALLBACK: If absolutely no section found, create a new one at the end
    if (!injected) {
      if (currentText.length > 0 && !currentText.endsWith('\n\n')) {
        lines.push('');
      }
      lines.push('## CORE SKILLS');
      lines.push(marker);
      injected = true;
    }

    if (injected) {
      currentText = lines.join('\n');
      count++;
    }
  }

  return { updatedText: currentText, injectedCount: count };
}
