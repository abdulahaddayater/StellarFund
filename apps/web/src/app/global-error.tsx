"use client";

import { useEffect } from "react";
import { isChunkOrLoadFailure } from "@/lib/chunk-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const chunkFailure = isChunkOrLoadFailure(error);

  useEffect(() => {
    if (!chunkFailure) return;
    const key = "stellarfund_chunk_reload";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
    }
  }, [chunkFailure]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-3 text-2xl font-bold">
            {chunkFailure ? "App update in progress" : "Something went wrong"}
          </h1>
          <p className="mb-6 text-sm text-white/70">
            {chunkFailure
              ? "The page could not load its scripts. This usually happens after the dev server recompiles. Reload to fetch the latest version."
              : error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (chunkFailure) {
                window.location.reload();
                return;
              }
              reset();
            }}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            {chunkFailure ? "Reload page" : "Try again"}
          </button>
        </div>
      </body>
    </html>
  );
}
