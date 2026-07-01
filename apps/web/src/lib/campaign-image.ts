export const DEFAULT_CAMPAIGN_IMAGE =
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80";

const ALLOWED_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
]);

export function isAllowedCampaignImageUrl(image: string): boolean {
  try {
    const url = new URL(image);
    if (url.protocol !== "https:") return false;
    if (!ALLOWED_IMAGE_HOSTS.has(url.hostname)) return false;
    if (url.pathname === "/search") return false;
    return true;
  } catch {
    return false;
  }
}

export function resolveCampaignImageUrl(image?: string | null): string {
  if (!image || !isAllowedCampaignImageUrl(image)) {
    return DEFAULT_CAMPAIGN_IMAGE;
  }
  return image;
}
