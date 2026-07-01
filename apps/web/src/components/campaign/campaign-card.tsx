"use client";

import Link from "next/link";
import { CampaignImage } from "@/components/campaign/campaign-image";
import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";
import type { Campaign } from "@/lib/types";
import {
  formatXlm,
  progressPercent,
  truncateAddress,
  daysRemaining,
} from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";

interface CampaignCardProps {
  campaign: Campaign;
  index?: number;
}

export function CampaignCard({ campaign, index = 0 }: CampaignCardProps) {
  const progress = progressPercent(campaign.raised, campaign.goal);
  const days = daysRemaining(campaign.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/campaigns/${campaign.id}`}>
        <Card className="group overflow-hidden transition-all hover:border-orange-500/30 hover:shadow-orange-500/10">
          <div className="relative h-48 overflow-hidden">
            <CampaignImage
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute left-3 top-3 flex gap-2">
              <CategoryBadge category={campaign.category} />
              <StatusBadge status={campaign.status} />
            </div>
          </div>
          <div className="space-y-3 p-5">
            <h3 className="line-clamp-1 text-lg font-bold group-hover:text-orange-400">
              {campaign.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              by {truncateAddress(campaign.creator)}
            </p>
            <Progress value={progress} />
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-bold text-orange-400">
                  {formatXlm(campaign.raised)} XLM
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  of {formatXlm(campaign.goal)}
                </span>
              </div>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {campaign.contributorCount} backers
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {days} days left
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
