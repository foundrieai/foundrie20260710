'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export type FaqItem = { q: string; a: string };

const MOLTEN = 'linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)';

export function FaqSection({
  eyebrow = 'Frequently Asked Questions',
  heading = 'Questions, answered.',
  subheading,
  items,
  className,
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  items: FaqItem[];
  className?: string;
}) {
  return (
    <section className={cn('border-t border-white/10 bg-[#08070c] py-20 md:py-28', className)}>
      <div className="container max-w-3xl">
        <div className="mb-10 text-center md:mb-12">
          <span
            className="foundrie-gradient-text text-xs font-bold uppercase tracking-[0.26em]"
            style={{
              fontFamily: 'var(--font-clash), var(--font-display, sans-serif)',
              backgroundImage: MOLTEN,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            {eyebrow} &gt;
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{heading}</h2>
          {subheading && <p className="mx-auto mt-4 max-w-2xl text-white/60 md:text-lg">{subheading}</p>}
        </div>

        <Accordion type="single" collapsible className="w-full">
          {items.map((it, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-white/10 first:border-t"
            >
              <AccordionTrigger className="gap-4 py-5 text-left text-base font-semibold text-white hover:no-underline md:text-lg [&[data-state=open]]:text-[#ffb27a]">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-7 text-white/65 md:text-base">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-10 text-center text-sm text-white/55">
          Still have questions?{' '}
          <Link href="/help" className="font-semibold text-[#ffb27a] underline-offset-4 hover:underline">
            Visit the Help Desk &gt;
          </Link>
        </p>
      </div>
    </section>
  );
}
