"use client";

import { WalletProvider } from "@/providers/wallet-provider";
import { Navbar, Footer } from "@/components/layout/navbar";
import { TestnetBanner } from "@/components/layout/testnet-banner";
import { ChunkErrorHandler } from "@/components/layout/chunk-error-handler";

export default function WalletShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <ChunkErrorHandler />
      <Navbar />
      <TestnetBanner />
      <main>{children}</main>
      <Footer />
    </WalletProvider>
  );
}
