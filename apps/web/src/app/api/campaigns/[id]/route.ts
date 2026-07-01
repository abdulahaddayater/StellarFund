import { NextResponse } from "next/server";
import { getCampaignFromChain } from "@/lib/soroban/client";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data";
import { isOnChainMode } from "@/lib/constants";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const campaignId = parseInt(id, 10);

  if (isNaN(campaignId)) {
    return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
  }

  try {
    if (isOnChainMode) {
      const campaign = await getCampaignFromChain(campaignId);
      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found on-chain" },
          { status: 404 },
        );
      }
      return NextResponse.json(campaign);
    }

    const mock = MOCK_CAMPAIGNS.find((c) => c.id === campaignId);
    if (mock) return NextResponse.json(mock);

    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  } catch (err) {
    console.error(`GET /api/campaigns/${id}:`, err);
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
}
