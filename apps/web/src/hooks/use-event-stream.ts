"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CampaignEvent } from "@/lib/types";

export function useEventStream(onEvent?: (event: CampaignEvent) => void) {
  const [events, setEvents] = useState<CampaignEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    const source = new EventSource("/api/events/stream");

    source.onopen = () => {
      setConnected(true);
      setError(null);
    };

    source.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as CampaignEvent;
        setEvents((prev) => [event, ...prev].slice(0, 50));
        onEventRef.current?.(event);
      } catch {
        /* ignore malformed */
      }
    };

    source.onerror = () => {
      setConnected(false);
      setError("Event stream disconnected");
      source.close();
    };

    return source;
  }, []);

  useEffect(() => {
    const source = connect();
    return () => source.close();
  }, [connect]);

  return { events, connected, error, reconnect: connect };
}
