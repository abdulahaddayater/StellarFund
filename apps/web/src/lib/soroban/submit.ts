"use client";

import {
  TransactionBuilder,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { KitEventType } from "@creit.tech/stellar-wallets-kit/types";
import { NETWORK_PASSPHRASE } from "@/lib/constants";
import { getStellarWalletsKit } from "@/lib/stellar/wallets-kit";
import { server } from "@/lib/soroban/client";
import { formatWalletError, parseSorobanError } from "@/lib/soroban/errors";

export interface SubmitResult {
  hash: string;
  returnValue?: unknown;
}

type WalletsKit = Awaited<ReturnType<typeof getStellarWalletsKit>>;

function extractFailedTxMessage(
  txResponse: rpc.Api.GetFailedTransactionResponse,
): string {
  const parts: string[] = [];
  if (txResponse.diagnosticEventsXdr?.length) {
    parts.push(...txResponse.diagnosticEventsXdr.map((event) => String(event)));
  }
  if (txResponse.resultXdr) {
    parts.push(txResponse.resultXdr.toString());
  }
  return parts.join(" ") || "Transaction failed on-chain";
}

async function ensureWalletSession(expectedAddress?: string): Promise<string> {
  const kit = await getStellarWalletsKit();

  try {
    const { address } = await kit.getAddress();
    if (expectedAddress && address !== expectedAddress) {
      const { address: refreshed } = await kit.authModal();
      if (expectedAddress && refreshed !== expectedAddress) {
        throw new Error("Connected wallet does not match the expected account.");
      }
      return refreshed;
    }
    return address;
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      String((err as { message: unknown }).message).includes("expected account")
    ) {
      throw err;
    }
    const { address } = await kit.authModal();
    if (expectedAddress && address !== expectedAddress) {
      throw new Error("Connected wallet does not match the expected account.");
    }
    return address;
  }
}

export async function signAndSubmitXdr(
  xdr: string,
  address?: string,
): Promise<SubmitResult> {
  const signer = await ensureWalletSession(address);
  const kit = await getStellarWalletsKit();

  let signedTxXdr: string;
  try {
    ({ signedTxXdr } = await kit.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: signer,
    }));
  } catch (err) {
    throw new Error(formatWalletError(err));
  }

  const tx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const sendResponse = await server.sendTransaction(tx);

  if (sendResponse.status === "ERROR") {
    throw new Error(
      parseSorobanError(
        sendResponse.errorResult?.toString() ??
          "Transaction rejected by network",
      ),
    );
  }

  const txResponse = await server.pollTransaction(sendResponse.hash, {
    attempts: 30,
  });

  if (txResponse.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(
      parseSorobanError(extractFailedTxMessage(txResponse)),
    );
  }

  if (txResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    throw new Error("Transaction submitted but confirmation timed out");
  }

  const returnValue =
    txResponse.status === rpc.Api.GetTransactionStatus.SUCCESS &&
    txResponse.returnValue
      ? scValToNative(txResponse.returnValue)
      : undefined;

  return { hash: sendResponse.hash, returnValue };
}

export function trackWalletModule(kit: WalletsKit): () => void {
  return kit.on(KitEventType.WALLET_SELECTED, (event) => {
    if (event.payload.id) {
      localStorage.setItem("stellarfund_wallet_module", event.payload.id);
    }
  });
}

export async function restoreWalletSession(kit: WalletsKit): Promise<string | null> {
  const moduleId = localStorage.getItem("stellarfund_wallet_module");
  if (!moduleId) return null;

  try {
    kit.setWallet(moduleId);
    const { address } = await kit.getAddress();
    return address;
  } catch {
    localStorage.removeItem("stellarfund_wallet_module");
    localStorage.removeItem("stellarfund_wallet");
    return null;
  }
}
