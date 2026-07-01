import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();
  let keepAliveInterval: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          /* stream closed */
        }
      }, 15000);
    },
    cancel() {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
