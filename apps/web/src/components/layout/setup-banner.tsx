"use client";

import { isOnChainMode } from "@/lib/constants";
import { HelpBanner } from "@/components/ui/help-banner";

export function SetupBanner() {
  if (isOnChainMode) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <HelpBanner title="On-chain mode not configured">
          Campaigns are loaded from Soroban only. Set{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_REGISTRY_ID
          </code>{" "}
          in Vercel environment variables, then redeploy. No placeholder
          campaigns are shown.
        </HelpBanner>
      </div>
    </div>
  );
}
