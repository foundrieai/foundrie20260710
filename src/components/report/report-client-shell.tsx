'use client';

import { useState, useEffect } from 'react';
import type { Report, SectionKey } from '@/lib/types';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Toc } from '@/components/report/toc';
import { ScoringSection } from '@/components/report/scoring-section';
import { ReportActions } from '@/components/report/report-actions';
import { GlowContainer } from '../shared/glow-container';
import { ChatPanel } from './chat/ChatPanel';
import { 
    generateReportSection, 
    generateScores, 
    continueReportSection, 
    ReportScores, 
    generateNameAndTagline
} from '@/ai/flows/generate-startup-validation-report';
import { formatFounderContext } from '@/lib/founder-context';
import { ProcessingFlame } from '@/components/shared/processing-flame';
import { generateExecutiveSummary } from '@/ai/flows/generate-executive-summary';
import { polishReportSection } from '@/ai/flows/polish-report-section';
import { ProblemSolutionFit } from '@/components/report/problem-solution-fit';
import { ProblemSolutionFitExtended } from '@/components/report/problem-solution-fit-extended';
import { PitchDeck } from '@/components/report/pitch-deck';
import { ProductMarketFit } from '@/components/report/product-market-fit';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, deleteField, setDoc } from 'firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, RefreshCw, Search, MessageSquare, Wand2, Edit2, Check, X as CloseIcon, MapPin, Pencil, RotateCcw, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sectionHeadings, businessQuotes, progressMessages } from '@/lib/report-helpers';
import { isAdminUser } from '@/lib/entitlements';
import { DeepDiveSheet } from './deep-dive-sheet';
import { deepDiveAnalysis } from '@/ai/flows/deep-dive-analysis';
import { cn } from '@/lib/utils';

const completionMarkerRegex = /\[(ANALYSIS_COMPLETE|END_OF_ANALYSIS|ANALYSIS_FINISHED|ANALYSIS_END)\]/i;
const WHITELABEL_REGEX = /IDEAIT|IDEAMAIT|LAUNCHCODE/gi;

/**
 * Utility to scrub internal branding from content strings for existing data.
 */
function scrubInternalBranding(text: string): string {
  if (!text) return '';
  return text.replace(WHITELABEL_REGEX, (match) => {
    const m = match.toLowerCase();
    if (m === 'launchcode') return 'The Platform';
    return 'Investment Intelligence';
  });
}

