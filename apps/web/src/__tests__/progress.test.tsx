import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Progress } from "@/components/ui/progress";

describe("Progress", () => {
  it("renders with correct width", () => {
    const { container } = render(<Progress value={75} />);
    const bar = container.querySelector("[style*='width']");
    expect(bar).toBeTruthy();
    expect((bar as HTMLElement).style.width).toBe("75%");
  });

  it("clamps value to 0-100", () => {
    const { container } = render(<Progress value={150} />);
    const bar = container.querySelector("[style*='width']") as HTMLElement;
    expect(bar.style.width).toBe("100%");
  });
});
