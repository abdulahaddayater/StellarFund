"use client";

import Link from "next/link";
import { useCampaigns } from "@/hooks/use-campaigns";
import { sortCampaigns } from "@/lib/campaigns";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { CampaignGridSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function FeaturedCampaigns() {
  const { campaigns, loading, error } = useCampaigns();
  const featured = sortCampaigns(campaigns, "trending").slice(0, 3);

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Popular projects</h2>
          <Link href="/campaigns">
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        </div>
        <p className="mb-8 text-sm text-muted-foreground">
          Projects getting the most attention right now — click any card to see
          details and contribute.
        </p>
        {loading && <CampaignGridSkeleton count={3} />}
        {error && (
          <EmptyState
            icon="search"
            title="Could not load projects"
            description={error}
            actionLabel="Try again"
            actionHref="/campaigns"
          />
        )}
        {!loading && !error && featured.length === 0 && (
          <EmptyState
            icon="rocket"
            title="No projects yet"
            description="Be the first to launch a funding campaign on Stellar testnet."
            actionLabel="Start a Project"
            actionHref="/campaigns/create"
          />
        )}
        {!loading && featured.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => (
              <CampaignCard key={c.id} campaign={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
