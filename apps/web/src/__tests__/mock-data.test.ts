import { describe, it, expect } from "vitest";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data";

describe("mock-data", () => {
  it("has at least 6 mock campaigns", () => {
    expect(MOCK_CAMPAIGNS.length).toBeGreaterThanOrEqual(6);
  });

  it("each campaign has required fields", () => {
    for (const c of MOCK_CAMPAIGNS) {
      expect(c.id).toBeGreaterThan(0);
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.goal).toBeGreaterThan(0);
      expect(c.image).toMatch(/^https:\/\//);
    }
  });

  it("includes multiple categories", () => {
    const categories = new Set(MOCK_CAMPAIGNS.map((c) => c.category));
    expect(categories.size).toBeGreaterThan(3);
  });
});
