'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Idea } from '@/lib/types';
import type { FounderProfile } from '@/ai/flows/generate-ideation-concepts';
import { stashFounderProfile } from '@/lib/founder-context';
import { Bookmark, Star } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  /** Carried into Validation so the report analyses the real founding team. */
  founderProfile?: FounderProfile | null;
  /** When provided, the card is controlled by the parent (persistent bookmarks). */
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function IdeaCard({ idea: initialIdea, founderProfile, isBookmarked, onToggleBookmark }: IdeaCardProps) {
  const router = useRouter();
  const [idea, setIdea] = useState(initialIdea);

  const controlled = typeof onToggleBookmark === 'function';
  const bookmarked = controlled ? !!isBookmarked : idea.isBookmarked;

  const toggleBookmark = () => {
    if (controlled) {
      onToggleBookmark!();
    } else {
      setIdea(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    }
  };

  const handleValidate = () => {
    // The profile is too large for a query string, so it travels in
    // sessionStorage and the report picks it up on creation.
    if (founderProfile) stashFounderProfile(founderProfile);
    const params = new URLSearchParams();
    params.set('companyName', idea.title);
    params.set('description', `${idea.tagline}\n\nProblem: ${idea.problem}\n\nSolution: ${idea.solution}`);
    params.set('targetMarket', idea.targetMarket);
    // You could set other default fields if needed, like industry or stage
    router.push(`/new?${params.toString()}`);
  };

  return (
    <Card className="glass-card p-6 md:p-8 flex flex-col space-y-4 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleBookmark}
        className="absolute top-6 right-6 hover:bg-transparent"
      >
        <Bookmark
          className={`h-6 w-6 transition-colors ${bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
        />
      </Button>

      <div>
        <h3 className="text-2xl font-bold font-headline pr-8">{idea.title}</h3>
        <p className="text-lg text-primary mt-1 font-medium">{idea.tagline}</p>
      </div>
      
      <div className="flex space-x-6 mt-2 pb-2">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-[#ffc400] fill-[#ffc400]/20" />
          <span className="text-sm font-medium">Market Potential: <span className="font-bold">{idea.marketPotentialScore}/10</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-[#ff7a00] fill-[#ff7a00]/20" />
          <span className="text-sm font-medium">Financial Viability: <span className="font-bold">{idea.financialViabilityScore}/10</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <h4 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">The Problem</h4>
          <p className="text-sm">{idea.problem}</p>
        </div>
        <div>
          <h4 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">The Solution</h4>
          <p className="text-sm">{idea.solution}</p>
        </div>
        <div>
           <h4 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">Target Market</h4>
           <p className="text-sm">{idea.targetMarket}</p>
        </div>
        <div>
           <h4 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">Revenue Model</h4>
           <p className="text-sm">{idea.revenueModel}</p>
        </div>
        <div className="md:col-span-2">
           <h4 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">Competitive Edge</h4>
           <p className="text-sm">{idea.competitiveEdge}</p>
        </div>
        <div className="bg-background/50 p-4 border-l-2 border-primary rounded-r">
           <h4 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">VC Angle</h4>
           <p className="text-sm">{idea.vcAngle}</p>
        </div>
        <div className="bg-background/50 p-4 border-l-2 border-primary rounded-r">
           <h4 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider mb-2">PE Angle</h4>
           <p className="text-sm">{idea.peAngle}</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end mt-auto">
        <Button onClick={handleValidate} className="shadow-button-primary hover:shadow-button-primary-hover">
          Validate This Idea
        </Button>
      </div>
    </Card>
  );
}
