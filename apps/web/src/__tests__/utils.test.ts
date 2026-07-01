import { describe, it, expect } from "vitest";
import {
  truncateAddress,
  formatXlm,
  xlmToStroops,
  daysRemaining,
  progressPercent,
} from "@/lib/utils";

describe("utils", () => {
  it("truncates long addresses", () => {
    const addr = "GBZXNCGPEY25CUMSYE3RGRHZ7ZHCJ3NJ6BP5P4A3V6GT6GJ7LKK5B5WM";
    expect(truncateAddress(addr)).toBe("GBZXN...B5WM");
  });

  it("returns short addresses unchanged", () => {
    expect(truncateAddress("GABC")).toBe("GABC");
  });

  it("formats XLM from stroops", () => {
    expect(formatXlm(10_000_000)).toBe("1.00");
    expect(formatXlm(1_500_000_000)).toBe("150.00");
  });

  it("converts XLM to stroops", () => {
    expect(xlmToStroops(1)).toBe(10_000_000n);
    expect(xlmToStroops(0.5)).toBe(5_000_000n);
  });

  it("calculates days remaining", () => {
    const now = 1_000_000;
    const deadline = now + 86400 * 5;
    expect(daysRemaining(deadline, now)).toBe(5);
  });

  it("returns 0 days when deadline passed", () => {
    expect(daysRemaining(100, 200)).toBe(0);
  });

  it("calculates progress percent", () => {
    expect(progressPercent(50, 100)).toBe(50);
    expect(progressPercent(150, 100)).toBe(100);
    expect(progressPercent(0, 0)).toBe(0);
  });
});
