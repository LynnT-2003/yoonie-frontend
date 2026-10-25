import * as React from "react";
import { ProtectedLayoutClient } from "@/modules/auth/ProtectedLayoutClient";
import { OpsNavbar } from "@/modules/layout/OpsNavbar";

export const metadata = {
  title: "Operations Hub | Yoonie",
  description:
    "Yoonie Frontline Hospitality Operations: 05:30 Dispatch Run-Sheet, Housekeeping, & CMS",
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayoutClient>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <OpsNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedLayoutClient>
  );
}
