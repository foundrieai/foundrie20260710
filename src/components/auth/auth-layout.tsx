import Image from 'next/image';
import { Logo } from '@/components/shared/logo';
import { GlowContainer } from '@/components/shared/glow-container';
import { MoltenCanvas } from '@/components/shared/molten-canvas';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  illustrationUrl?: string;
  illustrationHint?: string;
  videoUrl?: string;
  /** Use the homepage hero's WebGL molten animation instead of a video/image. */
  animated?: boolean;
  /** Brand mark shown above the form. Defaults to the full logo+wordmark. */
  brandMark?: React.ReactNode;
  /**
   * Value-proposition content. On desktop it sits in the right panel over the
   * animation (visible beside the form, above the fold); on mobile it drops in
   * below the form. This is where benefits/social proof belong for conversion.
   */
  panel?: React.ReactNode;
}

export function AuthLayout({
  children,
  title,
  description,
  illustrationUrl,
  illustrationHint,
  videoUrl,
  animated,
  brandMark,
  panel,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 bg-background">
        <GlowContainer>
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-6">{brandMark ?? <Logo />}</div>
              <h1 className="text-3xl font-bold font-headline">{title}</h1>
              <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            {/* Mobile: the value prop sits ABOVE the form (the right panel is
                hidden here) so the benefits are seen before the form, never
                buried below it. */}
            {panel && <div className="mb-8 lg:hidden">{panel}</div>}
            {children}
          </div>
        </GlowContainer>
      </div>
      <div className="hidden lg:block relative overflow-hidden bg-black">
        {animated ? (
          <MoltenCanvas className="absolute inset-0 h-full w-full" />
        ) : videoUrl ? (
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
        {/* Only a soft blend at the left seam where the panel meets the form
            column — the animation itself stays vibrant, homepage-hero style. The
            panel content carries its own contrast (dark glass), so no heavy scrim. */}
        <div
          className={
            animated
              ? 'absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent'
              : 'absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60'
          }
        />
        {!animated && <div className="absolute inset-0 bg-black/40" />}
        {/* Desktop: the value prop lives in the hero space, beside the form. */}
        {panel && (
          <div className="absolute inset-0 z-10 flex flex-col justify-center p-10 xl:p-14">
            <div className="w-full max-w-md">{panel}</div>
          </div>
        )}
      </div>
    </div>
  );
}
