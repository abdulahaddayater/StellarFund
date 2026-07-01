import { NextResponse } from "next/server";
import { listAllCampaigns } from "@/lib/soroban/client";
import { isOnChainMode } from "@/lib/constants";

export async function GET() {
  if (!isOnChainMode) {
    return NextResponse.json([]);
  }

  try {
    return NextResponse.json(await listAllCampaigns());
  } catch (err) {
    console.error("GET /api/campaigns:", err);
    return NextResponse.json(
      { error: "Failed to load campaigns from chain" },
      { status: 502 },
    );
  }
}
