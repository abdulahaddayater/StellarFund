import { NextResponse } from "next/server";
import { listAllCampaigns } from "@/lib/soroban/client";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data";
import { isOnChainMode } from "@/lib/constants";

export async function GET() {
  try {
    if (isOnChainMode) {
      return NextResponse.json(await listAllCampaigns());
    }
    return NextResponse.json(MOCK_CAMPAIGNS);
  } catch (err) {
    console.error("GET /api/campaigns:", err);
    if (isOnChainMode) {
      return NextResponse.json(
        { error: "Failed to load campaigns from chain" },
        { status: 502 },
      );
    }
    return NextResponse.json(MOCK_CAMPAIGNS);
  }
}
