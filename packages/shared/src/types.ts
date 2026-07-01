export type CampaignStatus = "active" | "succeeded" | "failed" | "cancelled";

export interface Campaign {
  id: number;
  title: string;
  description: string;
  image: string;
  creator: string;
  goal: number;
  raised: number;
  deadline: number;
  category: string;
  minContribution: number;
  contributorCount: number;
  status: CampaignStatus;
  withdrawn: boolean;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  succeeded: "Succeeded",
  failed: "Failed",
  cancelled: "Cancelled",
};
