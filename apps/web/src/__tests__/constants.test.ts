import { describe, it, expect } from "vitest";
import { STATUS_LABELS, CAMPAIGN_STATUS, CATEGORIES } from "@/lib/constants";

describe("constants", () => {
  it("defines all campaign statuses", () => {
    expect(STATUS_LABELS[CAMPAIGN_STATUS.ACTIVE]).toBe("Active");
    expect(STATUS_LABELS[CAMPAIGN_STATUS.SUCCEEDED]).toBe("Succeeded");
    expect(STATUS_LABELS[CAMPAIGN_STATUS.FAILED]).toBe("Failed");
    expect(STATUS_LABELS[CAMPAIGN_STATUS.CANCELLED]).toBe("Cancelled");
  });

  it("includes All in categories", () => {
    expect(CATEGORIES[0]).toBe("All");
    expect(CATEGORIES.length).toBeGreaterThan(5);
  });
});
