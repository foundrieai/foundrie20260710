'use client';
import { industries } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const SectorsGrid = () => {
  return (
    <section id="sectors" className="container py-24 scroll-mt-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold font-headline mb-4">Built for Every Innovation</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From deep-tech to consumer apps, LAUNCHCODE understands the unique dynamics of your sector.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {industries.map((sector) => (
          <Link key={sector} href="/new">
            <Card className="glass-card p-6 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group">
              <span className="font-semibold">{sector}</span>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
