import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, CategoryBadge } from "@/components/ui/badge";
import { CAMPAIGN_STATUS } from "@/lib/constants";

describe("Badge components", () => {
  it("renders status badge for active", () => {
    render(<StatusBadge status={CAMPAIGN_STATUS.ACTIVE} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders status badge for succeeded", () => {
    render(<StatusBadge status={CAMPAIGN_STATUS.SUCCEEDED} />);
    expect(screen.getByText("Succeeded")).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<CategoryBadge category="Technology" />);
    expect(screen.getByText("Technology")).toBeInTheDocument();
  });
});
