"use client";

import { NETWORK_PASSPHRASE } from "@/lib/constants";

type StellarWalletsKitClass = typeof import("@creit.tech/stellar-wallets-kit/sdk").StellarWalletsKit;

let kitPromise: Promise<StellarWalletsKitClass> | null = null;

function getNetwork() {
  return NETWORK_PASSPHRASE.includes("Test") ? "TESTNET" : "PUBLIC";
}

export async function getStellarWalletsKit(): Promise<StellarWalletsKitClass> {
  if (!kitPromise) {
    kitPromise = (async () => {
      const [sdk, modules, types] = await Promise.all([
        import("@creit.tech/stellar-wallets-kit/sdk"),
        import("@creit.tech/stellar-wallets-kit/modules/utils"),
        import("@creit.tech/stellar-wallets-kit/types"),
      ]);

      const network =
        getNetwork() === "TESTNET"
          ? types.Networks.TESTNET
          : types.Networks.PUBLIC;

      sdk.StellarWalletsKit.init({
        modules: modules.defaultModules(),
        network,
        theme: types.SwkAppDarkTheme,
      });

      return sdk.StellarWalletsKit;
    })();
  }

  return kitPromise;
}

export async function initWalletKitAfterHydration(
  onReady: (kit: StellarWalletsKitClass) => void | (() => void),
): Promise<() => void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  const kit = await getStellarWalletsKit();
  const cleanup = onReady(kit);

  return () => {
    if (typeof cleanup === "function") {
      cleanup();
    }
  };
}
