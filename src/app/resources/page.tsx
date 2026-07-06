'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Clock, ListFilter, Plus } from 'lucide-react';
import { resourceArticles, resourceCategories, type ResourceAccent } from '@/lib/resources';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ACCENT_HEX: Record<ResourceAccent, string> = {
  gold: '#ffc400', ember: '#ff7a00', verm: '#ff3000', rose: '#ff0055', mag: '#e600c9',
};

const PAGE_SIZE = 6;

export default function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resourceArticles.filter((a) => {
      const matchesCategory = category === 'All' || a.category === category;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  // Collapse back to the first page whenever the filter or search changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-16 md:py-24">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffc400]">Knowledge &amp; Guides &gt;</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
            Resources
          </h1>
          <p className="mt-5 text-base leading-7 text-white/60 md:text-lg">
            Insights, tools, and guides to help you succeed at every stage of your journey.
          </p>
        </div>

        {/* Search + category filter */}
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
              aria-label="Search resources"
              className="h-11 w-full rounded-full border border-white/12 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#ff7a00]/60 focus:bg-white/[0.06]"
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              aria-label="Filter by category"
              className="h-11 w-full gap-2 rounded-full border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-white md:w-60"
            >
              <ListFilter className="h-4 w-4 text-white/50" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {resourceCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'All' ? 'All categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards */}
        {filtered.length > 0 ? (
          <>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((a) => {
                const accent = ACCENT_HEX[a.accent];
                return (
                  <Link
                    key={a.id}
                    href={a.href}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-[0.2] opacity-80 transition-transform duration-500 group-hover:scale-x-100"
                      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: accent, borderColor: `${accent}55` }}
                      >
                        {a.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">// {a.tags.join(' · ')}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold leading-snug tracking-tight text-white">{a.title}</h3>
                    <p className="mt-3 flex-grow text-sm leading-6 text-white/60 line-clamp-3">{a.excerpt}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
                        <Clock className="h-3.5 w-3.5" />
                        {a.readTime}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: accent }}>
                        Read
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#ff7a00]/60 hover:bg-white/[0.09]"
                >
                  <Plus className="h-4 w-4" />
                  View more
                </button>
                <span className="text-xs text-white/40">
                  Showing {visible.length} of {filtered.length}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <h3 className="text-xl font-bold text-white">No resources found</h3>
            <p className="mt-2 text-white/55">Try a different search term or category.</p>
          </div>
        )}
      </main>
    </div>
  );
}
