import { SuitePage } from '@/components/platform/suite-page';
import { platformSuites } from '@/lib/platform';

export default function CareerPage() {
  return <SuitePage suite={platformSuites[1]} />;
}
