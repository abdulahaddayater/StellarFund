"use client";

import { useCallback, useEffect, useState } from "react";
import type { Campaign } from "@/lib/types";
import { fetchCampaigns } from "@/lib/api/client";

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { campaigns, loading, error, refresh };
}
