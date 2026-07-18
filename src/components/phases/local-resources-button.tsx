'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ResourceItem = { name: string; description: string; url?: string };
type ResourceCategory = { category: string; items: ResourceItem[] };

export function LocalResourcesButton({
  companyName,
  industry,
  startupDescription,
  location,
}: {
  companyName?: string;
  industry?: string;
  startupDescription?: string;
  location?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loc, setLoc] = useState(location || '');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<ResourceCategory[] | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState('');

  const generate = async () => {
    setIsLoading(true);
    setCategories(null);
    try {
      const res = await fetch('/api/ideamait/local-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: loc.trim() || 'Remote',
          companyName,
          industry,
          startupDescription,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error || !json.data?.categories) {
        throw new Error(json.error || 'Could not generate local resources.');
      }
      setCategories(json.data.categories);
      setResolvedLocation(json.data.location || loc.trim() || 'Remote');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Could not generate resources', description: e?.message || 'Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="lc-secondary-button justify-start"
        onClick={() => setOpen(true)}
      >
        <MapPin className="mr-2 h-4 w-4" />
        Generate local resources
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Local startup ecosystem</DialogTitle>
            <DialogDescription>
              Incubators, grants, government programs, communities, and advisors near you — tailored to your venture.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="local-resources-location">Your location</Label>
              <Input
                id="local-resources-location"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="e.g. Austin, TX or Remote"
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && generate()}
              />
            </div>
            <Button onClick={generate} disabled={isLoading} className="shadow-button-primary">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
              {categories ? 'Regenerate' : 'Generate'}
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Finding resources for {loc.trim() || 'you'}…
            </div>
          )}

          {categories && !isLoading && (
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground">
                Resources for <span className="font-medium text-foreground">{resolvedLocation}</span>. AI-suggested — verify details and eligibility before acting.
              </p>
              {categories.map((cat, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">{cat.category}</h3>
                  <ul className="space-y-3">
                    {cat.items.map((item, j) => (
                      <li key={j} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold">{item.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-primary hover:text-primary/80"
                              aria-label={`Open ${item.name}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
