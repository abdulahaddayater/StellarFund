"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Megaphone,
  Users,
  Radio,
} from "lucide-react";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useEventStream } from "@/hooks/use-event-stream";
import { useWallet } from "@/providers/wallet-provider";
import { getUserCampaigns, getActiveCampaigns } from "@/lib/campaigns";
import { formatXlm } from "@/lib/utils";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { CampaignGridSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { HelpBanner } from "@/components/ui/help-banner";
import { toast } from "sonner";

export default function DashboardPage() {
  const { campaigns, loading, error, refresh } = useCampaigns();
  const { address } = useWallet();
  const { events, connected } = useEventStream((event) => {
    toast.info(`Project #${event.campaignId}: ${event.type.replace(/_/g, " ")}`);
    refresh();
  });

  const stats = useMemo(() => {
    const active = getActiveCampaigns(campaigns);
    const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0);
    const totalBackers = campaigns.reduce((s, c) => s + c.contributorCount, 0);
    const mine = address ? getUserCampaigns(campaigns, address) : [];
    return { active: active.length, totalRaised, totalBackers, mine };
  }, [campaigns, address]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="My Dashboard"
        description="Track projects you created and see live activity across StellarFund."
        actionLabel="Start a Project"
        actionHref="/campaigns/create"
      />

      {!address && (
        <HelpBanner className="mb-8" title="Connect to see your projects">
          Link your wallet to view campaigns you have created and manage them from
          here.
        </HelpBanner>
      )}

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Megaphone,
            label: "Open projects",
            hint: "Currently accepting contributions",
            value: stats.active,
          },
          {
            icon: TrendingUp,
            label: "Total raised",
            hint: "Across all listed projects",
            value: `${formatXlm(stats.totalRaised)} XLM`,
          },
          {
            icon: Users,
            label: "Total backers",
            hint: "People who contributed",
            value: stats.totalBackers,
          },
          {
            icon: Radio,
            label: "Live updates",
            hint: "Real-time blockchain events",
            value: connected ? "Connected" : "Offline",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15">
                  <s.icon className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.hint}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-xl font-bold">Your projects</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Campaigns created with your connected wallet address.
          </p>
          {!address && (
            <EmptyState
              icon="wallet"
              title="Connect your wallet"
              description="Connect a Stellar wallet to see projects you have created."
              actionLabel="Go to Wallet"
              actionHref="/wallet"
            />
          )}
          {address && loading && <CampaignGridSkeleton count={2} />}
          {address && !loading && stats.mine.length === 0 && (
            <EmptyState
              icon="rocket"
              title="No projects yet"
              description="Launch your first funding campaign — it only takes a few minutes."
              actionLabel="Start a Project"
              actionHref="/campaigns/create"
            />
          )}
          {address && stats.mine.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {stats.mine.map((c, i) => (
                <CampaignCard key={c.id} campaign={c} index={i} />
              ))}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Radio className="h-5 w-5 text-orange-400" />
                Live activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {connected
                    ? "No recent events yet. Contributions and launches will show up here."
                    : "Connecting to event stream..."}
                </p>
              ) : (
                <ul className="max-h-80 space-y-3 overflow-y-auto">
                  {events.slice(0, 10).map((e, i) => (
                    <li
                      key={`${e.timestamp}-${i}`}
                      className="rounded-lg bg-white/5 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-orange-400">
                        Project #{e.campaignId}
                      </span>{" "}
                      {e.type.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
