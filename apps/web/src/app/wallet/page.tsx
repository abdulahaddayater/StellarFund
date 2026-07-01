"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  Copy,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/providers/wallet-provider";
import { EXPLORER_NETWORK } from "@/lib/constants";
import { truncateAddress } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { HelpBanner } from "@/components/ui/help-banner";

const setupSteps = [
  "Install the Freighter browser extension",
  "Open Freighter → Settings → switch network to Testnet",
  "Get free test XLM from the Stellar Laboratory faucet",
  "Return here and click Connect Wallet",
];

export default function WalletPage() {
  const { address, isConnected, isConnecting, connect, disconnect } =
    useWallet();

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Wallet"
          description="Your Stellar wallet lets you create projects, contribute XLM, and sign transactions securely."
        />

        {!isConnected ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First-time setup</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {setupSteps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">
                        {index === 2 ? (
                          <>
                            Get free test XLM from the{" "}
                            <a
                              href="https://laboratory.stellar.org/#account-creator?network=test"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 underline hover:text-orange-300"
                            >
                              Stellar Laboratory faucet
                            </a>
                          </>
                        ) : (
                          step
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <EmptyState
              icon="wallet"
              title="No wallet connected"
              description="Connect Freighter or another Stellar wallet to start using StellarFund."
              actionLabel={isConnecting ? "Connecting..." : "Connect Wallet"}
              onAction={connect}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <HelpBanner variant="success" title="Wallet connected">
              You can now browse projects, contribute XLM, or launch your own
              campaign. Your private keys never leave Freighter.
            </HelpBanner>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-orange-400" />
                  Your account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="glass rounded-xl border border-white/10 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">Stellar address</p>
                  <p className="break-all font-mono text-sm">{address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Short form: {truncateAddress(address!, 8)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={copyAddress}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy address
                  </Button>
                  <a
                    href={`https://stellar.expert/explorer/${EXPLORER_NETWORK}/account/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on explorer
                    </Button>
                  </a>
                  <Button variant="destructive" size="sm" onClick={disconnect}>
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Shield,
                  title: "You stay in control",
                  desc: "Every transaction must be approved in your wallet.",
                },
                {
                  icon: Zap,
                  title: "Quick to use",
                  desc: "Sign contributions and launches in a few clicks.",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="flex items-start gap-3 pt-6">
                    <item.icon className="h-6 w-6 text-orange-400" />
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/campaigns">
                <Button variant="secondary">Browse Projects</Button>
              </Link>
              <Link href="/campaigns/create">
                <Button>Start a Project</Button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
