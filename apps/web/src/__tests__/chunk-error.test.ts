import { describe, expect, it } from "vitest";
import { isChunkOrLoadFailure } from "@/lib/chunk-error";

describe("isChunkOrLoadFailure", () => {
  it("detects ChunkLoadError by name", () => {
    const error = new Error(
      "Loading chunk app/layout failed.\n(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)",
    );
    error.name = "ChunkLoadError";
    expect(isChunkOrLoadFailure(error)).toBe(true);
  });

  it("detects timeout chunk messages", () => {
    expect(
      isChunkOrLoadFailure(
        new Error(
          "Loading chunk app/layout failed.\n(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)",
        ),
      ),
    ).toBe(true);
  });

  it("detects missing webpack chunk modules", () => {
    expect(isChunkOrLoadFailure(new Error("Cannot find module './873.js'"))).toBe(
      true,
    );
  });

  it("ignores unrelated errors", () => {
    expect(isChunkOrLoadFailure(new Error("network timeout"))).toBe(false);
  });
});
