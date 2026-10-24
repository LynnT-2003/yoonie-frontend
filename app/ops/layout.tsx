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
      <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] flex flex-col font-sans">
        <OpsNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedLayoutClient>
  );
}
