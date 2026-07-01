import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}

export function formatXlm(stroops: number | bigint): string {
  const value = Number(stroops) / 10_000_000;
  return formatXlmAmount(value);
}

export function formatXlmAmount(xlm: number): string {
  return xlm.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}

export function daysRemaining(deadline: number, now = Date.now() / 1000): number {
  const diff = deadline - now;
  return Math.max(0, Math.ceil(diff / 86400));
}

export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
