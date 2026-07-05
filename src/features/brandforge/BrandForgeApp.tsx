'use client';

import React from 'react';
import { ArrowUpRight, BarChart3, CalendarDays, Flame, Inbox, Palette, Radio, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { AnalyticsPage } from './pages/Analytics';
import { BrandGuidesPage } from './pages/BrandGuides';
import { CalendarPage } from './pages/Calendar';
import { InboxPage } from './pages/Inbox';
import { StatusPage } from './pages/Status';
import { StrategyPage } from './pages/Strategy';
import { Layout } from './components/Layout';
import { cn } from './lib/utils';

function OverviewPage() {
  const { addToast, currentIdentity, scheduledPosts, inboxItems, setCurrentPath, connections } = useApp();
  const cards = [
    {
      label: 'Brand identities',
      value: currentIdentity?.displayName || 'Main Brand',
      detail: 'Active voice profile',
      icon: Palette,
    },
    {
      label: 'Scheduled posts',
      value: String(scheduledPosts.length),
      detail: 'Content queued across channels',
      icon: CalendarDays,
    },
    {
      label: 'Inbox signals',
      value: String(inboxItems.length),
      detail: 'Interactions ready for triage',
      icon: Inbox,
    },
    {
      label: 'Connected channels',
      value: String(connections.filter(item => item.status === 'active' && item.accountDisplayName).length),
      detail: 'Simulated dev connections',
      icon: Radio,
    },
  ];

  const moves = [
    {
      title: 'Generate a brand strategy artifact',
      detail: 'Use onboarding inputs or an uploaded profile to create positioning, roadmap, calendar, and opportunities.',
      path: 'strategy',
      icon: Target,
    },
    {
      title: 'Define the voice system',
      detail: 'Set brand traits, tone sliders, style rules, prohibited topics, and platform norms.',
      path: 'guides',
      icon: ShieldCheck,
    },
    {
      title: 'Build the publishing cadence',
      detail: 'Draft, optimize, schedule, and review social posts across LinkedIn, X, Instagram, and Facebook.',
      path: 'calendar',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[rgba(8,7,12,0.72)] p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,196,0,0.18),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(230,0,201,0.18),transparent_38%)]" />
        <div className="relative max-w-4xl">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#ffc400]">BrandForge Command Center &gt;</div>
          <h1 className="text-4xl font-bold uppercase leading-none text-white md:text-6xl">
            Forge the brand system behind the work.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/72">
            Strategy, voice, publishing, inbox response, and analytics in one operating surface for companies and professionals building trust in the AI era of business.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentPath('strategy')}
              className="inline-flex min-h-11 items-center rounded-lg border border-[#ff7a00]/70 bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff0055,#e600c9)] px-5 text-sm font-bold uppercase tracking-[0.14em] text-[#15040b] shadow-[0_0_32px_rgba(255,48,0,0.28)]"
            >
              Start Strategy
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => addToast('BrandForge workspace is ready for dev testing.', 'success')}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-bold uppercase tracking-[0.14em] text-white hover:border-[#ff7a00]/50"
            >
              Verify Workspace
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <card.icon className="h-5 w-5 text-[#ffc400]" />
              <span className="h-2 w-2 rounded-full bg-[#ff0055] shadow-[0_0_16px_rgba(255,0,85,0.75)]" />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/48">{card.label}</div>
            <div className="mt-2 truncate text-2xl font-bold text-white">{card.value}</div>
            <p className="mt-2 text-sm leading-5 text-white/58">{card.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {moves.map(move => (
          <button
            key={move.title}
            onClick={() => setCurrentPath(move.path)}
            className="group min-h-56 rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(244,241,246,0.08),rgba(244,241,246,0.025))] p-6 text-left shadow-xl hover:border-[#ff7a00]/45"
          >
            <move.icon className="h-7 w-7 text-[#ff7a00]" />
            <h2 className="mt-8 text-2xl font-bold leading-tight text-white">{move.title}</h2>
            <p className="mt-4 text-sm leading-6 text-white/62">{move.detail}</p>
            <span className="mt-8 inline-flex items-center text-xs font-bold uppercase tracking-[0.18em] text-[#ffc400]">
              Open module
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

function ListeningPage() {
  const topics = ['Founder credibility', 'AI-era business operations', 'Executive thought leadership', 'Brand trust signals'];

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#ffc400]">Listening &gt;</div>
        <h1 className="text-3xl font-bold uppercase text-white">Market Signal Monitor</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
          A Foundrie-ready listening console for tracking topics, brand mentions, audience questions, and content opportunities.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {topics.map((topic, index) => (
          <div key={topic} className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
            <div className={cn('mb-6 h-1 rounded-full bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff0055,#e600c9)]', index % 2 ? 'w-2/3' : 'w-full')} />
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/46">Signal Stream {index + 1}</div>
            <h2 className="mt-3 text-xl font-bold text-white">{topic}</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">Monitoring queue configured. Live integrations can attach external sources here.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { addToast, connectPlatform, currentIdentity, connections, disconnectPlatform } = useApp();
  const platforms = ['LinkedIn', 'X', 'Instagram', 'Facebook'] as const;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#ffc400]">Settings &gt;</div>
        <h1 className="text-3xl font-bold uppercase text-white">BrandForge Controls</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">Manage dev connections, workspace identity, publishing readiness, and platform controls.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {platforms.map(platform => {
          const connection = connections.find(item => item.identityId === currentIdentity?.id && item.platform === platform && item.status === 'active');
          return (
            <div key={platform} className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{platform}</h2>
                  <p className="mt-2 text-sm text-white/58">{connection?.accountDisplayName || 'Not connected'}</p>
                </div>
                <Flame className="h-5 w-5 text-[#ff7a00]" />
              </div>
              <button
                onClick={() =>
                  connection
                    ? disconnectPlatform(platform)
                    : connectPlatform(platform, `@${platform.toLowerCase()}_demo`)
                }
                className="mt-6 min-h-10 w-full rounded-lg border border-[#ff7a00]/35 bg-white/5 text-xs font-bold uppercase tracking-[0.16em] text-white"
              >
                {connection ? 'Disconnect' : 'Connect Dev Account'}
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => addToast('Settings saved.', 'success')}
        className="inline-flex min-h-11 items-center rounded-lg border border-[#ff7a00]/70 bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff0055,#e600c9)] px-5 text-sm font-bold uppercase tracking-[0.14em] text-[#15040b]"
      >
        Save BrandForge Settings
      </button>
    </div>
  );
}

function AppContent() {
  const { currentPath, loading, setCurrentPath } = useApp();

  const page = (() => {
    switch (currentPath) {
      case 'strategy':
        return <StrategyPage />;
      case 'inbox':
        return <InboxPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'listening':
        return <ListeningPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'guides':
        return <BrandGuidesPage />;
      case 'settings':
        return <SettingsPage />;
      case 'status':
        return <StatusPage />;
      default:
        return <OverviewPage />;
    }
  })();

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center text-white">
        <div className="text-center">
          <BarChart3 className="mx-auto h-8 w-8 animate-pulse text-[#ffc400]" />
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-white/58">Loading BrandForge</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brandforge-skin min-h-[calc(100vh-74px)]">
      <Layout currentPath={currentPath} onNavigate={setCurrentPath}>
        {page}
      </Layout>
    </div>
  );
}

export function BrandForgeApp() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
