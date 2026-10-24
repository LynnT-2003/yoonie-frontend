import * as React from "react";
import { OpsPortalShell } from "@/components/ops/OpsPortalShell";

export const metadata = {
  title: "Operations Hub | Yoonie",
  description:
    "Yoonie Frontline Hospitality Operations: 05:30 Dispatch Run-Sheet, Housekeeping, & CMS",
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return <OpsPortalShell>{children}</OpsPortalShell>;
}
