'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal, ExternalLink, Code2, ArrowRight } from 'lucide-react';
import type { Report } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function ProblemSolutionFit({ report, onNext }: { report: Report; onNext?: () => void }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Safely extract content with fallbacks
  const extractContent = (section?: string, limit: number = 800) => {
    if (!section) return '';
    const clean = section.replace(/\[ANALYSIS_COMPLETE\]/g, '').trim();
    return clean.length > limit ? clean.substring(0, limit) + '...' : clean;
  };

  const problem = extractContent(report.content?.problem) || 'Significant operational inefficiencies and unmet customer needs in this target market.';
  const solution = extractContent(report.content?.solution) || 'A modern, AI-native platform designed to automate workflows and provide deep, actionable insights.';
  const marketSize = extractContent(report.content?.marketSize, 400) || 'A rapidly growing sector with high willingness-to-pay for premium B2B tooling.';

  const geniusPrompt = `You are a Principal 10x Engineer, world-class UX/UI designer, and B2B SaaS Architect. 
Your task is to "vibe-code" a sophisticated, high-fidelity prototype for a new venture.

=========================================
VENTURE CONTEXT
=========================================
**App Name:** ${report.companyName}
**Elevator Pitch:** ${report.tagline || report.description}

**The Problem Space:**
${problem}

**The Solution:**
${solution}

**Target Market & Value:**
${marketSize}

=========================================
PROTOTYPE REQUIREMENTS
=========================================
1. **Design System:** Use Tailwind CSS. Default to a premium, modern aesthetic appropriate for B2B SaaS. Use high-contrast layouts (slate/zinc colors, subtle gradients, and glassmorphism elements where appropriate).
2. **Framework:** Produce a single-file React component (Next.js App Router compatible) using \`lucide-react\` for icons and modern Radix-style UI primitives via local state.
3. **Interactivity:** Simulate the core "aha!" moment of the product. Fill the UI with realistic mock data to demonstrate value instantly. Do not use generic placeholders like "John Doe" or "Test Data".
4. **Layout:** Include a sidebar or top navigation, a command-center dashboard grid, and at least one complex interactive element (e.g., a data table, chart placeholder, or kanban board).
5. **Code Quality:** Ensure the code is robust, handles responsive states (mobile vs desktop), and is fully functional as a drop-in component. 

Build the absolute best version of this product. Do not skip any details. Return ONLY the code in a single, copy-pasteable block.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(geniusPrompt);
    setCopied(true);
    toast({ title: "Prompt Copied!", description: "Paste this into Google AI Studio to vibe-code your prototype." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeInUp w-full max-w-5xl mx-auto py-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Terminal className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-white">
          Prototyping Engine
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          We've compiled your strategic validation into a "genius-level" system prompt. Ready for vibe-coding.
        </p>
      </div>

      <div className="glass-card mt-12 p-1 overflow-hidden group border-primary/20">
        <div className="bg-black/40 rounded-lg p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <span className="font-code text-sm font-semibold text-primary/80">system_prompt.md</span>
            </div>
            <Button size="sm" onClick={handleCopy} className="shadow-button-primary bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy Prompt"}
            </Button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[500px] font-code text-sm leading-relaxed text-slate-300 custom-scrollbar">
            <pre className="whitespace-pre-wrap">{geniusPrompt}</pre>
          </div>
        </div>
      </div>

      <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button asChild size="lg" variant="outline" className="h-16 px-8 text-lg font-bold">
          <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">
            Open Google AI Studio <ExternalLink className="ml-2 h-5 w-5" />
          </a>
        </Button>
        <Button onClick={() => window.location.href = `/phases/psf?reportId=${encodeURIComponent(report.id)}`} size="lg" className="h-16 px-12 text-lg font-bold shadow-button-primary">
          Proceed to Problem-Solution Fit <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {onNext && (
          <Button onClick={onNext} size="lg" variant="secondary" className="h-16 px-12 text-lg font-bold">
            View Pitch Deck
          </Button>
        )}
      </div>
    </div>
  );
}
