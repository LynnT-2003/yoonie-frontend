import * as React from "react";
import { headers } from "next/headers";
import { TenantBookingClient } from "@/modules/home/components/TenantBookingClient";
import { PlatformLandingClient } from "@/modules/platform/components/PlatformLandingClient";

import { extractTenantSubdomain } from "@/lib/utils";

export default async function RootPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const subdomain = extractTenantSubdomain(host);

  if (subdomain) {
    return <TenantBookingClient slug={subdomain} />;
  }

  return <PlatformLandingClient />;
}
