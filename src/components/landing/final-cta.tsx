'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export const FinalCta = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="container text-center">
        <h2 className="text-4xl md:text-6xl font-bold font-headline mb-8 tracking-tight">
          Stop Guessing.<br /><span className="text-primary">Start Up Right.</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Start your validation report today and scale your innovation with confidence.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" asChild className="h-14 px-10 text-lg shadow-button-primary hover:shadow-button-primary-hover">
            <Link href="/ideation">
              Start with Ideation
              <span className="ml-2 font-bold text-xl">{">"}</span>
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-14 px-10 text-lg">
            <Link href="/new">Validate an Existing Idea</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
