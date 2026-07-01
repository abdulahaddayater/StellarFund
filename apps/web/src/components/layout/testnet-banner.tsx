"use client";

import { isOnChainMode } from "@/lib/constants";
import { HelpBanner } from "@/components/ui/help-banner";

export function TestnetBanner() {
  if (!isOnChainMode) return null;

  return (
    <div className="border-b border-white/10 bg-background/90">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <HelpBanner title="Testnet mode">
          You are using Stellar <strong>testnet</strong>. Install{" "}
          <strong>Freighter</strong>, switch it to Testnet, get free test XLM
          from the{" "}
          <a
            href="https://laboratory.stellar.org/#account-creator?network=test"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-orange-300"
          >
            Stellar Laboratory faucet
          </a>
          , then connect your wallet to create or support projects.
        </HelpBanner>
      </div>
    </div>
  );
}
