import {
  Contract,
  Account,
  rpc,
  scValToNative,
  nativeToScVal,
  TransactionBuilder,
  BASE_FEE,
  xdr,
} from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE, REGISTRY_ID, SOROBAN_RPC } from "../constants";
import type { Campaign } from "../types";

const server = new rpc.Server(SOROBAN_RPC);

function getContract(): Contract | null {
  if (!REGISTRY_ID) return null;
  try {
    return new Contract(REGISTRY_ID);
  } catch {
    return null;
  }
}

function toNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  return Number(value);
}

function parseCampaign(raw: Record<string, unknown>): Campaign {
  return {
    id: Number(raw.id),
    creator: String(raw.creator),
    goal: toNumber(raw.goal),
    raised: toNumber(raw.raised),
    deadline: Number(raw.deadline),
    category: String(raw.category),
    image: String(raw.image),
    title: String(raw.title),
    description: String(raw.description),
    minContribution: toNumber(raw.min_contribution),
    contributorCount: Number(raw.contributor_count),
    status: Number(raw.status),
    withdrawn: Boolean(raw.withdrawn),
  };
}

async function simulateRead<T>(
  fn: string,
  args: xdr.ScVal[],
): Promise<T | null> {
  const contract = getContract();
  if (!contract) return null;

  const source = new Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0",
  );

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(fn, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  if (!sim.result?.retval) return null;
  return scValToNative(sim.result.retval) as T;
}

export async function listCampaignIds(): Promise<number[] | null> {
  const result = await simulateRead<number[]>("list_campaigns", []);
  return result;
}

export async function getCampaignFromChain(
  id: number,
): Promise<Campaign | null> {
  const raw = await simulateRead<Record<string, unknown>>("get_campaign", [
    nativeToScVal(id, { type: "u32" }),
  ]);
  if (!raw) return null;
  return parseCampaign(raw);
}

export async function getBalanceFromChain(id: number): Promise<number | null> {
  const result = await simulateRead<number>("get_balance", [
    nativeToScVal(id, { type: "u32" }),
  ]);
  return result;
}

export async function getContributorsFromChain(
  id: number,
): Promise<number | null> {
  const result = await simulateRead<number>("get_contributors", [
    nativeToScVal(id, { type: "u32" }),
  ]);
  return result;
}

export async function listAllCampaigns(): Promise<Campaign[]> {
  const ids = await listCampaignIds();
  if (!ids || ids.length === 0) return [];

  const campaigns = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getCampaignFromChain(id);
      } catch {
        return null;
      }
    }),
  );

  return campaigns.filter((c): c is Campaign => c !== null);
}

export function buildContractCall(
  fn: string,
  args: xdr.ScVal[],
): { contract: Contract; operation: xdr.Operation } | null {
  const contract = getContract();
  if (!contract) return null;
  return {
    contract,
    operation: contract.call(fn, ...args),
  };
}

export { server, nativeToScVal, scValToNative, Contract };
