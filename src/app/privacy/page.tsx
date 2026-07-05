import { LegalPage } from '@/components/legal/legal-page';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 3, 2026"
      intro="This Privacy Policy explains the categories of information Foundrie AI may collect and how that information may be used to operate, secure, support, and improve the platform."
      sections={[
        {
          title: '1. Information Users Provide',
          body: [
            'Foundrie AI may process account information, profile details, resumes, job descriptions, business ideas, validation responses, evidence uploads, brand materials, prompts, messages, generated outputs, and related files or metadata.',
            'Users should avoid submitting sensitive personal information unless it is necessary for the feature they are using.',
          ],
        },
        {
          title: '2. Information Collected Automatically',
          body: [
            'Foundrie AI may collect usage data, device and browser information, tool activity, timestamps, authentication events, AI request metadata, error logs, and performance information.',
            'This information helps operate the platform, diagnose issues, measure feature usage, control AI costs, improve quality, and protect the service.',
          ],
        },
        {
          title: '3. AI Processing',
          body: [
            'User inputs may be sent to AI service providers to generate reports, recommendations, drafts, scores, summaries, and other platform outputs.',
            'Foundrie AI should be configured so production data is handled under appropriate provider settings, security controls, and contractual terms before public launch.',
          ],
        },
        {
          title: '4. Administrator Access',
          body: [
            'Platform administrators may access user, usage, report, generated-output, cost, and diagnostic data when needed for support, debugging, moderation, account management, compliance, security, and product operations.',
            'Admin access should be role-limited, logged, and reviewed as the platform moves toward production.',
          ],
        },
        {
          title: '5. Data Retention and Deletion',
          body: [
            'Foundrie AI may retain user data while an account is active and for a reasonable period afterward for backup, legal, security, support, and operational purposes.',
            'Production launch should include a clear account deletion and data export process.',
          ],
        },
        {
          title: '6. Security',
          body: [
            'Foundrie AI should use reasonable technical and organizational safeguards to protect user data, including authentication controls, database rules, role-based access, environment separation, and monitoring.',
            'No internet-connected service can guarantee absolute security.',
          ],
        },
      ]}
    />
  );
}
