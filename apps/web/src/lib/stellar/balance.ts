import { HORIZON_URL } from "@/lib/constants";

interface HorizonBalance {
  asset_type: string;
  balance: string;
}

interface HorizonAccountResponse {
  balances?: HorizonBalance[];
}

export async function fetchNativeXlmBalance(address: string): Promise<number> {
  const res = await fetch(`${HORIZON_URL}/accounts/${encodeURIComponent(address)}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return 0;
  }

  if (!res.ok) {
    throw new Error("Failed to load XLM balance");
  }

  const data = (await res.json()) as HorizonAccountResponse;
  const native = data.balances?.find((b) => b.asset_type === "native");
  return native ? Number.parseFloat(native.balance) : 0;
}
