"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CampaignImage } from "@/components/campaign/campaign-image";
import { motion } from "framer-motion";
import { Users, Clock, Target } from "lucide-react";
import { toast } from "sonner";
import { fetchCampaign, submitContribute, submitWithdraw, submitRefund, submitCancel } from "@/lib/api/client";
import type { Campaign } from "@/lib/types";
import { CAMPAIGN_STATUS } from "@/lib/constants";
import { signAndSubmitXdr } from "@/lib/soroban/submit";
import { formatWalletError } from "@/lib/soroban/errors";
import {
  formatXlm,
  progressPercent,
  truncateAddress,
  daysRemaining,
  xlmToStroops,
} from "@/lib/utils";
import { useWallet } from "@/providers/wallet-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function CampaignDetailPage() {
  const params = useParams();
  const { address, isConnected, connect } = useWallet();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const id = parseInt(String(params.id), 10);

  useEffect(() => {
    if (isNaN(id)) {
      setError("Invalid campaign ID");
      setLoading(false);
      return;
    }
    fetchCampaign(id)
      .then(setCampaign)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isCreator =
    address && campaign?.creator.toLowerCase() === address.toLowerCase();
  const progress = campaign
    ? progressPercent(campaign.raised, campaign.goal)
    : 0;

  async function handleContribute() {
    if (!isConnected || !address) {
      await connect();
      return;
    }
    const xlm = parseFloat(amount);
    if (isNaN(xlm) || xlm <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitContribute({
        campaignId: id,
        contributor: address,
        amount: Number(xlmToStroops(xlm)),
      });
      if (result.mock) {
        toast.success("Contribution submitted (demo mode)");
      } else if (result.xdr) {
        await signAndSubmitXdr(result.xdr, address);
        toast.success("Contribution submitted on-chain");
        setCampaign(await fetchCampaign(id));
      } else {
        toast.success("Transaction prepared — sign in your wallet");
      }
      setAmount("");
    } catch (e) {
      toast.error(formatWalletError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(
    fn: () => Promise<{ success: boolean; mock?: boolean; xdr?: string }>,
    label: string,
  ) {
    if (!address) {
      await connect();
      return;
    }
    setSubmitting(true);
    try {
      const result = await fn();
      if (result.mock) {
        toast.success(`${label} (demo mode)`);
      } else if (result.xdr) {
        await signAndSubmitXdr(result.xdr, address);
        toast.success(`${label} submitted on-chain`);
        setCampaign(await fetchCampaign(id));
      } else {
        toast.success(`${label} — sign in wallet`);
      }
    } catch (e) {
      toast.error(formatWalletError(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-6 h-72 w-full" />
        <Skeleton className="mb-4 h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <EmptyState
          icon="search"
          title="Campaign not found"
          description={error ?? "This campaign does not exist."}
          actionLabel="Browse Campaigns"
          actionHref="/campaigns"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="relative mb-8 h-64 overflow-hidden rounded-2xl sm:h-80">
          <CampaignImage
            src={campaign.image}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <CategoryBadge category={campaign.category} />
            <StatusBadge status={campaign.status} />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="mb-2 text-3xl font-bold">{campaign.title}</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              by {truncateAddress(campaign.creator)}
            </p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {campaign.description}
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-orange-400">
                  {formatXlm(campaign.raised)} XLM
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  raised of {formatXlm(campaign.goal)} XLM goal
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-400" />
                    {campaign.contributorCount} backers
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-400" />
                    {daysRemaining(campaign.deadline)} days left
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    Min {formatXlm(campaign.minContribution)} XLM
                  </div>
                </div>

                {campaign.status === CAMPAIGN_STATUS.ACTIVE && !isCreator && (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <Input
                      type="number"
                      placeholder="Amount in XLM"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={campaign.minContribution / 10_000_000}
                      step="0.1"
                    />
                    <Button
                      className="w-full"
                      onClick={handleContribute}
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Back This Project"}
                    </Button>
                  </div>
                )}

                {isCreator && campaign.status === CAMPAIGN_STATUS.ACTIVE && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={submitting}
                    onClick={() =>
                      handleAction(
                        () => submitCancel({ campaignId: id, creator: address! }),
                        "Cancel campaign",
                      )
                    }
                  >
                    Cancel Campaign
                  </Button>
                )}

                {isCreator &&
                  campaign.status === CAMPAIGN_STATUS.SUCCEEDED &&
                  !campaign.withdrawn && (
                    <Button
                      className="w-full"
                      disabled={submitting}
                      onClick={() =>
                        handleAction(
                          () => submitWithdraw({ campaignId: id, creator: address! }),
                          "Withdraw funds",
                        )
                      }
                    >
                      Withdraw Funds
                    </Button>
                  )}

                {(campaign.status === CAMPAIGN_STATUS.FAILED ||
                  campaign.status === CAMPAIGN_STATUS.CANCELLED) &&
                  !isCreator && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={submitting}
                      onClick={() =>
                        handleAction(
                          () =>
                            submitRefund({
                              campaignId: id,
                              contributor: address!,
                            }),
                          "Claim refund",
                        )
                      }
                    >
                      Claim Refund
                    </Button>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
