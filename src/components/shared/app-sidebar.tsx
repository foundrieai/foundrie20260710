'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import {
  Lightbulb,
  Puzzle,
  TrendingUp,
  Target,
  Rocket,
  LogOut,
  CheckCircle2,
  CircleDashed,
  Lock,
  Archive,
  ClipboardList,
  Map
} from 'lucide-react';

type ModuleState = 'locked' | 'in-progress' | 'complete';

interface NavItem {
  label: string;
  id: string; // The query parameter value for module
  href: string; // Default path if not in a report
  icon: React.ElementType;
  state: ModuleState;
}

const navItems: NavItem[] = [
  { label: 'Ideation', id: 'ideation', href: '/ideation', icon: Lightbulb, state: 'complete' },
  { label: 'Validation', id: 'validation', href: '/new', icon: CheckCircle2, state: 'in-progress' },
  { label: 'Evidence Vault', id: 'vault', href: '/vault', icon: Archive, state: 'in-progress' },
  { label: 'Decision Log', id: 'decisions', href: '/decisions', icon: ClipboardList, state: 'in-progress' },
  { label: 'Portfolio Map', id: 'portfolio', href: '/portfolio', icon: Map, state: 'in-progress' },
  { label: 'Problem-Solution Fit', id: 'problem_solution_fit_extended', href: '/phases/psf', icon: Puzzle, state: 'in-progress' },
  { label: 'Product-Market Fit', id: 'product_market_fit', href: '/phases/pmf', icon: Target, state: 'locked' },
  { label: 'Go-to-Market Fit', id: 'go_to_market_fit', href: '/phases/gtm', icon: Rocket, state: 'locked' },
  { label: 'Growth', id: 'growth_scale', href: '/phases/growth', icon: TrendingUp, state: 'locked' },
  { label: 'Exit', id: 'maturity_exit', href: '/phases/exit', icon: LogOut, state: 'locked' },
];

import React, { Suspense } from 'react';

// ... (other imports)
// ... (navItems)

function AppSidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();

  // Extract report IDs from the pathname if we are on a report page
  const reportMatch = pathname.match(/\/report\/([^\/]+)\/([^\/]+)/);
  const isReportPage = !!reportMatch;
  const baseUrl = isReportPage ? `/report/${reportMatch[1]}/${reportMatch[2]}` : '';
  const currentModule = searchParams.get('module') || 'validation';

  // Only render sidebar on company idea routes
  const isCompanyIdeaRoute = pathname.startsWith('/ideation') || pathname.startsWith('/new') || pathname.startsWith('/phases') || pathname.startsWith('/vault') || pathname.startsWith('/decisions') || pathname.startsWith('/portfolio') || isReportPage;
  const enableDevSkip = process.env.NODE_ENV !== 'production' || user?.email?.toLowerCase() === 'hello@thesiliconhill.com';

  if (isUserLoading || !user || !isCompanyIdeaRoute) {
    return null;
  }

  return (
    <aside className="w-16 md:w-64 flex-shrink-0 border-r border-white/10 bg-[#08070c]/70 flex flex-col transition-all duration-300 backdrop-blur-xl">
      <nav className="flex-1 py-6 flex flex-col gap-2 px-2 md:px-4">
        {navItems.map((item) => {
          let href = item.href;
          let isActive = false;
          const itemState = enableDevSkip && item.state === 'locked' ? 'in-progress' : item.state;
          
          if (item.id === 'ideation') {
            isActive = pathname === '/ideation';
            href = '/ideation';
          } else if (item.id === 'validation') {
            href = isReportPage ? `${baseUrl}?module=validation` : '/new';
            isActive = pathname === '/new' || (isReportPage && currentModule === 'validation');
          } else if (item.id === 'vault') {
            href = '/vault';
            isActive = pathname === '/vault';
          } else if (item.id === 'decisions') {
            href = '/decisions';
            isActive = pathname === '/decisions';
          } else if (item.id === 'portfolio') {
            href = '/portfolio';
            isActive = pathname === '/portfolio';
          } else if (isReportPage) {
            href = `${baseUrl}?module=${item.id}`;
            isActive = currentModule === item.id;
          } else {
            isActive = pathname === item.href;
          }

          return (
            <Link
              key={item.label}
              href={itemState === 'locked' ? '#' : href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all",
                isActive 
                  ? "border-[#ff7a00]/40 bg-[linear-gradient(90deg,rgba(255,196,0,0.14),rgba(255,0,85,0.08))] text-white shadow-[0_0_28px_rgba(255,48,0,0.12)]" 
                  : "text-white/58 hover:border-white/15 hover:bg-white/5 hover:text-white",
                itemState === 'locked' && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:block flex-1 font-code text-[11px] font-bold uppercase tracking-[0.08em]">{item.label}</span>
              
              {/* State Indicator - Hidden on mobile, shown on hover or when expanded */}
              <div className="hidden md:flex items-center justify-center">
                {itemState === 'complete' && <CheckCircle2 className="h-4 w-4 text-[#ffc400]" />}
                {itemState === 'in-progress' && <CircleDashed className="h-4 w-4 text-[#ff7a00] animate-spin-slow" />}
                {itemState === 'locked' && <Lock className="h-4 w-4 text-white/32" />}
              </div>
              
              {/* Mobile State Dot */}
              <div className="absolute right-1 top-1 md:hidden">
                 {itemState === 'complete' && <div className="h-2 w-2 rounded-full bg-[#ffc400]" />}
                 {itemState === 'in-progress' && <div className="h-2 w-2 rounded-full bg-[#ff7a00]" />}
                 {itemState === 'locked' && <div className="h-2 w-2 rounded-full bg-white/32" />}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AppSidebar() {
  return (
    <Suspense fallback={null}>
      <AppSidebarInner />
    </Suspense>
  );
}
