import type { Campaign } from "@/lib/types";

export async function fetchCampaigns(): Promise<Campaign[]> {
  const res = await fetch("/api/campaigns", { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(err.error ?? "Failed to fetch campaigns");
  }
  return res.json();
}

export async function fetchCampaign(id: number): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Not found" }));
    throw new Error(err.error ?? "Campaign not found");
  }
  return res.json();
}

export async function submitCreateCampaign(data: {
  title: string;
  description: string;
  image: string;
  goal: number;
  deadline: number;
  category: string;
  minContribution: number;
  creator: string;
}): Promise<{ success: boolean; campaignId?: number; xdr?: string; mock?: boolean }> {
  const res = await fetch("/api/campaigns/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error ?? "Failed to create campaign");
  }
  return res.json();
}

export async function submitContribute(data: {
  campaignId: number;
  contributor: string;
  amount: number;
}): Promise<{ success: boolean; xdr?: string; mock?: boolean }> {
  const res = await fetch(`/api/campaigns/${data.campaignId}/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error ?? "Failed to contribute");
  }
  return res.json();
}

export async function submitWithdraw(data: {
  campaignId: number;
  creator: string;
}): Promise<{ success: boolean; xdr?: string; mock?: boolean }> {
  const res = await fetch(`/api/campaigns/${data.campaignId}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error ?? "Failed to withdraw");
  }
  return res.json();
}

export async function submitRefund(data: {
  campaignId: number;
  contributor: string;
}): Promise<{ success: boolean; xdr?: string; mock?: boolean }> {
  const res = await fetch(`/api/campaigns/${data.campaignId}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error ?? "Failed to refund");
  }
  return res.json();
}

export async function submitCancel(data: {
  campaignId: number;
  creator: string;
}): Promise<{ success: boolean; xdr?: string; mock?: boolean }> {
  const res = await fetch(`/api/campaigns/${data.campaignId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed" }));
    throw new Error(err.error ?? "Failed to cancel");
  }
  return res.json();
}
