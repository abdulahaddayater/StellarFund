import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchNativeXlmBalance } from "@/lib/stellar/balance";

describe("fetchNativeXlmBalance", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns native XLM balance from Horizon", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          balances: [
            { asset_type: "native", balance: "125.5000000" },
            {
              asset_type: "credit_alphanum4",
              balance: "10.0000000",
              asset_code: "USDC",
            },
          ],
        }),
      }),
    );

    await expect(
      fetchNativeXlmBalance("GABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234"),
    ).resolves.toBe(125.5);
  });

  it("returns 0 when the account is not funded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(
      fetchNativeXlmBalance("GABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234"),
    ).resolves.toBe(0);
  });
});
