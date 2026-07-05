'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { UserNav } from '@/components/shared/user-nav';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const marketingLinks = [
  { href: '/company', label: 'Company' },
  { href: '/career', label: 'Career' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/connect', label: 'Connect' },
];

const marketingPrefixes = ['/', '/career', '/company', '/brandforge', '/branddynamo', '/resources', '/about', '/connect'];

export const AppHeader = () => {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMarketingRoute =
    pathname === '/' || marketingPrefixes.some((prefix) => prefix !== '/' && pathname.startsWith(prefix));
  const isAdmin = user?.email === 'hello@thesiliconhill.com' || user?.email === 'RobertKWilliams.DC@gmail.com' || (user as any)?.admin === true;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const authenticatedLinks = [
    { href: '/company', label: 'Company' },
    { href: '/career', label: 'Career' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/company/launchcode', label: 'LaunchCode' },
    { href: '/ideation', label: 'Ideation' },
    { href: '/new', label: 'Validation' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  const collapsedLinks = isMarketingRoute ? marketingLinks : authenticatedLinks;

  return (
    <header 
      className={cn(
        "foundrie-liquid-nav sticky top-0 z-50 w-full print:hidden transition-all duration-300",
        isScrolled && "foundrie-liquid-nav--scrolled"
      )}
    >
      <div className="container flex h-[74px] items-center justify-between relative">
        <div className="flex items-center">
          <Logo />
        </div>
        
        {isMarketingRoute && (
          <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[12px] font-bold uppercase tracking-[0.14em] text-white/78">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-white",
                  pathname === link.href && "text-[#ff7a00]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {!isMarketingRoute && !isUserLoading && user && (
          <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-7 text-[13px] font-bold uppercase tracking-[0.12em] text-white/72">
            {authenticatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        
        <div className="flex items-center space-x-4">
          {isMarketingRoute ? (
            <div className="hidden xl:flex items-center space-x-4">
              <Link href="/login" className="text-xs font-bold uppercase tracking-[0.12em] text-white/85 transition-colors hover:text-white">
                Sign In
              </Link>
              <Button asChild className="h-11 rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-6 text-xs font-bold uppercase tracking-[0.12em] text-[#14030b] shadow-[0_0_28px_rgba(255,48,0,0.34)] hover:opacity-95 hover:shadow-[0_0_44px_rgba(255,48,0,0.44)]">
                <Link href="/signup">Get Started for Free &gt;</Link>
              </Button>
            </div>
          ) : !isUserLoading && !user ? (
            <div className="hidden xl:flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <Button asChild className="rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-5 font-bold text-[#14030b] hover:opacity-90">
                <Link href="/signup">Get Started &gt;</Link>
              </Button>
            </div>
          ) : (
            <UserNav />
          )}
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:border-[#ff7a00]/60 hover:bg-white/10 xl:hidden',
              !isMarketingRoute && !(!isUserLoading && !user) && !user && 'hidden'
            )}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] shadow-[0_0_18px_rgba(255,48,0,0.55)] transition-transform duration-100"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
      {isMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-[#08070c]/96 px-6 py-5 shadow-[0_22px_54px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <nav className="grid gap-3 text-sm font-bold uppercase tracking-[0.14em] text-white/78">
            {collapsedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 transition-colors hover:border-[#ff7a00]/60 hover:text-white',
                  pathname === link.href && 'border-[#ff7a00]/70 text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {(isMarketingRoute || (!isUserLoading && !user)) && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-xs font-bold uppercase tracking-[0.12em] text-white/85">
                Sign In
              </Link>
              <Button asChild className="h-11 rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-6 text-xs font-bold uppercase tracking-[0.12em] text-[#14030b]">
                <Link href="/signup">Get Started for Free &gt;</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
