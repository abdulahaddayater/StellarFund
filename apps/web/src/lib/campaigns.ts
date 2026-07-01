import type { Campaign } from "./types";
import type { SortOption } from "./constants";
import { CAMPAIGN_STATUS } from "./constants";
import { daysRemaining } from "./utils";

export function filterCampaigns(
  campaigns: Campaign[],
  search: string,
  category: string,
): Campaign[] {
  const q = search.trim().toLowerCase();
  return campaigns.filter((c) => {
    const matchesCategory =
      category === "All" || c.category.toLowerCase() === category.toLowerCase();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.creator.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
}

export function sortCampaigns(
  campaigns: Campaign[],
  sort: SortOption,
  now = Date.now() / 1000,
): Campaign[] {
  const sorted = [...campaigns];
  switch (sort) {
    case "most_funded":
      return sorted.sort((a, b) => b.raised - a.raised);
    case "ending_soon":
      return sorted.sort(
        (a, b) =>
          daysRemaining(a.deadline, now) - daysRemaining(b.deadline, now),
      );
    case "newest":
      return sorted.sort((a, b) => b.id - a.id);
    case "trending":
    default:
      return sorted.sort((a, b) => {
        const scoreA =
          a.contributorCount * 2 +
          (a.raised / Math.max(a.goal, 1)) * 100;
        const scoreB =
          b.contributorCount * 2 +
          (b.raised / Math.max(b.goal, 1)) * 100;
        return scoreB - scoreA;
      });
  }
}

export function getActiveCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter((c) => c.status === CAMPAIGN_STATUS.ACTIVE);
}

export function getUserCampaigns(
  campaigns: Campaign[],
  address: string,
): Campaign[] {
  return campaigns.filter(
    (c) => c.creator.toLowerCase() === address.toLowerCase(),
  );
}
