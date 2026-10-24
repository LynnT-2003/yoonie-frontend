"use client";

import * as React from "react";
import { useBranchesQuery } from "@/lib/domain/hospitality/hospitality-api";

export type AdminTab = "BRANCH" | "ROOMS" | "RESTAURANTS" | "SERVICES";

export function useAdminCmsVm() {
  const [activeTab, setActiveTab] = React.useState<AdminTab>("BRANCH");
  const { data: branches = [], isLoading, refetch: refetchBranches } = useBranchesQuery();
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("");

  React.useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0]._id);
    }
  }, [branches, selectedBranchId]);

  const activeBranch = branches.find((b) => b._id === selectedBranchId) || branches[0] || null;

  return {
    activeTab,
    setActiveTab,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    activeBranch,
    isLoading,
    refetchBranches,
  };
}

export type AdminCmsVm = ReturnType<typeof useAdminCmsVm>;
