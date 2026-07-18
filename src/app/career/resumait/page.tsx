import ResumeOptimizerPage from '@/components/resume-optimizer-page';
import { FaqSection } from '@/components/shared/faq-section';
import { resumaitFaqs } from '@/lib/faqs';
import { AuthGate } from '@/components/shared/auth-gate';
import {
  counselorChat,
  getInitialAnalysis,
  getResumeScore,
  optimize,
  runGenerateCoverLetter,
  runNewKeywordExtraction,
  runSpellCheck,
} from '@/features/resumait/actions';

export const metadata = {
  title: 'Resumait',
  description:
    'Comprehensive, ATS-ready resume optimization for the AI era. Tailor your resume to any role and access career guidance on demand.',
};

export default function ResumaitPage() {
  return (
    <AuthGate>
      <main className="resumait-skin min-h-[calc(100vh-74px)] px-4 py-6 md:px-8">
        <ResumeOptimizerPage
          actions={{
            optimize,
            getResumeScore,
            getInitialAnalysis,
            runNewKeywordExtraction,
            counselorChat,
            runSpellCheck,
            runGenerateCoverLetter,
          }}
        />
        <FaqSection
          eyebrow="Resumait FAQ"
          heading="Common questions about Resumait."
          subheading="How resume optimization, ATS scoring, and career guidance work inside Foundrie AI."
          items={resumaitFaqs}
          className="-mx-4 md:-mx-8"
        />
      </main>
    </AuthGate>
  );
}
