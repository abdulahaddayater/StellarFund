"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

const WalletShell = dynamic(() => import("@/components/layout/wallet-shell"), {
  ssr: false,
});

function WalletShellFallback({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-background/70 backdrop-blur-xl" />
      <main>{children}</main>
    </>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Suspense fallback={<WalletShellFallback>{children}</WalletShellFallback>}>
        <WalletShell>{children}</WalletShell>
      </Suspense>
      <ToastProvider />
    </ThemeProvider>
  );
}
