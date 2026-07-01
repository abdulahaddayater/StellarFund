import type { CampaignEvent } from "@/lib/types";
import { isOnChainMode } from "@/lib/constants";

const MOCK_EVENTS: Omit<CampaignEvent, "timestamp">[] = [
  { type: "campaign_created", campaignId: 1, data: { title: "Open Source Stellar Explorer" } },
  { type: "contribution", campaignId: 2, data: { amount: 5000000000 } },
  { type: "goal_reached", campaignId: 4, data: { raised: 750000000000 } },
  { type: "campaign_succeeded", campaignId: 4 },
  { type: "contribution", campaignId: 3, data: { amount: 10000000000 } },
  { type: "campaign_failed", campaignId: 5 },
  { type: "campaign_cancelled", campaignId: 6 },
];

export async function GET() {
  const encoder = new TextEncoder();
  let index = 0;
  let eventInterval: ReturnType<typeof setInterval> | undefined;
  let keepAliveInterval: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      if (!isOnChainMode) {
        const sendEvent = () => {
          try {
            const template = MOCK_EVENTS[index % MOCK_EVENTS.length];
            index += 1;
            const event: CampaignEvent = {
              ...template,
              timestamp: Date.now(),
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
          } catch {
            /* stream closed */
          }
        };

        sendEvent();
        eventInterval = setInterval(sendEvent, 8000);
      }

      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          /* stream closed */
        }
      }, 15000);
    },
    cancel() {
      if (eventInterval) clearInterval(eventInterval);
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
