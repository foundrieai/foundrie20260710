import { SuitePage } from '@/components/platform/suite-page';
import { platformSuites } from '@/lib/platform';

export default function CompanyPage() {
  return <SuitePage suite={platformSuites[0]} />;
}
