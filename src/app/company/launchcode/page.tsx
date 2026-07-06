import Link from 'next/link';
import { ArrowRight, CheckCircle2, ClipboardList, Lightbulb, LogOut, Map, Puzzle, Rocket, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const launchCodeEntries = [
  {
    title: 'Ideation',
    href: '/ideation',
    description: 'Find a marketable startup idea aligned with founder background and unfair advantages.',
    icon: Lightbulb,
  },
  {
    title: 'Validation',
    href: '/new',
    description: 'Generate the validation report and startup analysis that seeds the company journey.',
    icon: CheckCircle2,
  },
  {
    title: 'Problem-Solution Fit',
    href: '/phases/psf',
    description: 'Move from validated idea to evidence-backed customer pain, solution shape, and willingness to pay.',
    icon: Puzzle,
  },
  {
    title: 'Product-Market Fit',
    href: '/phases/pmf',
    description: 'Prove that users return voluntarily, reach value quickly, and would miss the product if it disappeared.',
    icon: Target,
  },
  {
    title: 'Go-to-Market Fit',
    href: '/phases/gtm',
    description: 'Find the repeatable channel, message, pricing, and sales process that can create predictable revenue.',
    icon: Rocket,
  },
  {
    title: 'Growth & Scale-Up',
    href: '/phases/growth',
    description: 'Turn the repeatable revenue motion into durable scale across team, operations, product, and unit economics.',
    icon: TrendingUp,
  },
  {
    title: 'Maturity & Exit-Readiness',
    href: '/phases/exit',
    description: 'Build the governance, financial, operational, people, and category evidence that creates strategic options.',
    icon: LogOut,
  },
  {
    title: 'Evidence Vault',
    href: '/vault',
    description: 'Collect the interview notes, behavioral proof, metrics, quotes, and files that support each decision.',
    icon: ClipboardList,
  },
  {
    title: 'Portfolio Map',
    href: '/portfolio',
    description: 'See the company journey across phases, evidence, decisions, and remaining work.',
    icon: Map,
  },
];

export const metadata = {
  title: 'LaunchCode',
  description:
    'The evidence-first founder operating system: ideation, validation, and phase-by-phase execution from raw idea to fundable company.',
};

export default function LaunchCodeHubPage() {
  return (
    <main className="min-h-screen bg-[#08070c] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_0%,rgba(255,122,0,0.28),transparent_34%),radial-gradient(circle_at_0%_70%,rgba(255,48,0,0.14),transparent_35%)]" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-4xl">
            <p className="font-code text-xs uppercase tracking-[0.24em] text-white/45">Company Suite Flagship</p>
            <h1 className="mt-5 text-5xl font-bold leading-tight tracking-normal text-white md:text-7xl">LaunchCode</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
              The evidence-first founder operating system inside Foundrie AI. LaunchCode helps founders find the idea worth building, prove the market before they overbuild, and execute phase by phase with evidence, decisions, and milestones in view.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-7 font-bold text-black hover:opacity-90">
                <Link href="/ideation">
                  Start with Ideation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 bg-black/20 px-7 text-white hover:bg-white/10">
                <Link href="/new">Validate an idea</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 md:py-28">
        <div className="mb-10 flex items-center gap-3">
          <Rocket className="h-6 w-6 text-[#ffaf54]" />
          <h2 className="text-3xl font-bold tracking-normal text-white">LaunchCode modules &gt;</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {launchCodeEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link key={entry.title} href={entry.href} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25">
                <div className="mb-8 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-black/25 text-[#ffaf54]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/35 transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-2xl font-bold text-white">{entry.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{entry.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
