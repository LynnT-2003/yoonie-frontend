"use client";

import { useAdminCmsVm } from "@/modules/admin/viewModel/adminCmsVm";
import { AdminCmsView } from "@/modules/admin/view/AdminCmsView";

export default function AdminPage() {
  const vm = useAdminCmsVm();
  return <AdminCmsView vm={vm} />;
}
