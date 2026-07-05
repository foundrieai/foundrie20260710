import Image from 'next/image';
import { Logo } from '@/components/shared/logo';
import { GlowContainer } from '@/components/shared/glow-container';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  illustrationUrl?: string;
  illustrationHint?: string;
  videoUrl?: string;
}

export function AuthLayout({ 
  children, 
  title, 
  description, 
  illustrationUrl, 
  illustrationHint,
  videoUrl 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 bg-background">
        <GlowContainer>
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-6">
                <Logo />
              </div>
              <h1 className="text-3xl font-bold font-headline">{title}</h1>
              <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            {children}
          </div>
        </GlowContainer>
      </div>
      <div className="hidden lg:block relative overflow-hidden bg-black">
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : illustrationUrl ? (
          <Image
            src={illustrationUrl}
            alt="Authentication illustration"
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={illustrationHint || 'abstract'}
            className="opacity-70"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  );
}
