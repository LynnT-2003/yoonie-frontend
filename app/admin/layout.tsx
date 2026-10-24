import * as React from "react";
import { OpsPortalShell } from "@/components/ops/OpsPortalShell";

export const metadata = {
  title: "Property CMS | Yoonie Operations",
  description: "Yoonie Operations Property Content Management System",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OpsPortalShell>{children}</OpsPortalShell>;
}
