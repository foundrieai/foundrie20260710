'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Rocket, GraduationCap, Handshake, LifeBuoy, Loader2, CheckCircle2, Mail } from 'lucide-react';

const MOLTEN = 'linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)';

const AUDIENCES = ['Founder or builder', 'Professional or jobseeker', 'Program or institution', 'Partner or investor', 'Other'];

const REASONS = [
  { icon: Rocket, title: 'For founders', body: 'Questions about LaunchCode, validation, or building your company on Foundrie AI.' },
  { icon: GraduationCap, title: 'For programs', body: 'Accelerators, incubators, and universities running cohorts on the platform.' },
  { icon: Handshake, title: 'For partners', body: 'Partnership, press, and investment inquiries.' },
  { icon: LifeBuoy, title: 'Support', body: 'Help with your account, billing, or an existing workspace.' },
];

export default function ConnectPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', audience: AUDIENCES[0], message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ variant: 'destructive', title: 'Please complete the form', description: 'Name, email, and a message are required.' });
      return;
    }
    setSubmitting(true);
    try {
      if (!firestore) throw new Error('Service unavailable.');
      await addDoc(collection(firestore, 'contactMessages'), {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        source: 'connect',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not send your message', description: 'Please try again in a moment.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'h-11 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#ff7a00]/60 focus:bg-white/[0.06]';

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-16 md:py-24">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#ff7a00]">Connect &gt;</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
            Let us build something great together.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/60 md:text-lg">
            Whether you are a founder, a professional, a program, or a partner, we would love to hear from you. Send a
            message and the Foundrie AI team will get back to you.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 md:p-9">
            {submitted ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full" style={{ backgroundImage: MOLTEN }}>
                  <CheckCircle2 className="h-7 w-7 text-[#14030b]" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-white">Message sent.</h2>
                <p className="mt-3 max-w-sm text-white/60">
                  Thank you for reaching out. We have received your message and will respond to {form.email} soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/55">Name</label>
                    <input id="c-name" className={inputClass} value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/55">Email</label>
                    <input id="c-email" type="email" className={inputClass} value={form.email} onChange={update('email')} placeholder="you@company.com" autoComplete="email" />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-audience" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/55">I am a</label>
                  <select id="c-audience" className={`${inputClass} appearance-none`} value={form.audience} onChange={update('audience')}>
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a} className="bg-[#0e0c14] text-white">{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="c-message" className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/55">Message</label>
                  <textarea id="c-message" rows={5} className={`${inputClass} h-auto resize-y py-3`} value={form.message} onChange={update('message')} placeholder="How can we help?" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="molten-animate inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-[0.12em] text-[#14030b] transition hover:opacity-95 disabled:opacity-60 sm:w-auto sm:px-8"
                  style={{ backgroundImage: MOLTEN }}
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>Send Message &gt;</>}
                </button>
              </form>
            )}
          </div>

          {/* Reasons + direct email */}
          <div className="space-y-4">
            {REASONS.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 text-[#ffaf54]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">{r.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/55">{r.body}</p>
                </div>
              );
            })}
            <a
              href="mailto:hello@foundrie.ai"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#ff7a00]/50 hover:bg-white/[0.05]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 text-[#ffaf54]">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Prefer email?</p>
                <p className="text-sm text-white/55">hello@foundrie.ai</p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
