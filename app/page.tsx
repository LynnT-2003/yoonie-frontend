import * as React from "react";
import { headers } from "next/headers";
import { TenantBookingClient } from "@/modules/home/components/TenantBookingClient";
import { PlatformLandingClient } from "@/modules/platform/components/PlatformLandingClient";

function extractTenantSubdomain(host: string): string | null {
  const cleanHost = host.split(":")[0];
  const parts = cleanHost.split(".");

  if (cleanHost.endsWith("localhost") && parts.length > 1) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "ops") return sub;
  }
  if (cleanHost.endsWith("yoonie.si") && parts.length > 2) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "ops") return sub;
  }
  if (cleanHost.endsWith("lvh.me") && parts.length > 2) {
    const sub = parts[0];
    if (sub !== "www" && sub !== "ops") return sub;
  }

  return null;
}

export default async function RootPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const subdomain = extractTenantSubdomain(host);

  if (subdomain) {
    return <TenantBookingClient slug={subdomain} />;
  }

  return <PlatformLandingClient />;
}
