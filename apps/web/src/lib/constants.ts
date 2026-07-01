export const CAMPAIGN_STATUS = {
  ACTIVE: 0,
  SUCCEEDED: 1,
  FAILED: 2,
  CANCELLED: 3,
} as const;

export const STATUS_LABELS: Record<number, string> = {
  [CAMPAIGN_STATUS.ACTIVE]: "Active",
  [CAMPAIGN_STATUS.SUCCEEDED]: "Succeeded",
  [CAMPAIGN_STATUS.FAILED]: "Failed",
  [CAMPAIGN_STATUS.CANCELLED]: "Cancelled",
};

export const STATUS_HELP: Record<number, string> = {
  [CAMPAIGN_STATUS.ACTIVE]: "This project is open — you can contribute until the deadline.",
  [CAMPAIGN_STATUS.SUCCEEDED]: "Funding goal was reached. The creator can withdraw.",
  [CAMPAIGN_STATUS.FAILED]: "The goal was not reached. Backers can request a refund.",
  [CAMPAIGN_STATUS.CANCELLED]: "The creator cancelled this project.",
};

export const CATEGORIES = [
  "All",
  "Technology",
  "Art",
  "Music",
  "Film",
  "Games",
  "Community",
  "Education",
  "Environment",
  "Health",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "most_funded", label: "Most Funded" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "newest", label: "Newest" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK === "PUBLIC"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015";

export const REGISTRY_ID = process.env.NEXT_PUBLIC_REGISTRY_ID ?? "";
export const SOROBAN_RPC =
  process.env.NEXT_PUBLIC_SOROBAN_RPC ?? "https://soroban-testnet.stellar.org";

/** When set, the app reads/writes real Soroban contracts — no demo campaign fallback. */
export const isOnChainMode = Boolean(REGISTRY_ID);

export const EXPLORER_NETWORK = NETWORK_PASSPHRASE.includes("Test")
  ? "testnet"
  : "public";
