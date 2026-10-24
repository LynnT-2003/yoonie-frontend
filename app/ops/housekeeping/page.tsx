"use client";

import { useHousekeepingPageVm } from "@/modules/ops/housekeeping/viewModel/housekeepingPageVm";
import { HousekeepingPageView } from "@/modules/ops/housekeeping/view/HousekeepingPageView";

export default function HousekeepingPage() {
  const vm = useHousekeepingPageVm();
  return <HousekeepingPageView vm={vm} />;
}
