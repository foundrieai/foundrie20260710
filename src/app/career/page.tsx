import { SuitePage } from '@/components/platform/suite-page';
import { platformSuites } from '@/lib/platform';

export const metadata = {
  title: 'Career Suite',
  description:
    'Engineer the career and reputation behind the work. Resumait and BrandForge give professionals and jobseekers intelligent tools for the AI era.',
};

export default function CareerPage() {
  return <SuitePage suite={platformSuites[1]} />;
}
