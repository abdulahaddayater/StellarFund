"use client";

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
        <h1 className="mb-2 text-3xl font-bold">Wallet</h1>
        <p className="mb-8 text-muted-foreground">
          Connect your Stellar wallet to create and back campaigns
        </p>

        {!isConnected ? (
          <EmptyState
            icon="wallet"
            title="No wallet connected"
            description="Connect Freighter, xBull, or another Stellar wallet via the Wallets Kit."
            actionLabel={isConnecting ? "Connecting..." : "Connect Wallet"}
            onAction={connect}
          />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-orange-400" />
                  Connected Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="glass rounded-xl border border-white/10 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">Address</p>
                  <p className="break-all font-mono text-sm">{address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {truncateAddress(address!, 8)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={copyAddress}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <a
                    href={`https://stellar.expert/explorer/${EXPLORER_NETWORK}/account/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Explorer
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
                  title: "Secure",
                  desc: "Your keys never leave your wallet",
                },
                {
                  icon: Zap,
                  title: "Fast",
                  desc: "Sign transactions in seconds",
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
          </div>
        )}
      </motion.div>
    </div>
  );
}
