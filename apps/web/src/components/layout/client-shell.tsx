"use client";

import { ToastProvider } from "@/providers/toast-provider";
import WalletShell from "@/components/layout/wallet-shell";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WalletShell>{children}</WalletShell>
      <ToastProvider />
    </>
  );
}
