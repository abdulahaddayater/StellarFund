export const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Cannot find module '\.\/\d+\.js'|\(timeout:/i;

export function isChunkOrLoadFailure(reason: unknown): boolean {
  if (typeof Event !== "undefined" && reason instanceof Event) {
    return true;
  }

  if (
    typeof reason === "object" &&
    reason !== null &&
    "name" in reason &&
    (reason as { name?: string }).name === "ChunkLoadError"
  ) {
    return true;
  }

  const text =
    reason instanceof Error
      ? `${reason.name} ${reason.message}`
      : typeof reason === "string"
        ? reason
        : String(reason);

  return text === "[object Event]" || CHUNK_ERROR_PATTERN.test(text);
}

/** Inline script injected before React hydrates. */
export const CHUNK_ERROR_RECOVERY_SCRIPT = `
(function () {
  var key = "stellarfund_chunk_reload";
  var pattern = ${CHUNK_ERROR_PATTERN.toString()};
  function shouldRecover(value) {
    if (typeof Event !== "undefined" && value instanceof Event) return true;
    if (value && value.name === "ChunkLoadError") return true;
    var text = value && value.message ? value.name + " " + value.message : String(value || "");
    return text === "[object Event]" || pattern.test(text);
  }
  function recover(value) {
    if (!shouldRecover(value)) return;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      location.reload();
      return;
    }
    sessionStorage.removeItem(key);
  }
  window.addEventListener("unhandledrejection", function (event) {
    recover(event.reason);
  });
  window.addEventListener("error", function (event) {
    recover(event.error || event.message);
  });
  if (sessionStorage.getItem(key) && performance.getEntriesByType("navigation")[0]?.type === "reload") {
    sessionStorage.removeItem(key);
  }
})();
`.trim();
