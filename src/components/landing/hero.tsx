'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="container relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-fadeInUp">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          The New Standard For Founders
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tight mb-6 animate-fadeInUp text-white">
          The Right Way To Start Up & <span className="text-primary">Scale Your Innovations.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          Start up right -use AI-powered expert analysis to validate your idea, find your market, and prepare to scale your business in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <Button size="lg" asChild className="h-12 px-8 shadow-button-primary hover:shadow-button-primary-hover text-base font-bold">
            <Link href="/ideation">
              Find a Startup Idea
              <span className="ml-2 font-bold text-xl">{">"}</span>
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base font-bold">
            <Link href="/new">
              Validate My Idea
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-3xl -z-10 opacity-50" />
        <div className="glass-card rounded-xl p-2 border-white/20 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto rounded-lg shadow-2xl"
          >
            <source src="https://videos.files.wordpress.com/Ws1g0tw0/video-5.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};
