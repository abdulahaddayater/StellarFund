import { describe, it, expect } from "vitest";
import { filterCampaigns, sortCampaigns, getActiveCampaigns, getUserCampaigns } from "@/lib/campaigns";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data";
import { CAMPAIGN_STATUS } from "@/lib/constants";
import { daysRemaining } from "@/lib/utils";

describe("campaigns", () => {
  it("filters by search query", () => {
    const result = filterCampaigns(MOCK_CAMPAIGNS, "explorer", "All");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title.toLowerCase()).toContain("explorer");
  });

  it("filters by category", () => {
    const result = filterCampaigns(MOCK_CAMPAIGNS, "", "Music");
    expect(result.every((c) => c.category === "Music")).toBe(true);
  });

  it("sorts by most funded", () => {
    const sorted = sortCampaigns(MOCK_CAMPAIGNS, "most_funded");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].raised).toBeGreaterThanOrEqual(sorted[i].raised);
    }
  });

  it("sorts by ending soon", () => {
    const now = Date.now() / 1000;
    const sorted = sortCampaigns(MOCK_CAMPAIGNS, "ending_soon", now);
    for (let i = 1; i < sorted.length; i++) {
      expect(daysRemaining(sorted[i - 1].deadline, now)).toBeLessThanOrEqual(
        daysRemaining(sorted[i].deadline, now),
      );
    }
  });

  it("returns active campaigns only", () => {
    const active = getActiveCampaigns(MOCK_CAMPAIGNS);
    expect(active.every((c) => c.status === CAMPAIGN_STATUS.ACTIVE)).toBe(true);
  });

  it("returns user campaigns by creator address", () => {
    const creator = MOCK_CAMPAIGNS[0].creator;
    const mine = getUserCampaigns(MOCK_CAMPAIGNS, creator);
    expect(mine.every((c) => c.creator === creator)).toBe(true);
    expect(mine.length).toBeGreaterThan(0);
  });
});
