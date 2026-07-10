import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { AppHeader } from '@/components/shared/app-header';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { ActionArrowNormalizer } from '@/components/shared/action-arrow-normalizer';
import { SiteFooter } from '@/components/shared/site-footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://foundrie.ai'),
  title: {
    default: 'Foundrie AI — Your Innovation Destination',
    template: '%s · Foundrie AI',
  },
  description:
    'Two suites of intelligent tools for the AI era of business. Build your company with LaunchCode and your career with Resumait — all in one place.',
  openGraph: {
    title: 'Foundrie AI — Your Innovation Destination',
    description:
      'Two suites of intelligent tools for the AI era of business. Build your company with LaunchCode and your career with Resumait — all in one place.',
    type: 'website',
    siteName: 'Foundrie AI',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-clip">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen flex flex-col overflow-x-clip">
        <FirebaseClientProvider>
          <AppHeader />
          <ActionArrowNormalizer />
          <div className="flex-grow flex relative">
            <AppSidebar />
            <div className="flex-1 flex flex-col relative min-w-0">
              {children}
              <SiteFooter />
            </div>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
