'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReportCard } from '@/components/dashboard/report-card';
import { IdeamaitAssistant } from '@/components/shared/ideamait-assistant';
import { CrossPromoCard } from '@/components/shared/cross-promo-card';
import { DASHBOARD_BRANDFORGE_PROMO } from '@/lib/cross-promotions';
import { MagneticButton } from '@/components/shared/magnetic-button';
import { BarChart, CheckCircle2, Lightbulb, Search, ListFilter, Loader2, ChevronDown, Star, Shield, Users, Database, ArrowRight, Wrench, Activity, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Report, User as UserProfileData } from '@/lib/types';
import { calculateOverallScore } from '@/lib/report-helpers';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { platformTools, launchCodeTool, resumaitTool, brandForgeTool, type PlatformTool } from '@/lib/platform';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACCENT_HEX: Record<PlatformTool['accent'], string> = {
  gold: '#ffc400', ember: '#ff7a00', verm: '#ff3000', rose: '#ff0055', mag: '#e600c9',
};

const VIEW_AS_USER_KEY = 'foundrie-dashboard-view-as-user';

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="glass-card p-6 flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
      <div>
        <p className="text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold font-headline">{value}</p>
      </div>
    </Card>
  );
}

const adminEmails = new Set(['hello@thesiliconhill.com', 'RobertKWilliams.DC@gmail.com']);

type SortOption = 'newest' | 'oldest' | 'highest-score' | 'lowest-score';

function ToolLaunchCard({
  name,
  label,
  href,
  status,
  icon,
}: {
  name: string;
  label: string;
  href: string;
  status: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff7a00]/50 hover:bg-white/[0.07]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,122,0,0.18),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(230,0,201,0.12),transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-black/30 text-[#ffaf54]">
          {icon}
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
          {status}
        </span>
      </div>
      <div className="relative mt-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">{label}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h3 className="text-2xl font-bold tracking-normal text-white">{name}</h3>
          <ArrowRight className="h-4 w-4 text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>
    </Link>
  );
}

/** Primary product tile — the way a subscriber jumps into any suite and picks up ongoing work. */
function ProductCard({ tool, activity }: { tool: PlatformTool; activity: string }) {
  const Icon = tool.icon;
  const accent = ACCENT_HEX[tool.accent];
  return (
    <Link
      href={tool.href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]"
    >
      <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-[0.18] bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] opacity-80 transition-transform duration-500 group-hover:scale-x-100" />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 82% 0%, ${accent}22, transparent 42%)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-black/30" style={{ color: accent }}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
          {tool.suite} suite
        </span>
      </div>
      <div className="relative mt-6 flex-grow">
        <h3 className="text-2xl font-bold tracking-normal text-white">{tool.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/60 line-clamp-2">{tool.description}</p>
      </div>
      <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm font-semibold text-white/72">{activity}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: accent }}>
          {tool.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ViewToggle({ viewAsUser, onChange }: { viewAsUser: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/15 bg-black/30 p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition',
          !viewAsUser ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
        )}
      >
        <Shield className="h-3.5 w-3.5" /> Admin
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition',
          viewAsUser ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
        )}
      >
        <Eye className="h-3.5 w-3.5" /> User view
      </button>
    </div>
  );
}

