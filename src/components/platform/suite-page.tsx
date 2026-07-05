import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/platform/tool-card';
import type { PlatformSuite } from '@/lib/platform';

export function SuitePage({ suite }: { suite: PlatformSuite }) {
  const Icon = suite.icon;

  return (
    <main className="min-h-screen bg-[#08070c] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_0%,rgba(255,122,0,0.24),transparent_34%),radial-gradient(circle_at_0%_60%,rgba(230,0,201,0.14),transparent_35%)]" />
        <div className="container relative py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="mb-8 grid h-14 w-14 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#ffaf54]">
                <Icon className="h-7 w-7" />
              </div>
              <p className="font-code text-xs uppercase tracking-[0.24em] text-white/45">{suite.kicker}</p>
              <h1 className="mt-5 text-5xl font-bold leading-tight tracking-normal text-white md:text-7xl">
                {suite.headline}
              </h1>
            </div>
            <div>
              <p className="text-lg leading-8 text-white/68">{suite.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {suite.name === 'Company' ? (
                  <>
                    <Button asChild className="rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-7 font-bold text-black hover:opacity-90">
                      <Link href="/company/launchcode">
                        Enter LaunchCode
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-white/20 bg-black/20 px-7 text-white hover:bg-white/10">
                      <Link href="/new">Validate an idea</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-7 font-bold text-black hover:opacity-90">
                      <Link href="/career/resumait">
                        Enter Resumait
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-white/20 bg-black/20 px-7 text-white hover:bg-white/10">
                      <Link href="/brandforge">Enter BrandForge</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 md:py-28">
        <div className="mb-10 max-w-2xl">
          <p className="font-code text-xs font-bold uppercase tracking-[0.24em] text-[#ffc400]">Suite Tools &gt;</p>
          <h2 className="mt-4 text-4xl font-bold tracking-normal text-white">
            {suite.name === 'Company' ? 'Evidence-first company building' : 'Career materials and public reputation'}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/62">
            {suite.name === 'Company'
              ? 'LaunchCode carries founders from first idea through validation, execution, growth, and exit readiness while BrandForge keeps the company story coherent as it develops.'
              : 'Resumait turns job applications into measured, optimized materials while BrandForge builds the professional presence that makes opportunity more likely to find you.'}
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {suite.tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} featured={tool.status === 'live'} />
          ))}
        </div>
      </section>
    </main>
  );
}
