'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Loader2, Pencil, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReportSectionCardProps {
  sectionId: string;
  number: number;
  title: string;
  content: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onDeepDive: () => void;
  onVisible: () => void;
  onManualEdit?: () => void;
  onPolish?: () => void;
  canEdit?: boolean;
}

export function ReportSectionCard({ 
  sectionId, 
  number, 
  title, 
  content, 
  isGenerating, 
  onGenerate, 
  onDeepDive, 
  onVisible,
  onManualEdit,
  onPolish,
  canEdit
}: ReportSectionCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
        }
      },
      {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, onVisible]);
  
  const hasContent = content && content.trim() !== '';

  return (
    <TooltipProvider>
      <Card id={sectionId} ref={ref} className="glass-card section-animate overflow-hidden">
        <CardHeader className="bg-secondary/50 border-b border-border p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary font-code font-bold">
                {String(number).padStart(2, '0')}
              </span>
              <h2 className="text-xl font-bold font-headline">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {hasContent && (
                <>
                  {canEdit && onPolish && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={onPolish}
                          disabled={isGenerating}
                          className="bg-accent/10 border-accent/20 text-accent hover:bg-accent/20"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Polish
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cleanup formatting and fix typos without changing content.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Button variant="outline" size="sm" onClick={onDeepDive}>
                    <Search className="mr-2 h-4 w-4" />
                    Deep Dive
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 min-h-[150px] flex flex-col items-center justify-center">
          {isGenerating ? (
              <div className="text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary"/>
                  <p>Orchestrating insights...</p>
              </div>
          ) : hasContent ? (
              <div className="markdown-content w-full">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                {canEdit && (
                  <div className="flex gap-2 mt-6 pt-6 border-t border-white/10 print:hidden">
                    <Button variant="outline" size="sm" onClick={onGenerate}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                    </Button>
                    {onManualEdit && (
                      <Button variant="outline" size="sm" onClick={onManualEdit}>
                        <Pencil className="mr-2 h-4 w-4" /> Manual Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
          ) : (
              <div className="text-center">
                  <p className="text-muted-foreground mb-4">This section has not been generated yet.</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={onGenerate}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Section
                    </Button>
                    {canEdit && onManualEdit && (
                      <Button variant="outline" onClick={onManualEdit}>
                        <Pencil className="mr-2 h-4 w-4" /> Manual Entry
                      </Button>
                    )}
                  </div>
              </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
