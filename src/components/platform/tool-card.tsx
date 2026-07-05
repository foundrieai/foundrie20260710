import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlatformTool } from '@/lib/platform';

const accentClass: Record<PlatformTool['accent'], string> = {
  gold: 'from-[#ffc400]/20 to-[#ffc400]/5 text-[#ffd75a]',
  ember: 'from-[#ff7a00]/20 to-[#ff7a00]/5 text-[#ffaf54]',
  verm: 'from-[#ff3000]/20 to-[#ff3000]/5 text-[#ff7959]',
  rose: 'from-[#ff0055]/20 to-[#ff0055]/5 text-[#ff6f9f]',
  mag: 'from-[#e600c9]/20 to-[#e600c9]/5 text-[#f16ce3]',
};

export function ToolCard({ tool, featured = false }: { tool: PlatformTool; featured?: boolean }) {
  const Icon = tool.icon;
  const isLive = tool.status === 'live';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-[#11101a] p-6 transition-colors hover:border-white/25',
        featured && 'md:col-span-2'
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-80', accentClass[tool.accent])} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(255,255,255,0.13),transparent_34%)]" />
      <div className="relative flex min-h-[280px] flex-col justify-between">
        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-black/25">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-code text-[11px] uppercase tracking-[0.18em] text-white/60">{tool.label}</span>
            </div>
            {!isLive && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 font-code text-[10px] uppercase tracking-[0.16em] text-white/60">
                <Clock3 className="h-3 w-3" />
                {tool.status === 'placeholder' ? 'Placeholder' : 'Incoming'}
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold tracking-normal text-white md:text-4xl">{tool.name}</h3>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 md:text-base">{tool.description}</p>
        </div>
        <Link
          href={tool.href}
          className="mt-10 inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition-[gap] group-hover:gap-4"
        >
          {tool.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
