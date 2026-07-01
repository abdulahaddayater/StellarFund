import { describe, expect, it } from "vitest";
import { parseSorobanError, formatWalletError } from "@/lib/soroban/errors";

describe("parseSorobanError", () => {
  it("maps contract error #5 to campaign not found", () => {
    const message =
      'HostError: Error(Contract, #5) contract call failed contribute';
    expect(parseSorobanError(new Error(message))).toContain(
      "Campaign not found on-chain",
    );
  });

  it("returns original message when no contract code is present", () => {
    expect(parseSorobanError(new Error("network timeout"))).toBe(
      "network timeout",
    );
  });
});

describe("formatWalletError", () => {
  it("reads message from wallet kit error objects", () => {
    expect(
      formatWalletError({
        code: -3,
        message:
          'The selected module "Freighter" does not support the "signAndSubmitTransaction" method.',
      }),
    ).toContain("signAndSubmitTransaction");
  });
});

describe("parseSorobanError account errors", () => {
  it("maps account not found errors", () => {
    expect(parseSorobanError(new Error("Account not found: GABC"))).toContain(
      "Fund your testnet account",
    );
  });
});
