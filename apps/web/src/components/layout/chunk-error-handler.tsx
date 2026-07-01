"use client";

import { useEffect } from "react";

const RELOAD_KEY = "stellarfund_chunk_reload";

function isChunkOrLoadFailure(reason: unknown): boolean {
  if (reason instanceof Event) return true;

  const text =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : String(reason);

  return (
    text === "[object Event]" ||
    /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Cannot find module '\.\/\d+\.js'/i.test(
      text,
    )
  );
}

export function ChunkErrorHandler() {
  useEffect(() => {
    function recover(reason: unknown) {
      if (!isChunkOrLoadFailure(reason)) return false;

      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
        return true;
      }

      sessionStorage.removeItem(RELOAD_KEY);
      return false;
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      if (recover(event.reason)) {
        event.preventDefault();
      }
    }

    function onError(event: ErrorEvent) {
      if (recover(event.error ?? event.message)) {
        event.preventDefault();
      }
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);

    sessionStorage.removeItem(RELOAD_KEY);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return null;
}
