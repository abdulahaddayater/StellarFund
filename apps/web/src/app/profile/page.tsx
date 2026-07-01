"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Megaphone, Heart } from "lucide-react";
import { useWallet } from "@/providers/wallet-provider";
import { useCampaigns } from "@/hooks/use-campaigns";
import { getUserCampaigns } from "@/lib/campaigns";
import { truncateAddress, formatXlm } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CampaignGridSkeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { address, isConnected, connect } = useWallet();
  const { campaigns, loading } = useCampaigns();

  const myCampaigns = useMemo(
    () => (address ? getUserCampaigns(campaigns, address) : []),
    [campaigns, address],
  );

  const totalRaised = myCampaigns.reduce((s, c) => s + c.raised, 0);

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EmptyState
          icon="wallet"
          title="Connect to view profile"
          description="Your profile shows campaigns you've created and activity on StellarFund."
          actionLabel="Connect Wallet"
          onAction={connect}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="font-mono text-sm text-muted-foreground">
              {truncateAddress(address!, 8)}
            </p>
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Megaphone className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">{myCampaigns.length}</p>
                <p className="text-sm text-muted-foreground">Campaigns Created</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Heart className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">{formatXlm(totalRaised)}</p>
                <p className="text-sm text-muted-foreground">Total Raised (XLM)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="text-lg font-bold text-orange-400">Soroban Testnet</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Campaigns</h2>
          <Link href="/campaigns/create">
            <Button size="sm">Create New</Button>
          </Link>
        </div>

        {loading && <CampaignGridSkeleton count={2} />}
        {!loading && myCampaigns.length === 0 && (
          <EmptyState
            icon="rocket"
            title="No campaigns yet"
            description="Start your first crowdfunding campaign on Stellar."
            actionLabel="Create Campaign"
            actionHref="/campaigns/create"
          />
        )}
        {!loading && myCampaigns.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myCampaigns.map((c, i) => (
              <CampaignCard key={c.id} campaign={c} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
