import ResumeOptimizerPage from '@/components/resume-optimizer-page';
import {
  counselorChat,
  getInitialAnalysis,
  getResumeScore,
  optimize,
  runGenerateCoverLetter,
  runNewKeywordExtraction,
  runSpellCheck,
} from '@/features/resumait/actions';

export default function ResumaitPage() {
  return (
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
    </main>
  );
}
