import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#08070c] text-white">
      <section className="container flex min-h-[calc(100svh-74px)] items-center py-24">
        <div className="max-w-3xl">
          <p className="font-code text-xs uppercase tracking-[0.24em] text-white/45">About</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-normal text-white md:text-7xl">
            Foundrie AI is the intelligent platform for starting something great.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/68">
            The platform brings together career, company, and brand-building tools for people creating durable advantage in the AI era of business.
          </p>
          <Link href="/" className="mt-10 inline-flex items-center gap-2 font-bold text-white">
            Back to Foundrie AI
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