const markdownComponents = {
  p: ({...props}: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
  ul: ({...props}: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-outside mb-4 ml-6 space-y-2" {...props} />,
  ol: ({...props}: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-outside mb-4 ml-6 space-y-2" {...props} />,
  li: ({...props}: React.HTMLAttributes<HTMLLIElement>) => <li className="pl-2" {...props} />,
  h1: ({...props}: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-2xl font-bold font-headline mb-4 mt-8" {...props} />,
  h2: ({...props}: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-xl font-bold font-headline mb-3 mt-6" {...props} />,
  h3: ({...props}: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-lg font-bold font-headline mb-2 mt-4" {...props} />,
  // Map the remaining heading/inline elements explicitly so markdown never
  // falls through to the aggressive global h4-h6/strong element rules (which
  // otherwise bleed unexpected bold/oversized type into the report body).
  h4: ({...props}: React.HTMLAttributes<HTMLHeadingElement>) => <h4 className="text-base font-bold font-headline mb-2 mt-4" {...props} />,
  h5: ({...props}: React.HTMLAttributes<HTMLHeadingElement>) => <h5 className="text-sm font-bold font-headline uppercase tracking-wide mb-2 mt-4" {...props} />,
  h6: ({...props}: React.HTMLAttributes<HTMLHeadingElement>) => <h6 className="text-sm font-bold font-headline uppercase tracking-wide mb-2 mt-4" {...props} />,
  strong: ({...props}: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold text-white" {...props} />,
  em: ({...props}: React.HTMLAttributes<HTMLElement>) => <em className="italic" {...props} />,
  a: ({...props}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-primary underline underline-offset-2 hover:text-primary/80" {...props} />,
  blockquote: ({...props}: React.HTMLAttributes<HTMLQuoteElement>) => <blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground my-4" {...props} />,
  code: ({...props}: React.HTMLAttributes<HTMLElement>) => <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em]" {...props} />,
  table: ({...props}: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse border border-white/10 text-sm" {...props} />
    </div>
  ),
  th: ({...props}: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className="border border-white/10 bg-white/5 p-3 text-left font-bold" {...props} />,
  td: ({...props}: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className="border border-white/10 p-3" {...props} />,
};

export function ReportClientShell({ report: initialReport }: { report: Report }) {
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get('module') as any;
  const initialModule = ['validation', 'prototyping', 'pitchdeck', 'problem_solution_fit_extended', 'product_market_fit', 'go_to_market_fit', 'growth_scale', 'maturity_exit'].includes(moduleParam) ? moduleParam : 'validation';

  const [activeModule, setActiveModule] = useState<'validation' | 'prototyping' | 'pitchdeck' | 'problem_solution_fit_extended' | 'product_market_fit' | 'go_to_market_fit' | 'growth_scale' | 'maturity_exit'>(initialModule);
  
  useEffect(() => {
    if (moduleParam && ['validation', 'prototyping', 'pitchdeck', 'problem_solution_fit_extended', 'product_market_fit', 'go_to_market_fit', 'growth_scale', 'maturity_exit'].includes(moduleParam)) {
      setActiveModule(moduleParam);
    }
  }, [moduleParam]);

  const [report, setReport] = useState(initialReport);
  const projectContext = report;
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string | undefined>();
  const [generatingSection, setGeneratingSection] = useState<SectionKey | 'scores' | 'summary' | 'branding' | 'polishing' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(initialReport.companyName);
  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [tempTagline, setTempTagline] = useState(initialReport.tagline || '');

  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [deepDiveSection, setDeepDiveSection] = useState<{ key: SectionKey; title: string } | null>(null);
  const [deepDiveContent, setDeepDiveContent] = useState<string | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);

  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [editBuffer, setEditBuffer] = useState<string>("");

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quotePaused, setQuotePaused] = useState(false);

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const ZENITH_REPORT_ID = '33UgmgBwGkSWAh1tRIFFvIypqcK2';

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(token => {
        if (token.claims.admin || isAdminUser(user)) {
          setIsAdmin(true);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  const canEdit = user?.uid === initialReport.userId || isAdmin;

  const reportRef = useMemoFirebase(() => {
    if (!initialReport?.id || !firestore) return null;
    return doc(firestore, 'users', initialReport.userId, 'reports', initialReport.id);
  }, [firestore, initialReport.userId, initialReport.id]);

  const sections = Object.keys(sectionHeadings) as SectionKey[];

  useEffect(() => {
    if (report.status !== 'generating' && report.status !== 'draft') return;
    if (quotePaused) return;
    // 9s per quote (up from 5s) so they can actually be read; hovering pauses.
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % businessQuotes.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [report.status, quotePaused]);

  useEffect(() => {
    if (report.status !== 'complete') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    const sectionIds = [...sections, 'scores', 'actions'];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [report.status, sections]);
  
  const handleGenerateSummary = async () => {
    if (!reportRef || !canEdit) return;
    setGeneratingSection('summary' as any);
    try {
      const result = await generateExecutiveSummary(report);
      const scrubbedSummary = scrubInternalBranding(result.summary);
      await updateDoc(reportRef, {
        executiveSummary: scrubbedSummary,
        updatedAt: new Date().toISOString(),
      });
      setReport(prev => ({ ...prev, executiveSummary: scrubbedSummary }));
      toast({ title: "Summary Ready", description: "The executive summary has been synthesized." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Generation Failed", description: error.message });
    } finally {
      setGeneratingSection(null);
    }
  };

  const handlePolishSection = async (sectionKey: SectionKey) => {
    if (!reportRef || !canEdit || !report.content[sectionKey]) return;
    
    const originalContent = report.content[sectionKey];
    setGeneratingSection(sectionKey);
    
    try {
      toast({ title: "Refining Section", description: `Sanitizing formatting for ${sectionHeadings[sectionKey]}...` });
      
      const result = await polishReportSection({
        companyName: report.companyName,
        sectionName: sectionHeadings[sectionKey],
        content: originalContent,
      });
      
      const polished = scrubInternalBranding(result.polishedContent.replace(completionMarkerRegex, '').trim());
      
      // Safety Check: 95% preservation threshold
      if (polished.length < (originalContent.length * 0.95)) {
        console.error("Polish attempt rejected: Potential content loss detected.");
        toast({ 
          variant: 'destructive', 
          title: "Polish Failed", 
          description: "Content preservation threshold not met. Strategic prose may have been truncated." 
        });
        return;
      }

      await updateDoc(reportRef, {
        [`content.${sectionKey}`]: polished,
        updatedAt: new Date().toISOString(),
      });
      
      setReport(prev => ({ ...prev, content: { ...prev.content, [sectionKey]: polished } }));
      toast({ title: "Section Polished", description: `${sectionHeadings[sectionKey]} polished and formatted.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Polish Failed", description: error.message });
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleSaveName = async () => {
    if (!reportRef || !canEdit || !tempName.trim()) return;
    try {
      await updateDoc(reportRef, {
        companyName: tempName.trim(),
        updatedAt: new Date().toISOString(),
      });
      setReport(prev => ({ ...prev, companyName: tempName.trim() }));
      setIsEditingName(false);
      toast({ title: "Company Name Updated" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    }
  };

  const handleSaveTagline = async () => {
    if (!reportRef || !canEdit) return;
    try {
      await updateDoc(reportRef, {
        tagline: tempTagline.trim(),
        updatedAt: new Date().toISOString(),
      });
      setReport(prev => ({ ...prev, tagline: tempTagline.trim() }));
      setIsEditingTagline(false);
      toast({ title: "Tagline Updated" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Update Failed", description: error.message });
    }
  };

  const handleRegenerateName = async () => {
    if (!reportRef || !canEdit) return;
    setGeneratingSection('branding' as any);
    try {
      const { companyName } = await generateNameAndTagline(report.description);
      await updateDoc(reportRef, {
        companyName: companyName,
        updatedAt: new Date().toISOString(),
      });
      setReport(prev => ({ ...prev, companyName: companyName }));
      setTempName(companyName);
      toast({ title: "Name Regenerated" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleRegenerateTagline = async () => {
    if (!reportRef || !canEdit) return;
    setGeneratingSection('branding' as any);
    try {
      const { tagline } = await generateNameAndTagline(report.description);
      await updateDoc(reportRef, {
        tagline: tagline,
        updatedAt: new Date().toISOString(),
      });
      setReport(prev => ({ ...prev, tagline: tagline }));
      setTempTagline(tagline);
      toast({ title: "Tagline Regenerated" });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleDeepDive = async (sectionKey: SectionKey, sectionTitle: string) => {
    if (!report.content[sectionKey]) return;
    setDeepDiveSection({ key: sectionKey, title: sectionTitle });
    setIsDeepDiveOpen(true);
    setIsDeepDiveLoading(true);
    setDeepDiveContent(null);
    try {
        const result = await deepDiveAnalysis({
            companyName: report.companyName,
            industry: report.industry,
            originalContent: report.content[sectionKey],
            sectionName: sectionTitle,
        });
        setDeepDiveContent(scrubInternalBranding(result.content));
    } catch (error: any) {
        setDeepDiveContent(`Analysis failed. Error: ${error.message}`);
    } finally {
        setIsDeepDiveLoading(false);
    }
  };

  const handleGenerateSection = async (sectionKey: SectionKey, currentContent: Report['content']): Promise<string | null> => {
    if (!reportRef || !canEdit) return null;
    setGeneratingSection(sectionKey);
    try {
      let content = await generateReportSection({
        companyDescription: report.description,
        sectionToGenerate: sectionHeadings[sectionKey],
        reportSoFar: JSON.stringify(currentContent),
        companyName: report.companyName,
        location: report.location,
        founderContext: formatFounderContext(report.founderProfile),
      });
      let isComplete = completionMarkerRegex.test(content);
      let attempts = 0;
      while (!isComplete && attempts < 3) {
        attempts++;
        const strippedContent = content.replace(completionMarkerRegex, '').trim();
        const continuation = await continueReportSection({
          companyDescription: report.description,
          sectionToGenerate: sectionHeadings[sectionKey],
          companyName: report.companyName,
          partialContent: strippedContent,
          founderContext: formatFounderContext(report.founderProfile),
        });
        content = strippedContent + '\n\n' + continuation;
        isComplete = completionMarkerRegex.test(content);
      }
      
      const scrubbedContent = scrubInternalBranding(content);
      
      await updateDoc(reportRef, {
        [`content.${sectionKey}`]: scrubbedContent,
        updatedAt: new Date().toISOString(),
      });
      setReport(prev => ({ ...prev, content: { ...prev.content, [sectionKey]: scrubbedContent }}));
      return scrubbedContent;
    } catch (error: any) {
      return null;
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateScores = async (fullReportContent: Report['content']): Promise<ReportScores | null> => {
    if (!reportRef || !canEdit) return null;
    setGeneratingSection('scores' as any);
    try {
        // The founder's own words drive the score; the generated report is context only.
        const scores = await generateScores(
          fullReportContent,
          report.description,
          formatFounderContext(report.founderProfile)
        );
        const scrubbedScores = {
          marketPotential: { score: scores.marketPotential.score, rationale: scrubInternalBranding(scores.marketPotential.rationale) },
          competitiveEdge: { score: scores.competitiveEdge.score, rationale: scrubInternalBranding(scores.competitiveEdge.rationale) },
          technicalFeasibility: { score: scores.technicalFeasibility.score, rationale: scrubInternalBranding(scores.technicalFeasibility.rationale) },
          financialViability: { score: scores.financialViability.score, rationale: scrubInternalBranding(scores.financialViability.rationale) },
        };
        await updateDoc(reportRef, { scores: scrubbedScores, updatedAt: new Date().toISOString() });
        setReport(prev => ({ ...prev, scores: scrubbedScores }));
        return scrubbedScores;
    } catch (error: any) {
        return null;
    } finally {
        setGeneratingSection(null);
    }
  };

  const handleManualEdit = (sectionKey: SectionKey) => {
    setEditingSection(sectionKey);
    setEditBuffer(report.content[sectionKey] || "");
  };

  const handleSaveManualEdit = async () => {
    if (!reportRef || !editingSection || !canEdit) return;
    try {
      await updateDoc(reportRef, {
        [`content.${editingSection}`]: editBuffer,
        updatedAt: new Date().toISOString()
      });
      setReport(prev => ({
        ...prev,
        content: { ...prev.content, [editingSection]: editBuffer }
      }));
      setEditingSection(null);
      toast({ title: "Section Updated", description: "Manual edits saved successfully." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Save Failed", description: error.message });
    }
  };

  const handleRestoreZenithPurpose = async () => {
    if (!reportRef || !canEdit) return;
    const zenithPurpose = `Zenith's core purpose is to empower the active, discerning 50+ demographic to authentically connect, explore the world, and enrich their post-career lives within a community built on unwavering trust. This vision directly addresses the significant digital void in a burgeoning "golden economy," providing a purpose-built ecosystem for individuals transitioning from "life builders" to "world explorers."

Zenith cultivates a vibrant, highly credible, and verified community where seasoned individuals can forge genuine connections through AI-driven compatibility matching, moving beyond superficial interactions to enable lasting social bonds. The platform serves as the definitive resource for 50+ travel planning, enabling seamless sharing of verified tips, photos, and insights through hyper-personalized recommendations tailored to the unique preferences of mature travelers - including pace, accessibility, and cultural immersion interests.

In an online landscape rife with bots, scams, and misinformation, Zenith's most critical purpose is to function as the verified nexus for the 50+. Through multi-layered identity authentication (Stripe Identity) and advanced AI-powered content moderation (Amazon Rekognition), Zenith creates a psychologically safe environment where members can share, correspond, and plan with genuine peace of mind. This commitment to trust is Zenith's primary competitive moat and a direct response to the disproportionate impact of online fraud on older adults.

Zenith's purpose is deeply intertwined with its "Trust-AI-Community Flywheel": a verified user base fuels greater engagement, which enhances AI personalization, thereby reinforcing trust and attracting more high-value members. This dynamic not only combats societal challenges like loneliness but also taps into a $108 billion SAM. By leveraging AI to reduce traditional R&D/Dev costs by 40% and maintaining a 60%+ operating profit margin, Zenith ensures that its mission is supported by a foundation of formidable financial viability and sustainable growth, aligning with Investment Intelligence's 90th-percentile industry benchmarks for operational efficiency and market impact.`;

    try {
      await updateDoc(reportRef, {
        'content.purpose': zenithPurpose,
        updatedAt: new Date().toISOString()
      });
      setReport(prev => ({
        ...prev,
        content: { ...prev.content, purpose: zenithPurpose }
      }));
      toast({ title: "Zenith Purpose Restored", description: "The strategic content has been surgically reintegrated." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Restoration Failed", description: error.message });
    }
  };

  const handleRevision = async (
    newDescription?: string, 
    sectionsToUpdate: SectionKey[] = [], 
    newCompanyName?: string, 
    newTagline?: string
  ) => {
    if (!reportRef || !canEdit) return;

    // Build update object
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };
    if (newDescription) updateData.description = newDescription;
    if (newCompanyName) updateData.companyName = newCompanyName;
    if (newTagline) updateData.tagline = newTagline;

    setReport(prev => {
      const newContent = { ...prev.content };
      sectionsToUpdate.forEach(key => { newContent[key] = ''; });
      return { 
        ...prev, 
        description: newDescription || prev.description,
        companyName: newCompanyName || prev.companyName,
        tagline: newTagline || prev.tagline,
        scores: sectionsToUpdate.length > 0 ? undefined : prev.scores,
        status: sectionsToUpdate.length > 0 ? 'generating' : prev.status,
        content: newContent 
      };
    });

    if (sectionsToUpdate.length > 0) {
      const updatedContent = { ...report.content };
      sectionsToUpdate.forEach(key => { updatedContent[key] = ''; });
      updateData.content = updatedContent;
      updateData.status = 'generating';
      updateData.scores = deleteField();
    }

    await updateDoc(reportRef, updateData);
    
    if (newCompanyName) setTempName(newCompanyName);
    if (newTagline) setTempTagline(newTagline);

    toast({ 
      title: "Strategic Revision Initiated", 
      description: sectionsToUpdate.length > 0 
        ? `Updating report context and refreshing ${sectionsToUpdate.length} sections...` 
        : "Report context updated." 
    });
  };

  useEffect(() => {
    const runAutomatedGeneration = async () => {
      if (!reportRef || !user || !canEdit || user.uid !== initialReport.userId) return;

      const newContent = { ...report.content };
      let hasFailed = false;
      const sectionsToGenerate = sections.filter(key => !report.content?.[key]?.trim());
      if (sectionsToGenerate.length > 0) {
        for (const sectionKey of sectionsToGenerate) {
            setActiveSection(sectionKey);
            setOpenItems(prev => [...new Set([...prev, sectionKey])]);
            const generatedContent = await handleGenerateSection(sectionKey, newContent); 
            if (generatedContent) { newContent[sectionKey] = generatedContent; } else { hasFailed = true; }
        }
      }
      const allSectionsDone = sections.every(key => !!newContent?.[key]?.trim());
      if (!hasFailed && allSectionsDone && !report.scores) {
        setActiveSection('scores');
        setOpenItems(prev => [...new Set([...prev, 'scores'])]);
        await handleGenerateScores(newContent); 
      }
      if (allSectionsDone) {
        await updateDoc(reportRef, { status: 'complete' });
        setReport(prev => ({...prev, status: 'complete'}));
      }
      setActiveSection(undefined);
    };
    if (report.status === 'draft' || report.status === 'generating') {
      runAutomatedGeneration();
    } else {
      setOpenItems([...sections, 'scores']);
    }
  }, [report?.id, report?.status, user?.uid, canEdit, initialReport.userId]);

  const isGenerating = report.status === 'generating' || report.status === 'draft' || generatingSection === 'polishing';
  const currentQuote = businessQuotes[currentQuoteIndex];

  return (
    <TooltipProvider>
      {activeModule === 'validation' && (
      <div className="report-print-container report-skin">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12 print:hidden flex flex-col items-center gap-8 min-h-[220px] justify-center">
            {isGenerating && (
              <div className="w-full max-w-2xl animate-fadeInUp">
                <div
                  className="glass-card p-6 text-center rounded-xl border-primary/20 bg-primary/5 shadow-glow transition-shadow"
                  onMouseEnter={() => setQuotePaused(true)}
                  onMouseLeave={() => setQuotePaused(false)}
                >
                  <p className="text-lg font-body text-white leading-relaxed">{currentQuote.text}</p>
                  <p className="text-sm text-muted-foreground mt-2">- {currentQuote.author}</p>
                  <div className="mt-6 flex items-center justify-center">
                    <ProcessingFlame
                      label={generatingSection && generatingSection !== 'polishing' ? progressMessages[generatingSection] : 'Orchestrating your validation'}
                      sublabel="Building your report section by section"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="w-full max-w-4xl px-4">
              <div className="flex flex-col items-center gap-6">
                {report.id === ZENITH_REPORT_ID && canEdit && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRestoreZenithPurpose}
                    className="mb-4 bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Restore Zenith Purpose
                  </Button>
                )}
                <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                  {isEditingName ? (
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-2xl">
                      <Input 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)}
                        className="text-2xl md:text-4xl font-bold font-headline h-14 bg-background/50 border-primary/30 flex-grow text-center"
                        placeholder="Company Name"
                      />
                      <div className="flex gap-2">
                        <Button size="icon" onClick={handleSaveName} className="bg-primary/20 hover:bg-primary/40 text-primary">
                          <Check className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setIsEditingName(false); setTempName(report.companyName); }}>
                          <CloseIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-normal break-words max-w-[90%] text-white report-section-header">
                        {scrubInternalBranding(report.companyName)}
                      </h1>
                      {canEdit && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 hover:bg-primary/20 transition-all h-9 font-bold" onClick={() => setIsEditingName(true)}>
                              <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 hover:bg-primary/20 transition-all h-9 font-bold" onClick={handleRegenerateName} disabled={generatingSection !== null}>
                              <RefreshCw className={cn("h-4 w-4 mr-2", generatingSection === 'branding' && "animate-spin")} /> Regenerate
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-4 w-full">
                    {isEditingTagline ? (
                      <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-2xl">
                        <Input 
                          value={tempTagline} 
                          onChange={(e) => setTempTagline(e.target.value)}
                          className="text-lg font-medium bg-background/50 border-primary/30 flex-grow text-center"
                          placeholder="Compelling Tagline"
                        />
                        <div className="flex gap-2">
                          <Button size="icon" onClick={handleSaveTagline} className="bg-primary/20 hover:bg-primary/40 text-primary">
                            <Check className="h-5 w-5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => { setIsEditingTagline(false); setTempTagline(report.tagline || ''); }}>
                            <CloseIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed break-words text-center">
                            {scrubInternalBranding(report.tagline || 'The Right Way to Start Up & Scale Your Innovations.')}
                        </p>
                        {canEdit && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 hover:bg-primary/20 transition-all h-9 font-bold" onClick={() => setIsEditingTagline(true)}>
                                <Edit2 className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full border-primary/20 bg-primary/5 hover:bg-primary/20 transition-all h-9 font-bold" onClick={handleRegenerateTagline} disabled={generatingSection !== null}>
                                <RefreshCw className={cn("h-4 w-4 mr-2", generatingSection === 'branding' && "animate-spin")} /> Regenerate
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
                {report.location && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                    <MapPin className="h-4 w-4" />
                    HQ: {report.location}
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3 lg:sticky top-20 self-start print:hidden">
              <Toc sections={sectionHeadings} activeSection={activeSection || ''} />
            </aside>
            <main className="lg:col-span-9">
              <GlowContainer>
                  <Accordion type="multiple" className="w-full space-y-4" onValueChange={setOpenItems} value={openItems}>
                      {sections.map((key, index) => (
                          <AccordionItem value={key} key={key} id={key} className="glass-card border-none rounded-lg scroll-mt-20">
                              <AccordionTrigger className="p-4 hover:no-underline bg-secondary/30 w-full">
                                  <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-4">
                                          <span className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary font-code font-bold">
                                          {String(index + 1).padStart(2, '0')}
                                          </span>
                                          <h2 className="text-xl font-bold font-headline text-white">{sectionHeadings[key]}</h2>
                                      </div>
                                  </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-6">
                                  {generatingSection === key ? (
                                      <div className="flex flex-col items-center justify-center min-h-[150px]">
                                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                          <p className="text-muted-foreground animate-pulse font-bold">
                                            {generatingSection as string === 'polishing' ? `Refining strategic visuals...` : progressMessages[key]}
                                          </p>
                                      </div>
                                  ) : editingSection === key ? (
                                      <div className="space-y-4">
                                        <Textarea 
                                          value={editBuffer} 
                                          onChange={(e) => setEditBuffer(e.target.value)}
                                          className="min-h-[300px] bg-background/50 font-body leading-relaxed"
                                          placeholder="Enter strategic content..."
                                        />
                                        <div className="flex gap-2">
                                          <Button onClick={handleSaveManualEdit} className="font-bold">
                                            <Check className="mr-2 h-4 w-4" /> Save Changes
                                          </Button>
                                          <Button variant="ghost" onClick={() => setEditingSection(null)}>
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                  ) : report.content?.[key] ? (
                                      <div className="space-y-6">
                                        <div className="markdown-content">
                                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                            {report.id === ZENITH_REPORT_ID && key === 'purpose' 
                                              ? report.content[key].replace(completionMarkerRegex, '').trim()
                                              : scrubInternalBranding(report.content[key].replace(completionMarkerRegex, '').trim())
                                            }
                                          </ReactMarkdown>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border/50 print:hidden">
                                          {canEdit && (
                                            <>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button 
                                                    variant="secondary" 
                                                    onClick={() => handlePolishSection(key)} 
                                                    className="font-bold"
                                                    disabled={generatingSection !== null}
                                                  >
                                                    {generatingSection === key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                                    Polish
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="glass-card">
                                                  <p>Cleanup formatting and fix typos without changing content.</p>
                                                </TooltipContent>
                                              </Tooltip>
                                              <Button variant="outline" onClick={() => handleGenerateSection(key, report.content)} className="font-bold">
                                                  <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                                              </Button>
                                              <Button variant="outline" onClick={() => handleManualEdit(key)} className="font-bold">
                                                  <Pencil className="mr-2 h-4 w-4" /> Manual Edit
                                              </Button>
                                            </>
                                          )}
                                          <Button variant="outline" onClick={() => handleDeepDive(key, sectionHeadings[key])} className="font-bold">
                                            <Search className="mr-2 h-4 w-4" /> Deep Dive
                                          </Button>
                                        </div>
                                      </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                      <div className="p-4 bg-primary/5 rounded-full mb-4">
                                        <Bot className="h-12 w-12 text-primary/20" />
                                      </div>
                                      <h3 className="text-lg font-bold font-headline mb-2">No Content Generated</h3>
                                      <p className="text-muted-foreground mb-6 max-w-sm">This section is currently empty. Trigger a generation or manually paste content to perform the validation analysis.</p>
                                      <div className="flex gap-3">
                                        <Button onClick={() => handleGenerateSection(key, report.content)} className="shadow-button-primary font-bold">
                                          <RefreshCw className="mr-2 h-4 w-4" /> Generate Section
                                        </Button>
                                        <Button variant="outline" onClick={() => handleManualEdit(key)} className="font-bold">
                                          <Pencil className="mr-2 h-4 w-4" /> Manual Entry
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                       <ScoringSection 
                          report={report}
                          isGenerating={generatingSection === 'scores'}
                          onGenerateScores={() => handleGenerateScores(report.content)}
                          onVisible={() => setActiveSection('scores')}
                          isAccordion={true}
                      />
                  </Accordion>
                  <div id="actions">
                    <ReportActions
                      report={report}
                      onGenerateSummary={handleGenerateSummary}
                      isGeneratingSummary={generatingSection === 'summary'}
                      onProceedToPrototyping={async () => {
                        try {
                          const metaRef = doc(firestore, 'users', report.userId, 'journey', 'meta');
                          await setDoc(metaRef, {
                            currentPhase: 'psf',
                            currentSubPhase: 'psf-a',
                            linkedReportId: report.id,
                            journeyStartedAt: new Date(),
                            companyName: report.companyName,
                            startupDescription: report.description,
                            reportScores: report.scores || {}
                          }, { merge: true });
                        } catch (error) {
                          console.warn('Could not save journey metadata before navigating to Problem-Solution Fit.', error);
                        } finally {
                          window.location.href = `/phases/psf?reportId=${encodeURIComponent(report.id)}`;
                        }
                      }}
                    />
                  </div>
              </GlowContainer>
            </main>
          </div>
        </div>
      </div>
      )}

      {activeModule === 'prototyping' && (
        <ProblemSolutionFit report={report} onNext={() => setActiveModule('pitchdeck')} />
      )}

      {activeModule === 'pitchdeck' && (
        <PitchDeck report={report} onBack={() => setActiveModule('prototyping')} />
      )}

      {activeModule === 'problem_solution_fit_extended' && <ProblemSolutionFitExtended Context={projectContext} />}
      {activeModule === 'product_market_fit' && <ProductMarketFit Context={projectContext} />}
      {activeModule === 'go_to_market_fit' && <GoToMarketFitView Context={projectContext} />}
      {activeModule === 'growth_scale' && <GrowthScaleView Context={projectContext} />}
      {activeModule === 'maturity_exit' && <MaturityExitView Context={projectContext} />}

      {activeModule === 'validation' && (
        <>
          <div className="fixed bottom-8 right-8 z-50 print:hidden flex flex-col items-end gap-3">
            <Button 
              onClick={() => setIsChatOpen(true)} 
              size="icon" 
              className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-glow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white/20"
            >
              <MessageSquare className="h-8 w-8" />
            </Button>
          </div>
          <ChatPanel open={isChatOpen} onOpenChange={setIsChatOpen} report={report} onRevision={handleRevision} />
          <DeepDiveSheet open={isDeepDiveOpen} onOpenChange={setIsDeepDiveOpen} section={deepDiveSection?.title || ''} isLoading={isDeepDiveLoading} content={deepDiveContent} />
        </>
      )}
    </TooltipProvider>
  );
}



const GoToMarketFitView = ({ Context }: { Context: any }) => (
  <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div className="p-4 bg-primary/5 rounded-full mb-4">
      <Bot className="h-12 w-12 text-primary/20" />
    </div>
    <h2 className="text-3xl font-bold font-headline text-white mb-2">Go-to-Market Fit</h2>
    <p className="text-muted-foreground mt-4 max-w-md">Phase 5 module is currently pending implementation. Check back soon.</p>
  </div>
);

const GrowthScaleView = ({ Context }: { Context: any }) => (
  <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div className="p-4 bg-primary/5 rounded-full mb-4">
      <Bot className="h-12 w-12 text-primary/20" />
    </div>
    <h2 className="text-3xl font-bold font-headline text-white mb-2">Growth & Scale</h2>
    <p className="text-muted-foreground mt-4 max-w-md">Phase 6 module is currently pending implementation. Check back soon.</p>
  </div>
);

const MaturityExitView = ({ Context }: { Context: any }) => (
  <div className="p-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
    <div className="p-4 bg-primary/5 rounded-full mb-4">
      <Bot className="h-12 w-12 text-primary/20" />
    </div>
    <h2 className="text-3xl font-bold font-headline text-white mb-2">Maturity & Exit</h2>
    <p className="text-muted-foreground mt-4 max-w-md">Phase 7 module is currently pending implementation. Check back soon.</p>
  </div>
);
