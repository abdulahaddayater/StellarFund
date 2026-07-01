"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CampaignImage } from "@/components/campaign/campaign-image";
import { motion } from "framer-motion";
import { Users, Clock, Target, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchCampaign, submitContribute, submitWithdraw, submitRefund, submitCancel } from "@/lib/api/client";
import type { Campaign } from "@/lib/types";
import { CAMPAIGN_STATUS, STATUS_HELP } from "@/lib/constants";
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
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { HelpBanner, FieldHint } from "@/components/ui/help-banner";

export default function CampaignDetailPage() {
  const params = useParams();
  const { address, isConnected, connect, refreshBalance } = useWallet();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const id = parseInt(String(params.id), 10);

  useEffect(() => {
    if (isNaN(id)) {
      setError("Invalid project ID");
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
  const minXlm = campaign ? campaign.minContribution / 10_000_000 : 0;
  const statusHelp = campaign ? STATUS_HELP[campaign.status] : "";

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
    if (campaign && xlm < minXlm) {
      toast.error(`Minimum contribution is ${formatXlm(campaign.minContribution)} XLM`);
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
        await refreshBalance();
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
        await refreshBalance();
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
          title="Project not found"
          description={error ?? "This project does not exist or was removed."}
          actionLabel="Browse Projects"
          actionHref="/campaigns"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link
          href="/campaigns"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all projects
        </Link>

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
              Created by {truncateAddress(campaign.creator)}
            </p>
            <HelpBanner className="mb-6">{statusHelp}</HelpBanner>
            <h2 className="mb-3 text-lg font-semibold">About this project</h2>
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
                  raised of {formatXlm(campaign.goal)} XLM goal ({progress}%)
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
                  <div className="col-span-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    Minimum contribution: {formatXlm(campaign.minContribution)} XLM
                  </div>
                </div>

                {campaign.status === CAMPAIGN_STATUS.ACTIVE && !isCreator && (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <p className="text-sm font-medium">Support this project</p>
                    {!isConnected ? (
                      <HelpBanner title="Connect your wallet">
                        You need a Stellar wallet to send XLM. Click below to connect
                        Freighter, then enter an amount.
                      </HelpBanner>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="contribute-amount">Amount (XLM)</Label>
                          <Input
                            id="contribute-amount"
                            type="number"
                            placeholder={`At least ${formatXlm(campaign.minContribution)}`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={minXlm}
                            step="0.1"
                          />
                          <FieldHint>
                            Your wallet will ask you to approve this transaction.
                          </FieldHint>
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleContribute}
                          disabled={submitting}
                        >
                          {submitting ? "Processing..." : "Contribute XLM"}
                        </Button>
                      </>
                    )}
                    {!isConnected && (
                      <Button className="w-full" onClick={connect}>
                        Connect Wallet to Contribute
                      </Button>
                    )}
                  </div>
                )}

                {isCreator && campaign.status === CAMPAIGN_STATUS.ACTIVE && (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <HelpBanner variant="warning" title="You created this project">
                      You can cancel it while it is still active. Backers will be able
                      to claim refunds.
                    </HelpBanner>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={submitting}
                      onClick={() =>
                        handleAction(
                          () => submitCancel({ campaignId: id, creator: address! }),
                          "Cancel project",
                        )
                      }
                    >
                      Cancel Project
                    </Button>
                  </div>
                )}

                {isCreator &&
                  campaign.status === CAMPAIGN_STATUS.SUCCEEDED &&
                  !campaign.withdrawn && (
                    <div className="space-y-3 border-t border-white/10 pt-4">
                      <HelpBanner variant="success" title="Goal reached">
                        You can withdraw the raised funds to your wallet.
                      </HelpBanner>
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
                    </div>
                  )}

                {(campaign.status === CAMPAIGN_STATUS.FAILED ||
                  campaign.status === CAMPAIGN_STATUS.CANCELLED) &&
                  !isCreator && (
                    <div className="space-y-3 border-t border-white/10 pt-4">
                      <HelpBanner title="Refund available">
                        This project did not succeed. If you contributed, you can claim
                        your XLM back.
                      </HelpBanner>
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
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
