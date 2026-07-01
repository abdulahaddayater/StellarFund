"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useCampaigns } from "@/hooks/use-campaigns";
import { filterCampaigns, sortCampaigns } from "@/lib/campaigns";
import { CATEGORIES, SORT_OPTIONS, isOnChainMode } from "@/lib/constants";
import type { SortOption } from "@/lib/constants";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { CampaignGridSkeleton } from "@/components/ui/skeleton";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CampaignsPage() {
  const { campaigns, loading, error } = useCampaigns();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("trending");

  const filtered = useMemo(() => {
    const f = filterCampaigns(campaigns, search, category);
    return sortCampaigns(f, sort);
  }, [campaigns, search, category, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">
          Discover and back projects on Stellar Soroban
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="lg:w-48"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="lg:w-48"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((o) => (
          <Button
            key={o.value}
            variant={sort === o.value ? "default" : "secondary"}
            size="sm"
            onClick={() => setSort(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </div>

      {loading && <CampaignGridSkeleton />}
      {error && (
        <EmptyState
          icon="search"
          title="Failed to load"
          description={error}
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon="search"
          title="No campaigns found"
          description={
            isOnChainMode
              ? "No campaigns exist on testnet yet. Create the first one to get started."
              : "Try adjusting your search or filters."
          }
          actionLabel="Create Campaign"
          actionHref="/campaigns/create"
        />
      )}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
