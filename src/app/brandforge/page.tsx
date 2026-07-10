import { BrandForgeApp } from '@/features/brandforge/BrandForgeApp';
import { FaqSection } from '@/components/shared/faq-section';
import { brandForgeFaqs } from '@/lib/faqs';

export const metadata = {
  title: 'BrandForge',
  description:
    'Your dedicated AI branding strategist. Build a personal brand strategy and elevate your public-facing professional presence.',
};

export default function BrandForgePage() {
  return (
    <>
      <BrandForgeApp />
      <FaqSection
        eyebrow="BrandForge FAQ"
        heading="Common questions about BrandForge."
        subheading="How the AI branding strategist helps you build a professional presence that sounds like you."
        items={brandForgeFaqs}
      />
    </>
  );
}
