import { Target, Eye } from 'lucide-react';
import { MagneticButton } from '@/components/shared/magnetic-button';

const MOLTEN = 'linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)';

function PillarCard({
  kicker,
  title,
  body,
  icon,
}: {
  kicker: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-[0.18] opacity-80 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: MOLTEN }}
      />
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/30 text-[#ffaf54]">
          {icon}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffc400]">{kicker}</span>
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">{title}</h2>
      <p className="mt-3 text-base leading-7 text-white/60">{body}</p>
    </div>
  );
}

export const metadata = {
  title: 'About',
  description:
    'We engineered Foundrie AI because the AI era demands a new paradigm — a platform that meets professionals, founders, and innovators at their current stage and accelerates their trajectory.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 opacity-[0.16] blur-[120px]"
            style={{ background: MOLTEN }}
          />
          <div className="container relative py-20 text-center md:py-28">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#ff7a00]">Our Story &gt;</span>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-8xl">
              About{' '}
              <span
                className="foundrie-gradient-text bg-clip-text text-transparent"
                style={{
                  backgroundImage: MOLTEN,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Foundrie AI.
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/65">
              We engineered Foundrie AI because the AI era demands a new paradigm — a platform that meets
              professionals, founders, and innovators at their current stage and accelerates their trajectory.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="container pb-6">
          <div className="grid gap-5 md:grid-cols-2">
            <PillarCard
              kicker="Mission"
              title="Democratize Success"
              body="Provide every professional and founder with access to the caliber of AI-powered guidance previously reserved for the privileged few."
              icon={<Target className="h-5 w-5" />}
            />
            <PillarCard
              kicker="Vision"
              title="The AI Era Platform"
              body="The definitive platform for succeeding in an environment where AI is fundamentally restructuring every industry, career trajectory, and business model."
              icon={<Eye className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Conviction */}
        <section className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffc400]">Our Conviction &gt;</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Companies are built by people. Both deserve intelligent tools.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/60">
              Foundrie AI brings together two suites of intelligent tools — one for building the company, one for
              building the professional behind it — so the same evidence-driven rigor carries you from a career move
              to a company launch, all in one place.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="container pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(244,241,246,0.07),rgba(244,241,246,0.02))] p-10 text-center md:p-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.12] blur-[90px]"
              style={{ background: MOLTEN }}
            />
            <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-5xl">
              Start Forging Your Own Future.
            </h2>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton variant="molten" href="/signup">Get Started for Free &gt;</MagneticButton>
              <MagneticButton variant="ghost" href="/connect">Talk to Us &gt;</MagneticButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
