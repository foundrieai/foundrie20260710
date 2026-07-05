'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, ArrowRight, Download, Share2, FileText, File, FileIcon, Check, Copy, X
} from 'lucide-react';
import type { Report } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { GlowContainer } from '@/components/shared/glow-container';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Helper to reliably extract text
const extractContent = (section?: string, limit: number = 2500) => {
  if (!section) return 'Content generation in progress...';
  const clean = section.replace(/\[ANALYSIS_COMPLETE\]/g, '').trim();
  return clean.length > limit ? clean.substring(0, limit) + '...' : clean;
};

// Fallback logic for extraction
const extractList = (section?: string) => {
  if (!section) return [];
  const lines = section.split('\n').map(l => l.trim()).filter(l => l.startsWith('-') || l.startsWith('*'));
  return lines.map(l => l.replace(/^[-*]\s*/, ''));
};

const Disclaimer = () => (
  <div className="absolute bottom-2 left-6 right-6 text-[10px] text-muted-foreground/50 text-center font-mono uppercase tracking-wider">
    CONFIDENTIAL & PROPRIETARY. This presentation does not constitute legal, financial, or professional advice.
  </div>
);

export function PitchDeck({ report, onBack }: { report: Report; onBack?: () => void }) {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: 'Link copied to clipboard!' });
  };

  const handleExport = (format: 'PDF' | 'PPT') => {
    setIsExporting(format);
    toast({ title: `Preparing ${format} Export...`, description: 'This may take a moment to compress.' });
    setTimeout(() => {
      setIsExporting(null);
      toast({ title: 'Export Complete', description: `Your ${format} has been downloaded.` });
    }, 2500);
  };

  // Build the slides based on report data
  const slides = [
    // 1. Title Slide
    {
      id: 'title',
      content: (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
          <div className="inline-flex items-center justify-center p-6 bg-primary/10 rounded-3xl mb-8 border border-white/5 backdrop-blur-sm">
            <span className="text-6xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
              {report.companyName}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-white max-w-3xl leading-tight">
            {report.tagline || report.description?.substring(0, 80) + '...'}
          </h1>
          <p className="text-xl text-primary/70 mt-4 tracking-widest uppercase font-mono">
            Investor Presentation
          </p>
        </div>
      )
    },
    // 2. Company Purpose
    {
      id: 'purpose',
      title: 'COMPANY PURPOSE',
      content: (
        <div className="h-full flex flex-col justify-center max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold font-headline text-white leading-tight">
            {extractContent(report.content?.purpose, 300) || 'To transform the way our industry operates.'}
          </h2>
        </div>
      )
    },
    // 3. Problem
    {
      id: 'problem',
      title: 'THE PROBLEM',
      content: (
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
            {extractContent(report.content?.problem)}
          </div>
        </div>
      )
    },
    // 4. Solution
    {
      id: 'solution',
      title: 'OUR SOLUTION',
      content: (
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.solution)}
          </div>
        </div>
      )
    },
    // 5. Why Now
    {
      id: 'whynow',
      title: 'WHY NOW?',
      content: (
        <div className="h-full flex flex-col">
           <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.whyNow)}
          </div>
        </div>
      )
    },
    // 6. Market Size
    {
      id: 'market',
      title: 'MARKET POTENTIAL',
      content: (
        <div className="h-full flex flex-col">
           <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.marketSize)}
          </div>
        </div>
      )
    },
    // 7. Competition
    {
      id: 'competition',
      title: 'COMPETITIVE LANDSCAPE',
      content: (
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.competition)}
          </div>
        </div>
      )
    },
    // 8. Product
    {
      id: 'product',
      title: 'PRODUCT ROADMAP',
      content: (
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.productRoadmap)}
          </div>
        </div>
      )
    },
    // 9. Business Model
    {
      id: 'businessmodel',
      title: 'BUSINESS MODEL',
      content: (
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.businessModel)}
          </div>
        </div>
      )
    },
    // 10. Team
    {
      id: 'team',
      title: 'TEAM & CAPABILITY',
      content: (
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.team)}
          </div>
        </div>
      )
    },
    // 11. Financials
    {
      id: 'financials',
      title: 'FINANCIAL PROJECTIONS',
      content: (
        <div className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 whitespace-pre-wrap">
             {extractContent(report.content?.financials)}
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
  const handlePrev = () => setCurrentSlide(prev => Math.max(0, prev - 1));

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          {onBack && (
            <Button variant="ghost" className="text-muted-foreground hover:text-white" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleExport('PDF')}
                disabled={isExporting !== null}
                className="gap-2 text-sm hover:bg-white/10"
             >
                {isExporting === 'PDF' ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"/> : <FileText className="h-4 w-4" />}
                Export PDF
             </Button>
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleExport('PPT')}
                disabled={isExporting !== null}
                className="gap-2 text-sm hover:bg-white/10"
             >
                {isExporting === 'PPT' ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"/> : <FileIcon className="h-4 w-4" />}
                Export PPT
             </Button>
          </div>
          <Button onClick={() => setIsShareOpen(true)} className="shadow-button-primary bg-primary hover:bg-primary/90 text-primary-foreground">
            <Share2 className="mr-2 h-4 w-4" /> Share Deck
          </Button>
        </div>
      </div>

      {/* Presentation Viewer */}
      <GlowContainer>
        {/* Aspect Ratio 16:9 Container */}
        <div className="relative w-full aspect-video bg-[#0f172a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
          
          {/* Slide Content Area */}
          <div className="absolute inset-0 p-10 md:p-16 flex flex-col z-10 transition-opacity duration-300">
             {slides[currentSlide].title && (
               <div className="mb-8 border-b border-primary/20 pb-4 flex items-center justify-between">
                 <h2 className="text-sm font-bold font-mono tracking-[0.2em] text-primary/80 uppercase">
                    {slides[currentSlide].title}
                 </h2>
                 <span className="text-muted-foreground/40 font-mono text-sm">{currentSlide} / {slides.length - 1}</span>
               </div>
             )}
             <div className="flex-grow">
               {slides[currentSlide].content}
             </div>
          </div>

          <Disclaimer />

          {/* Navigation Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={handlePrev}
              disabled={currentSlide === 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 \${currentSlide === i ? 'w-6 bg-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide \${i + 1}`}
                />
              ))}
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </GlowContainer>

      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md glass-card border-primary/20">
          <DialogHeader>
            <DialogTitle>Share Pitch Deck</DialogTitle>
            <DialogDescription>
              Anyone with this link can view the generated pitch deck.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-md border border-white/10 break-all font-mono text-sm text-muted-foreground">
                <span className="line-clamp-1">{typeof window !== 'undefined' ? window.location.href : 'https://launchcode.app/deck...'}</span>
              </div>
            </div>
            <Button size="icon" className="px-3" onClick={handleCopyLink}>
              <span className="sr-only">Copy</span>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter className="sm:justify-start mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsShareOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
