import { describe, expect, it } from "vitest";
import {
  DEFAULT_CAMPAIGN_IMAGE,
  isAllowedCampaignImageUrl,
  resolveCampaignImageUrl,
} from "@/lib/campaign-image";

describe("campaign-image", () => {
  it("rejects adobe search URLs", () => {
    expect(
      isAllowedCampaignImageUrl("https://stock.adobe.com/search?k=education"),
    ).toBe(false);
  });

  it("accepts unsplash image URLs", () => {
    expect(
      isAllowedCampaignImageUrl(
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
      ),
    ).toBe(true);
  });

  it("falls back for invalid campaign images", () => {
    expect(
      resolveCampaignImageUrl("https://stock.adobe.com/search?k=education"),
    ).toBe(DEFAULT_CAMPAIGN_IMAGE);
  });
});
