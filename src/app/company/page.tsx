import { SuitePage } from '@/components/platform/suite-page';
import { platformSuites } from '@/lib/platform';

export const metadata = {
  title: 'Company Suite',
  description:
    'Build the company from first spark to funded scale with LaunchCode — the evidence-first founder operating system for ideation, validation, and execution.',
};

export default function CompanyPage() {
  return <SuitePage suite={platformSuites[0]} />;
}
