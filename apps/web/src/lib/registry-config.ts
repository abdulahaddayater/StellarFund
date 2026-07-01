import { NextResponse } from "next/server";
import { isOnChainMode } from "@/lib/constants";

export const REGISTRY_NOT_CONFIGURED_MESSAGE =
  "On-chain registry is not configured. Set NEXT_PUBLIC_REGISTRY_ID in your environment.";

/** Use for POST/PUT routes that require Soroban. */
export function requireOnChainMode() {
  if (isOnChainMode) return null;
  return NextResponse.json(
    { error: REGISTRY_NOT_CONFIGURED_MESSAGE },
    { status: 503 },
  );
}
