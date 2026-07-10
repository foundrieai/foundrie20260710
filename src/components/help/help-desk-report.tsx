'use client';

import { useEffect, useRef, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Bug, HelpCircle, CreditCard, Sparkles, Loader2, CheckCircle2, Mail } from 'lucide-react';

const CATEGORIES = [
  { value: 'bug', label: 'Report a bug', icon: Bug, blurb: 'Something is broken or not working as expected.' },
  { value: 'question', label: 'Ask a question', icon: HelpCircle, blurb: 'Get help using LaunchCode, Resumait, or BrandForge.' },
  { value: 'account', label: 'Account and billing', icon: CreditCard, blurb: 'Sign-in, plans, payments, or your workspace.' },
  { value: 'feedback', label: 'Feature request or feedback', icon: Sparkles, blurb: 'Share an idea to make Foundrie AI better.' },
] as const;

export function HelpDeskReport() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    category: 'bug' as (typeof CATEGORIES)[number]['value'],
    subject: '',
    message: '',
    name: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Prefill name and email once the signed-in user is available.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.displayName || '',
        email: f.email || user.email || '',
      }));
    }
  }, [user]);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const pickCategory = (value: (typeof CATEGORIES)[number]['value']) => {
    setForm((f) => ({ ...f, category: value }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast({ variant: 'destructive', title: 'Please complete the form', description: 'Name, email, subject, and a description are required.' });
      return;
    }
    setSubmitting(true);
    try {
      if (!firestore) throw new Error('Service unavailable.');
      await addDoc(collection(firestore, 'supportTickets'), {
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        userId: user?.uid ?? null,
        status: 'open',
        source: 'help-desk',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      toast({ variant: 'destructive', title: 'Could not submit your report', description: 'Please try again in a moment, or email us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#ff7a00]/60 focus:bg-white/[0.06]';
  const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/55';

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Category quick-picks */}
      <div>
        <h2 className="text-lg font-bold text-white">What do you need help with?</h2>
        <p className="mt-1 text-sm text-white/55">Pick a category to start your report.</p>
        <div className="mt-5 grid gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = form.category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => pickCategory(c.value)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-[#ff7a00]/60 bg-[#ff7a00]/[0.08]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${active ? 'border-[#ff7a00]/50 text-[#ffb27a]' : 'border-white/10 bg-black/25 text-[#ffaf54]'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{c.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/55">{c.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Mail className="h-4 w-4 text-[#ffaf54]" /> Prefer email?
          </div>
          <a href="mailto:hello@thesiliconhill.com" className="mt-1 block text-sm text-[#ffb27a] hover:underline">
            hello@thesiliconhill.com
          </a>
        </div>
      </div>

      {/* Report form */}
      <div ref={formRef} className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 md:p-9">
        {submitted ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] text-[#14030b]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">Report received.</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/60">
              Thank you. The Foundrie AI team has your report and will follow up at{' '}
              <span className="text-white/85">{form.email}</span>. You can close this page or submit another report.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm((f) => ({ ...f, subject: '', message: '' }));
              }}
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#ff7a00]/60 hover:bg-white/10"
            >
              Submit another report &gt;
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="h-category" className={labelClass}>Category</label>
              <select id="h-category" className={`${inputClass} appearance-none`} value={form.category} onChange={update('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#0e0c14]">{c.label}</option>
                ))}
                <option value="other" className="bg-[#0e0c14]">Something else</option>
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="h-name" className={labelClass}>Your name</label>
                <input id="h-name" className={inputClass} value={form.name} onChange={update('name')} placeholder="Jane Founder" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="h-email" className={labelClass}>Email</label>
                <input id="h-email" type="email" className={inputClass} value={form.email} onChange={update('email')} placeholder="you@company.com" autoComplete="email" />
              </div>
            </div>
            <div>
              <label htmlFor="h-subject" className={labelClass}>Subject</label>
              <input id="h-subject" className={inputClass} value={form.subject} onChange={update('subject')} placeholder="Briefly, what is this about?" />
            </div>
            <div>
              <label htmlFor="h-message" className={labelClass}>Description</label>
              <textarea
                id="h-message"
                rows={6}
                className={`${inputClass} h-auto resize-y py-3`}
                value={form.message}
                onChange={update('message')}
                placeholder="Tell us what happened, what you expected, and any steps to reproduce it."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="molten-animate inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-[0.12em] text-[#14030b] transition hover:opacity-95 disabled:opacity-60 sm:w-auto sm:px-8"
              style={{ backgroundImage: 'linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)' }}
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Submit Report &gt;</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
