'use client';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthForm } from '@/components/auth/auth-form';
import { AnvilMark } from '@/components/shared/anvil-mark';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';

const FREE_PLAN_INCLUDES = [
  'Access across all three tools — LaunchCode, Resumait, and BrandForge',
  'LaunchCode Ideation: turn your real background into tailored startup concepts',
  'A complete, investor-grade Validation report to pressure-test an idea',
  'Ideamait, your built-in AI advisor, guiding you at every step',
  'One active workspace, plus community resources and guides',
];

/** A plain-language explainer of exactly what the free account includes. */
function FreePlanExplainer() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-left backdrop-blur-md lg:bg-white/[0.04] lg:p-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Your free account</p>
        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-bold text-white/70">$0 forever</span>
      </div>
      <p className="mt-2 text-sm text-white/60">
        No credit card required. Start building today and only upgrade if you outgrow it.
      </p>
      <ul className="mt-4 space-y-2.5">
        {FREE_PLAN_INCLUDES.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/80">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff7a00]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-white/50">
        Need more workspaces or the full execution phases?{' '}
        <Link href="/pricing" className="font-semibold text-primary hover:underline">
          Compare plans
        </Link>
        .
      </p>
    </div>
  );
}

export default function SignupPage() {
  useAuthRedirect();
  return (
    <AuthLayout
      title="Create an account"
      description="Start validating your ideas in minutes."
      animated
      brandMark={<AnvilMark />}
      panel={<FreePlanExplainer />}
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
