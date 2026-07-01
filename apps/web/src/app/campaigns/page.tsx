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
import { PageHeader } from "@/components/ui/page-header";

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
      <PageHeader
        title="Browse Projects"
        description="Find a project to support with XLM. Each listing shows how much has been raised, the deadline, and the minimum contribution."
        actionLabel="Start a Project"
        actionHref="/campaigns/create"
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search campaigns"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="lg:w-48"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All categories" : c}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm text-muted-foreground">Sort by</p>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {loading && <CampaignGridSkeleton />}
      {error && (
        <EmptyState
          icon="search"
          title="Could not load projects"
          description={error}
          actionLabel="Try again"
          actionHref="/campaigns"
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon="rocket"
          title={search || category !== "All" ? "No matching projects" : "No projects yet"}
          description={
            search || category !== "All"
              ? "Try a different search or category filter."
              : isOnChainMode
                ? "Be the first person to launch a funding campaign on testnet."
                : "Connect the registry contract via NEXT_PUBLIC_REGISTRY_ID to load real campaigns."
          }
          actionLabel="Start a Project"
          actionHref="/campaigns/create"
        />
      )}
      {!loading && filtered.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Showing {filtered.length} project{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <CampaignCard key={c.id} campaign={c} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
