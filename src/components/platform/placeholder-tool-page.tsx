import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlatformTool } from '@/lib/platform';

export function PlaceholderToolPage({
  tool,
  backHref,
  backLabel,
  note,
}: {
  tool: PlatformTool;
  backHref: string;
  backLabel: string;
  note: string;
}) {
  const Icon = tool.icon;

  return (
    <main className="min-h-screen bg-[#08070c] text-white">
      <section className="container flex min-h-[calc(100svh-56px)] items-center py-20">
        <div className="grid w-full gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-code text-xs uppercase tracking-[0.2em] text-white/55">
              <Clock3 className="h-4 w-4" />
              {tool.status === 'incoming' ? 'Incoming' : 'Placeholder'}
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-normal text-white md:text-7xl">{tool.name}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">{tool.description}</p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/50">{note}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-white px-7 font-bold text-black hover:bg-white/90">
                <Link href={backHref}>
                  {backLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 bg-black/20 px-7 text-white hover:bg-white/10">
                <Link href="/">Back to Foundrie AI</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#11101a] p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_0%,rgba(255,0,85,0.26),transparent_38%),radial-gradient(circle_at_0%_100%,rgba(255,196,0,0.18),transparent_40%)]" />
            <div className="relative grid min-h-[420px] place-items-center rounded-2xl border border-white/10 bg-black/25">
              <Icon className="h-24 w-24 text-white/22" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-code text-xs uppercase tracking-[0.22em] text-white/45">{tool.label}</p>
                <p className="mt-3 text-2xl font-bold text-white">Ready for ZIP import</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
