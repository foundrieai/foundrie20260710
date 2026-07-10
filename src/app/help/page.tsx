import { HelpDeskReport } from '@/components/help/help-desk-report';
import { FaqSection } from '@/components/shared/faq-section';
import { helpDeskFaqs } from '@/lib/faqs';

export const metadata = {
  title: 'Help Desk',
  description:
    'Get help with Foundrie AI. Report a bug, ask a question, or share feedback, and browse answers to common questions about LaunchCode, Resumait, and BrandForge.',
};

export default function HelpDeskPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-16 md:py-24">
        <div className="max-w-3xl">
          <span
            className="foundrie-gradient-text text-xs font-bold uppercase tracking-[0.26em]"
            style={{
              fontFamily: 'var(--font-clash), var(--font-display, sans-serif)',
              backgroundImage: 'linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            Help Desk &gt;
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">How can we help?</h1>
          <p className="mt-5 text-base leading-7 text-white/60 md:text-lg">
            Report a bug, ask a question, or share feedback. Every report goes straight to the Foundrie AI team, and we
            follow up by email. Browse the common questions below for instant answers.
          </p>
        </div>

        <HelpDeskReport />
      </main>

      <FaqSection
        eyebrow="Help Desk FAQ"
        heading="Answers to common questions."
        subheading="Quick help for accounts, billing, privacy, reports, and getting the most out of Foundrie AI."
        items={helpDeskFaqs}
      />
    </div>
  );
}
