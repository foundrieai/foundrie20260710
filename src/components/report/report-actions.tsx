'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileDown, Sparkles, Presentation, FileText, Loader2, Share2, Wand2, Copy, Check, Mail } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Report } from '@/lib/types';
import { sectionHeadings } from '@/lib/report-helpers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generatePitchDeckContent } from '@/ai/flows/generate-pitch-deck-content';
import { saveAs } from 'file-saver';

interface ReportActionsProps {
  report: Report;
  onGenerateSummary: () => void;
  onPolishReport: () => void;
  isGeneratingSummary: boolean;
  isPolishing: boolean;
  onProceedToPrototyping?: () => void;
}

const markdownComponents = {
  p: ({...props}: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4 last:mb-0" {...props} />,
  ul: ({...props}: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-outside mb-4 ml-6 space-y-1" {...props} />,
  ol: ({...props}: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-outside mb-4 ml-6 space-y-1" {...props} />,
  li: ({...props}: React.HTMLAttributes<HTMLLIElement>) => <li className="mb-1" {...props} />,
};

const WHITELABEL_REGEX = /IDEAIT|IDEAMAIT|LAUNCHCODE/gi;

/**
 * Utility to scrub internal branding from content strings.
 */
function scrubContent(text: string): { scrubbed: string; wasModified: boolean } {
  if (!text) return { scrubbed: '', wasModified: false };
  const wasModified = WHITELABEL_REGEX.test(text);
  const scrubbed = text.replace(WHITELABEL_REGEX, (match) => {
    const m = match.toLowerCase();
    if (m === 'launchcode') return 'The Platform';
    return 'Investment Intelligence';
  });
  return { scrubbed, wasModified };
}

function ShareDialog({ open, onOpenChange, report }: { open: boolean; onOpenChange: (open: boolean) => void; report: Report }) {
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(!!report.isShared);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const isOwner = !!user && user.uid === report.userId;
  const shareUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';

  useEffect(() => { setEnabled(!!report.isShared); }, [report.isShared]);

  const toggleShare = async (next: boolean) => {
    if (!firestore || !isOwner) return;
    setBusy(true);
    try {
      await updateDoc(doc(firestore, 'users', report.userId, 'reports', report.id), { isShared: next });
      setEnabled(next);
      toast({
        title: next ? 'Sharing enabled' : 'Sharing disabled',
        description: next
          ? 'Anyone with the link can now view this report.'
          : 'The link no longer works. Only you can view this report.',
      });
    } catch {
      toast({ variant: 'destructive', title: 'Could not update sharing', description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: 'Link Copied', description: 'Shareable report link copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = `Investment Validation: ${report.companyName}`;
    const body = `I'm sharing this startup validation report for ${report.companyName}. View it here: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline">Share Report</DialogTitle>
          <DialogDescription>Your report is private by default. Enable an unlisted link to share it.</DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="pr-4">
              <p className="text-sm font-semibold text-foreground">Anyone with the link can view</p>
              <p className="text-xs text-muted-foreground">Turn off at any time to revoke access.</p>
            </div>
            <Switch checked={enabled} disabled={busy} onCheckedChange={toggleShare} aria-label="Enable share link" />
          </div>
        )}

        {enabled ? (
          <>
            <div className="flex items-center space-x-2 pt-2">
              <Input id="link" value={shareUrl} readOnly className="bg-background/20" />
              <Button size="icon" onClick={handleCopy} className="shadow-button-primary">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="outline" className="w-full justify-start h-12" onClick={shareViaEmail}>
              <Mail className="mr-3 h-5 w-5 text-primary" /> Share via Email
            </Button>
          </>
        ) : (
          <p className="py-2 text-sm text-muted-foreground">
            {isOwner ? 'Turn on the switch above to generate a shareable link.' : 'This report is private.'}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ReportActions({ 
  report, 
  onGenerateSummary, 
  onPolishReport,
  isGeneratingSummary,
  isPolishing,
  onProceedToPrototyping
}: ReportActionsProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExportWord = async () => {
    setIsExportingWord(true);
    toast({ title: "Generating Professional Word Document", description: "Compiling strategic analysis..." });
    
    try {
      // Load the heavy docx library only when the user actually exports.
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Footer, BorderStyle } = await import('docx');
      const children = [];

      // 1. Header Logic (Mocking image fetch for CDATA brevity, usually would fetch base64)
      children.push(new Paragraph({
        text: report.companyName.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 }
      }));
      
      children.push(new Paragraph({
        text: scrubContent(report.tagline || "").scrubbed || "Investment Validation Analysis",
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 }
      }));

      children.push(new Paragraph({ 
        children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString()}`, italics: true })],
        spacing: { after: 240 }
      }));

      // 2. Executive Summary
      if (report.executiveSummary) {
        children.push(new Paragraph({ text: "EXECUTIVE SUMMARY", heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
        children.push(new Paragraph({ text: scrubContent(report.executiveSummary.replace(/^#?\s*Executive Summary:?\s*/i, '')).scrubbed, spacing: { after: 240 } }));
      }

      // 3. Sections
      Object.entries(sectionHeadings).forEach(([key, title]) => {
        const rawContent = (report.content as any)[key];
        if (rawContent) {
          children.push(new Paragraph({ text: title.toUpperCase(), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }));
          const scrubbed = scrubContent(rawContent.replace(/\[ANALYSIS_COMPLETE\]/g, "").trim()).scrubbed;
          
          // Basic split by newline for paragraphs
          scrubbed.split('\n').forEach(p => {
            if (p.trim()) {
              children.push(new Paragraph({ text: p.trim(), spacing: { after: 120 } }));
            }
          });
        }
      });

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: "Arial", size: "11pt" },
            }
          }
        },
        sections: [{ 
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  border: { top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 4 } },
                  children: [
                    new TextRun({ 
                      text: "DISCLAIMER: This report is for informational purposes only. Investment Intelligence provides strategic validation tools, not financial advice.",
                      size: "8pt",
                      color: "666666"
                    })
                  ]
                })
              ]
            })
          },
          children 
        }],
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${report.companyName.replace(/\s+/g, '_')}_Validation.docx`);
      toast({ title: "Word Export Complete", description: "Your document is ready." });
    } catch (err) {
      console.error("Word Export Error:", err);
      toast({ variant: "destructive", title: "Export Failed", description: "Could not generate Word document." });
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleGeneratePitchDeck = async () => {
    setIsGeneratingDeck(true);
    toast({ 
      title: "Venture Deck Engine", 
      description: "Distilling strategic framework into a 12-slide investor deck...",
    });
    
    try {
        const distilledContent = await generatePitchDeckContent(report);
        
        if (!distilledContent || Object.keys(distilledContent).length === 0) {
          throw new Error("AI failed to distill pitch deck content.");
        }

        // Load the heavy pptxgenjs library only when generating the deck.
        const pptxgen = (await import('pptxgenjs')).default;
        const pptx = new pptxgen();
        pptx.layout = 'LAYOUT_16x9';
        pptx.author = 'Senior VC Analyst';
        pptx.company = report.companyName;

        const ACCENT_BLUE = "3B82F6"; 
        const DARK_BG = "000000";     
        const WHITE_TEXT = "FFFFFF";   

        // 1. Title Slide
        let titleSlide = pptx.addSlide();
        titleSlide.background = { color: DARK_BG };
        
        titleSlide.addShape('rect', { 
          x: 0, y: 0, w: '100%', h: 0.1, 
          fill: { color: ACCENT_BLUE } 
        });

        titleSlide.addText(report.companyName.toUpperCase(), { 
            x: 0.5, y: 2.0, w: '90%', 
            fontSize: 54, color: WHITE_TEXT, 
            bold: true, fontFace: 'Arial',
            align: 'center'
        });

        titleSlide.addText(scrubContent(report.tagline || "").scrubbed || "Investment Validation Analysis", { 
            x: 0.5, y: 3.2, w: '90%', 
            fontSize: 24, color: ACCENT_BLUE, 
            italic: true, fontFace: 'Arial',
            align: 'center'
        });

        const slideKeys = [
          'purpose', 'problem', 'solution', 'whyNow', 'marketSize', 
          'competition', 'product', 'businessModel', 'traction', 
          'team', 'financials', 'vision'
        ];

        slideKeys.forEach((key, index) => {
            const data = (distilledContent as any)[key];
            if (data) {
                let slide = pptx.addSlide();
                slide.background = { color: DARK_BG };
                
                const scrubbedTitle = scrubContent(data.title).scrubbed;
                const scrubbedBullets = data.bullets.map((b: string) => scrubContent(b).scrubbed);

                slide.addText(scrubbedTitle.toUpperCase(), { 
                  x: 0.5, y: 0.4, w: '90%', 
                  fontSize: 32, color: ACCENT_BLUE, 
                  bold: true, fontFace: 'Arial' 
                });

                slide.addShape('rect', { 
                  x: 0.5, y: 1.0, w: 2.0, h: 0.05, 
                  fill: { color: ACCENT_BLUE } 
                });
                
                slide.addText(scrubbedBullets.join('\n'), { 
                    x: 0.5, y: 1.6, w: '90%', h: '65%', 
                    fontSize: 20, color: WHITE_TEXT, 
                    bullet: { type: 'bullet' }, 
                    valign: 'top', fontFace: 'Arial',
                    lineSpacing: 32,
                    paraSpaceBefore: 10
                });
            }
        });

        await pptx.writeFile({ fileName: `${report.companyName.replace(/\s+/g, '_')}_Pitch_Deck.pptx` });
        toast({ title: "Deck Exported!", description: "12-slide high-fidelity deck is ready." });
    } catch (err) {
        console.error("PPTX Export Error:", err);
        toast({ variant: 'destructive', title: "Export Failed", description: "Could not generate full pitch deck." });
    } finally {
        setIsGeneratingDeck(false);
    }
  };

  if (!isClient) return null;

  return (
    <>
      <Card className="glass-card border-primary/20 mt-12 mb-24 print:hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
          <CardTitle className="text-2xl font-bold font-headline text-white">Founder-readiness toolkit</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {report.executiveSummary && (
            <div className="bg-secondary/20 p-8 rounded-lg border border-border/50 animate-fadeInUp">
              <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6 text-white">
                Executive Summary
              </h2>
              <div className="markdown-content executive-summary-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {scrubContent(report.executiveSummary).scrubbed.replace(/^#?\s*Executive Summary:?\s*/i, '')}
                </ReactMarkdown>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 w-full">
            <Button 
              size="lg" 
              onClick={onPolishReport} 
              disabled={isPolishing || report.status !== 'complete'} 
              className="flex-grow min-w-[200px] h-16 text-base font-bold bg-accent hover:bg-accent/80 text-accent-foreground shadow-button-primary"
            >
              {isPolishing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
              Polish Report
            </Button>
            <Button size="lg" onClick={onGenerateSummary} disabled={isGeneratingSummary || report.status !== 'complete'} className="flex-grow min-w-[200px] h-16 text-base font-bold">
              {isGeneratingSummary ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {report.executiveSummary ? "Refresh Summary" : "Generate Summary"}
            </Button>
            <Button variant="outline" size="lg" onClick={handleExportWord} disabled={isExportingWord || report.status !== 'complete'} className="flex-grow min-w-[200px] h-16 text-base font-bold">
              {isExportingWord ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileText className="mr-2 h-5 w-5" />}
              Export to Word
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="flex-grow min-w-[200px] h-16 text-base font-bold">
                  {isGeneratingDeck ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Presentation className="mr-2 h-5 w-5" />}
                  Export Slides/PDF
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card w-56">
                <DropdownMenuItem className="cursor-pointer py-3" onSelect={() => window.print()}>
                  <FileText className="mr-2 h-4 w-4" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-3" onSelect={handleGeneratePitchDeck} disabled={isGeneratingDeck}>
                  <Presentation className="mr-2 h-4 w-4" /> Pitch Deck (.pptx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="lg" onClick={() => setIsShareOpen(true)} className="flex-grow min-w-[200px] h-16 text-base font-bold">
              <Share2 className="mr-2 h-5 w-5" /> Share
            </Button>
          </div>
          <div className="w-full mt-4 flex flex-col gap-4">
            <Button 
              size="lg" 
              onClick={onProceedToPrototyping}
              className="w-full h-16 text-lg font-bold shadow-button-primary"
            >
              Initiate Problem-Solution Fit phase
            </Button>
          </div>
        </CardContent>
      </Card>
      <ShareDialog open={isShareOpen} onOpenChange={setIsShareOpen} report={report} />
    </>
  );
}