function AdminCommandCenter({
  usersCount,
  reportsCount,
  isLoading,
}: {
  usersCount: number;
  reportsCount: number;
  isLoading: boolean;
}) {
  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(244,241,246,0.075),rgba(244,241,246,0.025))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="relative p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(255,196,0,0.16),transparent_32%),radial-gradient(circle_at_100%_12%,rgba(230,0,201,0.16),transparent_36%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff7a00]/35 bg-[#ff7a00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#ffc400]">
              <Shield className="h-4 w-4" />
              Administrator Console
            </div>
            <h2 className="text-4xl font-bold tracking-normal text-white md:text-5xl">Platform command center</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/62 md:text-base">
              Access every suite, flagship tool, platform control surface, and user-data view from one admin-grade dashboard.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/24 p-4">
                <Users className="mb-3 h-5 w-5 text-[#ffaf54]" />
                <p className="text-xs uppercase tracking-[0.18em] text-white/42">Users</p>
                <p className="mt-1 text-3xl font-bold text-white">{isLoading ? '...' : usersCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/24 p-4">
                <Database className="mb-3 h-5 w-5 text-[#ff6f9f]" />
                <p className="text-xs uppercase tracking-[0.18em] text-white/42">Reports</p>
                <p className="mt-1 text-3xl font-bold text-white">{isLoading ? '...' : reportsCount}</p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] px-6 font-bold text-black hover:opacity-90">
                <Link href="/admin">
                  Open Admin
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/42">Tool access</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {platformTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <ToolLaunchCard
                    key={tool.name}
                    name={tool.name}
                    label={tool.label}
                    href={tool.href}
                    status={tool.status}
                    icon={<Icon className="h-5 w-5" />}
                  />
                );
              })}
              <ToolLaunchCard name="Admin Data" label="Platform operations" href="/admin" status="secure" icon={<Wrench className="h-5 w-5" />} />
              <ToolLaunchCard name="Activity Vault" label="Founder data" href="/vault" status="live" icon={<Activity className="h-5 w-5" />} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPageInner() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewAsUser, setViewAsUser] = useState(false);
  const [brandForgeActive, setBrandForgeActive] = useState(false);
  const IDEAS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState(IDEAS_PER_PAGE);

  const isAdmin = !!user && (adminEmails.has(user.email || '') || (user as any)?.admin === true);
  const effectiveAdmin = isAdmin && !viewAsUser;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  // Restore the admin's chosen view mode across navigations.
  useEffect(() => {
    try {
      setViewAsUser(window.localStorage.getItem(VIEW_AS_USER_KEY) === '1');
    } catch { /* ignore */ }
  }, []);

  const changeViewAsUser = (value: boolean) => {
    setViewAsUser(value);
    try { window.localStorage.setItem(VIEW_AS_USER_KEY, value ? '1' : '0'); } catch { /* ignore */ }
  };

  // Detect in-progress BrandForge work (persisted locally per user).
  useEffect(() => {
    if (!user) return;
    try {
      setBrandForgeActive(!!window.localStorage.getItem(`foundrie_brandforge_${user.uid}_identities`));
    } catch { /* ignore */ }
  }, [user]);

  const reportsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'reports');
  }, [firestore, user]);

  const { data: reports, isLoading: isReportsLoading } = useCollection<Report>(reportsQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, user, isAdmin]);

  const { data: adminUsers, isLoading: isAdminUsersLoading } = useCollection<UserProfileData>(usersQuery);
  const adminReportCount = useMemo(
    () => adminUsers?.reduce((total, platformUser) => total + (platformUser.reportsGenerated || 0), 0) || 0,
    [adminUsers]
  );

  const completedReports = useMemo(() =>
    reports?.filter(r => r.status === 'complete' && r.scores) || [],
    [reports]
  );

  const averageScore = useMemo(() => {
    if (completedReports.length === 0) return '0.0';
    const total = completedReports.reduce((acc, report) => acc + calculateOverallScore(report.scores), 0);
    return (total / completedReports.length).toFixed(1);
  }, [completedReports]);

  const processedReports = useMemo(() => {
    if (!reports) return [];
    let filtered = reports.filter(report =>
      report.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest-score':
          return calculateOverallScore(b.scores) - calculateOverallScore(a.scores);
        case 'lowest-score':
          return calculateOverallScore(a.scores) - calculateOverallScore(b.scores);
        default:
          return 0;
      }
    });
  }, [reports, searchQuery, sortBy]);

  // Collapse back to the first page whenever the filtered/sorted set changes.
  useEffect(() => {
    setVisibleCount(IDEAS_PER_PAGE);
  }, [searchQuery, sortBy]);

  const visibleReports = processedReports.slice(0, visibleCount);
  const hasMoreReports = processedReports.length > visibleCount;

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
      case 'highest-score': return 'Highest Score';
      case 'lowest-score': return 'Lowest Score';
    }
  };

  const launchCodeActivity = reports && reports.length > 0
    ? `${reports.length} ${reports.length === 1 ? 'idea' : 'ideas'} · avg ${averageScore} / 10`
    : 'Validate your first idea';
  const resumaitActivity = 'Optimize and save your resume';
  const brandForgeActivity = brandForgeActive ? 'Continue where you left off' : 'Build your professional brand';

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/42">Foundrie AI Dashboard</p>
            <h1 className="text-4xl font-bold tracking-normal text-white md:text-6xl">Welcome back{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}</h1>
          </div>
          {isAdmin && <ViewToggle viewAsUser={viewAsUser} onChange={changeViewAsUser} />}
        </div>

        {isAdmin && viewAsUser && (
          <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-[#ffc400]/30 bg-[#ffc400]/10 px-5 py-3 sm:flex-row sm:items-center">
            <p className="inline-flex items-center gap-2 text-sm text-[#ffe08a]">
              <Eye className="h-4 w-4" /> You are previewing the standard user dashboard. Admin surfaces are hidden.
            </p>
            <button
              type="button"
              onClick={() => changeViewAsUser(false)}
              className="text-sm font-bold text-[#ffc400] underline-offset-4 hover:underline"
            >
              Return to admin view
            </button>
          </div>
        )}

        {effectiveAdmin && (
          <AdminCommandCenter
            usersCount={adminUsers?.length || 0}
            reportsCount={adminReportCount}
            isLoading={isAdminUsersLoading}
          />
        )}

        {/* YOUR PRODUCTS — every subscribed suite in one place */}
        <section className="mb-12">
          <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/45">Your products</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ProductCard tool={launchCodeTool} activity={launchCodeActivity} />
            <ProductCard tool={resumaitTool} activity={resumaitActivity} />
            <ProductCard tool={brandForgeTool} activity={brandForgeActivity} />
          </div>
        </section>

        {/* YOUR LAUNCHCODE WORKSPACE */}
        <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-white/45">Your LaunchCode workspace</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <StatCard title="Ideas Validated" value={reports?.length.toString() || '0'} icon={<BarChart className="text-primary h-6 w-6" />} />
          <StatCard title="Average Score" value={`${averageScore} / 10`} icon={<Star className="text-primary h-6 w-6" />} />
        </div>

        <Card className="glass-card mb-8 flex flex-col gap-5 p-6 bg-primary/5 border-primary/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Start something new</p>
            <p className="text-xl font-bold font-headline text-primary">Generate fresh ideas, or validate one you already have</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
            <Button asChild className="shadow-button-primary">
              <Link href="/ideation"><Lightbulb className="mr-2 h-4 w-4" /> Ideation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/new"><CheckCircle2 className="mr-2 h-4 w-4" /> Validation</Link>
            </Button>
          </div>
        </Card>

        {reports && reports.length > 0 && (
          <CrossPromoCard promo={DASHBOARD_BRANDFORGE_PROMO} className="mb-8" />
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold font-headline">Your Validations</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ideas..."
                className="pl-9 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px]">
                  <ListFilter className="mr-2 h-4 w-4" />
                  {getSortLabel()}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('highest-score')}>Highest Score</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('lowest-score')}>Lowest Score</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isReportsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[350px] w-full" />)}
          </div>
        )}

        {!isReportsLoading && processedReports.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
            {hasMoreReports && (
              <div className="mt-10 flex justify-center">
                <MagneticButton
                  variant="ghost"
                  onClick={() => setVisibleCount((c) => c + IDEAS_PER_PAGE)}
                >
                  Show More Ideas &gt;
                </MagneticButton>
              </div>
            )}
          </>
        ) : (
          !isReportsLoading && (
            <Card className="glass-card text-center py-20 px-6">
              <h3 className="text-xl font-bold font-headline">
                {searchQuery ? "No matching ideas found" : "No ideas validated yet"}
              </h3>
              <p className="text-muted-foreground mt-2 mb-6">
                {searchQuery ? "Try a different search term." : "Start by submitting your first startup idea for validation."}
              </p>
              {!searchQuery && (
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <MagneticButton variant="molten" href="/ideation">Help Me Find an Idea &gt;</MagneticButton>
                  <MagneticButton variant="ghost" href="/new">Validate My Idea &gt;</MagneticButton>
                </div>
              )}
            </Card>
          )
        )}
      </main>
      <IdeamaitAssistant
        context={{
          companyName: reports?.[0]?.companyName || 'your venture',
          startupDescription: reports?.[0]?.description || '',
          currentPhaseName: 'Dashboard',
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
        </main>
      </div>
    );
  }

  return <DashboardPageInner />;
}
