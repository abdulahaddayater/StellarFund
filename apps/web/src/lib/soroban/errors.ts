const CAMPAIGN_CONTRACT_ERRORS: Record<number, string> = {
  1: "Unauthorized — connect the wallet that owns this campaign.",
  2: "Invalid funding goal.",
  3: "Invalid deadline.",
  4: "Invalid minimum contribution.",
  5: "Campaign not found on-chain. Create a campaign first or refresh the list.",
  6: "This campaign is no longer active.",
  7: "The campaign deadline has passed.",
  8: "Contribution is below the minimum amount.",
  9: "Campaign creators cannot contribute to their own campaign.",
  10: "Funding goal has not been reached yet.",
  11: "Deadline has not passed yet.",
  12: "Funds have already been withdrawn.",
  13: "Campaign already succeeded.",
  14: "Campaign did not fail — refunds are unavailable.",
  15: "Refund already claimed.",
  16: "Nothing to refund for this address.",
  17: "Invalid campaign title.",
  18: "Campaign is already cancelled.",
};

export function parseSorobanError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  const contractMatch = message.match(/Error\(Contract,\s*#(\d+)\)/);
  if (contractMatch) {
    const code = Number(contractMatch[1]);
    return CAMPAIGN_CONTRACT_ERRORS[code] ?? `Contract error #${code}`;
  }

  if (/CampaignNotFound|contract error.*\b5\b/i.test(message)) {
    return CAMPAIGN_CONTRACT_ERRORS[5];
  }

  if (/not found|404|Could not find account/i.test(message)) {
    return "Stellar account not found. Fund your testnet account at https://laboratory.stellar.org first.";
  }

  return message;
}

export function formatWalletError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  if (typeof err === "string" && err.length > 0) return err;
  return "Transaction failed";
}
