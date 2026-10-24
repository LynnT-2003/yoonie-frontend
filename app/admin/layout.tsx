import * as React from "react";
import { ProtectedLayoutClient } from "@/modules/auth/ProtectedLayoutClient";
import { OpsNavbar } from "@/modules/layout/OpsNavbar";

export const metadata = {
  title: "Property CMS | Yoonie Operations",
  description: "Yoonie Operations Property Content Management System",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayoutClient>
      <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] flex flex-col font-sans">
        <OpsNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedLayoutClient>
  );
}
