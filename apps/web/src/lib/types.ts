export interface Campaign {
  id: number;
  creator: string;
  goal: number;
  raised: number;
  deadline: number;
  category: string;
  image: string;
  title: string;
  description: string;
  minContribution: number;
  contributorCount: number;
  status: number;
  withdrawn: boolean;
}

export interface CampaignEvent {
  type:
    | "campaign_created"
    | "contribution"
    | "goal_reached"
    | "campaign_succeeded"
    | "campaign_failed"
    | "campaign_cancelled"
    | "withdraw"
    | "refund";
  campaignId: number;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface ApiError {
  error: string;
  code?: string;
}
