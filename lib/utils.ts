import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractTenantSubdomain(host: string): string | null {
  const cleanHost = host.split(":")[0];
  const parts = cleanHost.split(".");

  if (cleanHost.endsWith("localhost") && parts.length > 1) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "ops" && sub !== "api") return sub;
  }
  if (
    (cleanHost.endsWith("yoonie.app") ||
      cleanHost.endsWith("yoonie.si") ||
      cleanHost.endsWith("lvh.me")) &&
    parts.length > 2
  ) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "ops" && sub !== "api") return sub;
  }
  // Generic fallback for any multi-tenant domain with subdomains
  if (parts.length > 2) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "ops" && sub !== "api") return sub;
  }

  return null;
}
