import { LegalPage } from '@/components/legal/legal-page';

export const metadata = {
  title: 'Cookie Policy',
  description: 'How Foundrie AI uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="July 3, 2026"
      intro="This Cookie Policy explains how Foundrie AI may use cookies, local storage, and similar technologies to operate the platform and improve the user experience."
      sections={[
        {
          title: '1. Essential Technologies',
          body: [
            'Foundrie AI may use cookies or local storage to support authentication, session continuity, security, routing, preference storage, and basic platform functionality.',
            'These technologies are necessary for the service to work correctly.',
          ],
        },
        {
          title: '2. Preferences and Experience',
          body: [
            'The platform may store preferences such as remembered sign-in choices, interface settings, tool state, dismissed messages, and in-progress workflows.',
            'These settings help users return to work without unnecessary friction.',
          ],
        },
        {
          title: '3. Analytics and Performance',
          body: [
            'Foundrie AI may use analytics or performance tools to understand feature usage, page performance, errors, AI cost patterns, and product quality.',
            'Production launch should include a clear description of any analytics providers and any opt-out choices required by applicable law.',
          ],
        },
        {
          title: '4. Third-Party Services',
          body: [
            'Authentication, hosting, analytics, AI, payment, support, or embedded media providers may use their own cookies or similar technologies according to their policies.',
            'Foundrie AI should document production third-party providers before launch.',
          ],
        },
        {
          title: '5. Managing Cookies',
          body: [
            'Users can control cookies through browser settings. Blocking essential cookies may prevent login, saved sessions, or platform features from working correctly.',
            'A production consent and preference mechanism should be added if required by target jurisdictions.',
          ],
        },
      ]}
    />
  );
}
