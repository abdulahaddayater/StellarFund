"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Networks, KitEventType } from "@creit.tech/stellar-wallets-kit/types";
import { NETWORK_PASSPHRASE } from "@/lib/constants";
import { formatWalletError, isUserCancelledWallet } from "@/lib/soroban/errors";
import {
  restoreWalletSession,
  trackWalletModule,
} from "@/lib/soroban/submit";
import { toast } from "sonner";

interface WalletContextValue {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function getNetwork(): Networks {
  return NETWORK_PASSPHRASE.includes("Test")
    ? Networks.TESTNET
    : Networks.PUBLIC;
}

let kitInitialized = false;

function ensureKit() {
  if (!kitInitialized && typeof window !== "undefined") {
    StellarWalletsKit.init({
      modules: defaultModules(),
      network: getNetwork(),
    });
    kitInitialized = true;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    ensureKit();

    const untrackModule = trackWalletModule();

    restoreWalletSession().then((restored) => {
      if (restored) {
        setAddress(restored);
        localStorage.setItem("stellarfund_wallet", restored);
      } else {
        localStorage.removeItem("stellarfund_wallet");
      }
    });

    const unsub = StellarWalletsKit.on(
      KitEventType.STATE_UPDATED,
      (event) => {
        const addr = event.payload.address;
        if (addr) {
          setAddress(addr);
          localStorage.setItem("stellarfund_wallet", addr);
        } else {
          setAddress(null);
          localStorage.removeItem("stellarfund_wallet");
          localStorage.removeItem("stellarfund_wallet_module");
        }
      },
    );

    return () => {
      untrackModule();
      unsub();
    };
  }, []);

  const connect = useCallback(async () => {
    ensureKit();
    setIsConnecting(true);
    try {
      const { address: addr } = await StellarWalletsKit.authModal();
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
    ensureKit();
    try {
      await StellarWalletsKit.disconnect();
    } catch {
      /* ignore */
    }
    setAddress(null);
    localStorage.removeItem("stellarfund_wallet");
    localStorage.removeItem("stellarfund_wallet_module");
    toast.info("Wallet disconnected");
  }, []);

  const value = useMemo(
    () => ({
      address,
      isConnected: !!address,
      isConnecting,
      connect,
      disconnect,
    }),
    [address, isConnecting, connect, disconnect],
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

export { StellarWalletsKit };
