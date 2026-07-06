'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  pricingTabs,
  resolvePrice,
  ANNUAL_DISCOUNT_LABEL,
  type BillingCycle,
  type PricingPlan,
} from '@/lib/pricing';

function PlanCard({ plan, cycle }: { plan: PricingPlan; cycle: BillingCycle }) {
  const price = resolvePrice(plan, cycle);
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-7 transition-all duration-300',
        plan.featured
          ? 'border-white/25 bg-[linear-gradient(135deg,rgba(244,241,246,0.09),rgba(244,241,246,0.02))] shadow-[0_28px_90px_rgba(255,48,0,0.14)] md:-translate-y-2'
          : 'border-white/10 bg-white/[0.035] hover:-translate-y-1 hover:border-white/20'
      )}
    >
      {plan.featured && (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)]" />
      )}
      {plan.badge && (
        <span
          className={cn(
            'absolute -top-3 left-7 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]',
            plan.featured
              ? 'bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] text-[#14030b]'
              : 'border border-white/15 bg-black/40 text-white/70'
          )}
        >
          {plan.badge}
        </span>
      )}

      <h3 className="text-xl font-bold tracking-normal text-white">{plan.name}</h3>
      <p className="mt-1 text-sm text-white/55">{plan.tagline}</p>

      <div className="mt-6 flex items-end gap-1.5">
        <span className="text-4xl font-bold tracking-tight text-white">{price.amount}</span>
        {price.period && <span className="pb-1.5 text-sm font-semibold text-white/50">{price.period}</span>}
      </div>
      <p className="mt-1 h-4 text-xs text-white/45">{price.note ?? ''}</p>

      <Link
        href={plan.cta.href}
        className={cn(
          'mt-6 inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-full px-5 text-xs font-bold uppercase tracking-[0.12em] transition',
          plan.featured
            ? 'bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] text-[#14030b] hover:opacity-95'
            : 'border border-white/15 bg-white/5 text-white hover:border-[#ff7a00]/60 hover:bg-white/10'
        )}
      >
        {plan.cta.label}
      </Link>

      <ul className="mt-7 space-y-3 border-t border-white/10 pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-white/72">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff7a00]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingPage() {
  const [tabId, setTabId] = useState(pricingTabs[0].id);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  const activeTab = pricingTabs.find((t) => t.id === tabId) ?? pricingTabs[0];
  const gridCols = activeTab.plans.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-16 md:py-24">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffc400]">Pricing &gt;</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
            Choose your path to what comes next.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/60 md:text-lg">
            One platform for your company, your brand, and your career. Start free, and scale into the plan that
            matches your ambition.
          </p>
        </div>

        {/* Billing cycle toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-black/30 p-1">
            <button
              type="button"
              onClick={() => setCycle('monthly')}
              className={cn(
                'rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] transition',
                cycle === 'monthly' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle('annual')}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] transition',
                cycle === 'annual' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
              )}
            >
              Annual
              <span className="rounded-full bg-[#ff7a00]/15 px-2 py-0.5 text-[10px] text-[#ffc400]">
                {ANNUAL_DISCOUNT_LABEL}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {pricingTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabId(tab.id)}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-bold transition',
                tab.id === tabId
                  ? 'border-white/25 bg-white/10 text-white'
                  : 'border-white/10 bg-transparent text-white/55 hover:border-white/20 hover:text-white/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-white/50">{activeTab.blurb}</p>

        {/* Plan cards */}
        <div className={cn('mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2', gridCols)}>
          {activeTab.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-white/40">
          All prices in USD. Taxes may apply. You can change or cancel your plan at any time.
        </p>
      </main>
    </div>
  );
}
