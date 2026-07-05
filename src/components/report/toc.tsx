'use client';

import { cn } from "@/lib/utils"
import { Card } from "../ui/card";

interface TocProps {
  sections: Record<string, string>;
  activeSection: string;
}

export function Toc({ sections, activeSection }: TocProps) {
  const allSections = { 
    ...sections, 
    scores: 'Overall Validation Score',
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80; // Account for sticky header
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Card className="p-4 glass-card hidden lg:block">
      <h3 className="font-bold font-headline mb-4 px-2">Table of Contents</h3>
      <ul className="space-y-1 text-sm">
        {Object.entries(allSections).map(([key, title]) => (
          <li key={key}>
            <button
              onClick={() => scrollTo(key)}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-md transition-all duration-200",
                activeSection === key
                  ? "bg-primary/10 text-primary font-bold translate-x-1"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {title}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
