"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchNativeXlmBalance } from "@/lib/stellar/balance";
import {
  getStellarWalletsKit,
  initWalletKitAfterHydration,
} from "@/lib/stellar/wallets-kit";
import { formatWalletError, isUserCancelledWallet } from "@/lib/soroban/errors";
import { restoreWalletSession, trackWalletModule } from "@/lib/soroban/submit";
import { toast } from "sonner";
import { KitEventType } from "@creit.tech/stellar-wallets-kit/types";

interface WalletContextValue {
  address: string | null;
  xlmBalance: number | null;
  balanceLoading: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!address) {
      setXlmBalance(null);
      return;
    }

    setBalanceLoading(true);
    try {
      const balance = await fetchNativeXlmBalance(address);
      setXlmBalance(balance);
    } catch {
      setXlmBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void initWalletKitAfterHydration((kit) => {
      const untrackModule = trackWalletModule(kit);

      void restoreWalletSession(kit).then((restored) => {
        if (cancelled) return;
        if (restored) {
          setAddress(restored);
          localStorage.setItem("stellarfund_wallet", restored);
        } else {
          localStorage.removeItem("stellarfund_wallet");
        }
      });

      const unsub = kit.on(KitEventType.STATE_UPDATED, (event) => {
        const addr = event.payload.address;
        if (addr) {
          setAddress(addr);
          localStorage.setItem("stellarfund_wallet", addr);
        } else {
          setAddress(null);
          setXlmBalance(null);
          localStorage.removeItem("stellarfund_wallet");
          localStorage.removeItem("stellarfund_wallet_module");
        }
      });

      return () => {
        untrackModule();
        unsub();
      };
    }).then((dispose) => {
      if (!cancelled) cleanup = dispose;
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const kit = await getStellarWalletsKit();
      const { address: addr } = await kit.authModal();
      setAddress(addr);
      localStorage.setItem("stellarfund_wallet", addr);
      toast.success("Wallet connected");
    } catch (err) {
      const message = formatWalletError(err);
      if (!isUserCancelledWallet(err)) {
        toast.error(message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const kit = await getStellarWalletsKit();
      await kit.disconnect();
    } catch {
      /* ignore */
    }
    setAddress(null);
    setXlmBalance(null);
    localStorage.removeItem("stellarfund_wallet");
    localStorage.removeItem("stellarfund_wallet_module");
    toast.info("Wallet disconnected");
  }, []);

  const value = useMemo(
    () => ({
      address,
      xlmBalance,
      balanceLoading,
      isConnected: !!address,
      isConnecting,
      connect,
      disconnect,
      refreshBalance,
    }),
    [
      address,
      xlmBalance,
      balanceLoading,
      isConnecting,
      connect,
      disconnect,
      refreshBalance,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
