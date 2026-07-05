'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreRing } from './score-ring';
import type { Report, SectionKey } from '@/lib/types';
import { Gem, Sparkles, Loader2, Lock, RefreshCw } from 'lucide-react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { scoreCategories, sectionHeadings } from '@/lib/report-helpers';

type ScoringSectionProps = {
  report: Report;
  isGenerating: boolean;
  error?: string;
  onGenerateScores: () => void;
  onVisible?: () => void;
  isAccordion?: boolean;
};

const ScoreInterpretationGuide = () => (
    <div className="mt-6 space-y-2 text-sm">
        <h4 className="font-bold font-headline text-lg">Score Interpretation Guide</h4>
        <div className="flex items-center"><Badge className="bg-[#ffc400]/15 text-[#ffc400] mr-2">8.0 - 10.0</Badge><span>Exceptional opportunity - strong fundamentals</span></div>
        <div className="flex items-center"><Badge className="bg-[#ff3000]/100/20 text-[#ff7a00] mr-2">6.5 - 7.9</Badge><span>Promising venture - solid foundation with addressable gaps</span></div>
        <div className="flex items-center"><Badge className="bg-yellow-500/20 text-yellow-300 mr-2">5.0 - 6.4</Badge><span>Moderate potential - significant challenges require attention</span></div>
        <div className="flex items-center"><Badge className="bg-red-500/20 text-red-300 mr-2">Below 5.0</Badge><span>High risk - fundamental concerns need resolution</span></div>
    </div>
);

/**
 * Reusable component for the inner content of the scoring section.
 */
export function ScoringDetailsContent({ report, isGenerating, error, onGenerateScores }: {
    report: Report;
    isGenerating: boolean;
    error?: string;
    onGenerateScores: () => void;
}) {
    const { scores } = report;
    const scoresGenerated = scores && scores.marketPotential.score > 0;
    const sections = Object.keys(sectionHeadings) as SectionKey[];
    const allSectionsGenerated = sections.every(key => !!report.content?.[key]?.trim());

    const weightedScores = scoresGenerated ? {
        marketPotential: scores.marketPotential.score * (scoreCategories.marketPotential.weight / 100),
        competitiveEdge: scores.competitiveEdge.score * (scoreCategories.competitiveEdge.weight / 100),
        technicalFeasibility: scores.technicalFeasibility.score * (scoreCategories.technicalFeasibility.weight / 100),
        financialViability: scores.financialViability.score * (scoreCategories.financialViability.weight / 100),
    } : null;

    const overallScore = weightedScores ? Object.values(weightedScores).reduce((acc, score) => acc + score, 0) : 0;

    return (
        <div className="p-6 min-h-[400px] flex flex-col items-center justify-center">
            {isGenerating ? (
                <div className="text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary"/>
                    <p>Calculating final scores...</p>
                </div>
            ) : scoresGenerated && weightedScores ? (
                <div className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-center">
                        {Object.entries(scores).map(([key, value]) => (
                            <div key={key} className="flex flex-col items-center">
                                <ScoreRing score={value.score} />
                                <h3 className="font-bold text-lg mt-3">{scoreCategories[key as keyof typeof scores].label}</h3>
                                <p className="text-muted-foreground text-sm">{scoreCategories[key as keyof typeof scores].weight}% Weight</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between rounded-lg bg-secondary p-6">
                        <div>
                            <h3 className="text-muted-foreground">Overall Score</h3>
                            <p className="text-5xl font-bold font-code text-primary">{overallScore.toFixed(1)} / 10</p>
                        </div>
                        <ScoreInterpretationGuide />
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-bold font-headline mb-4">Scoring Rationale</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Weighted</TableHead>
                                    <TableHead>Rationale</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(scores).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium">{scoreCategories[key as keyof typeof scores].label}</TableCell>
                                        <TableCell className="text-center font-code">{value.score.toFixed(1)}</TableCell>
                                        <TableCell className="text-center font-code">{weightedScores[key as keyof typeof weightedScores].toFixed(2)}</TableCell>
                                        <TableCell className="text-muted-foreground">{value.rationale}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    {error ? (
                        <>
                            <p className="text-destructive mb-4 text-center">Failed to generate scores: {error}</p>
                            <Button variant="outline" onClick={onGenerateScores}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry Scoring
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-muted-foreground mb-4">
                                {allSectionsGenerated
                                    ? 'All report sections are generated. Waiting for scoring...'
                                    : 'Waiting for all 14 report sections to be generated...'
                                }
                            </p>
                            <Button onClick={onGenerateScores} disabled={!allSectionsGenerated}>
                                {allSectionsGenerated ? (
                                    <Sparkles className="mr-2 h-4 w-4" />
                                ) : (
                                    <Lock className="mr-2 h-4 w-4" />
                                )}
                                Generate Scores
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export function ScoringSection({ report, isGenerating, error, onGenerateScores, onVisible, isAccordion }: ScoringSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scores } = report;

  useEffect(() => {
    if (!onVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current) };
  }, [ref, onVisible]);

  const scoresGenerated = scores && scores.marketPotential.score > 0;

  const headerContent = (
    <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
            <span className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/20 text-primary">
                <Gem />
            </span>
            <CardTitle className="text-2xl font-bold font-headline">Overall Validation Score</CardTitle>
        </div>
        {(scoresGenerated || error) && (
            <Button
                variant="ghost"
                size="icon"
                className="mr-4 hover:bg-primary/20"
                onClick={(e) => {
                    e.stopPropagation();
                    onGenerateScores();
                }}
                disabled={isGenerating}
                aria-label="Regenerate Scores"
                asChild
            >
                <span><RefreshCw className="h-5 w-5" /></span>
            </Button>
        )}
    </div>
  );

  if (isAccordion) {
    return (
        <AccordionItem value="scores" ref={ref} id="scores" className="glass-card border-2 border-primary/20 rounded-lg scroll-mt-20">
            <AccordionTrigger className="p-4 hover:no-underline bg-primary/10">
                {headerContent}
            </AccordionTrigger>
            <AccordionContent>
                <ScoringDetailsContent 
                    report={report} 
                    isGenerating={isGenerating} 
                    error={error} 
                    onGenerateScores={onGenerateScores} 
                />
            </AccordionContent>
        </AccordionItem>
    )
  }

  return (
    <Card id="scores" ref={ref} className="glass-card section-animate overflow-hidden border-2 border-primary/20 scroll-mt-20">
      <CardHeader className="bg-primary/10 border-b border-primary/20 p-4">
        {headerContent}
      </CardHeader>
      <CardContent className="p-6">
        <ScoringDetailsContent 
            report={report} 
            isGenerating={isGenerating} 
            error={error} 
            onGenerateScores={onGenerateScores} 
        />
      </CardContent>
    </Card>
  );
}
