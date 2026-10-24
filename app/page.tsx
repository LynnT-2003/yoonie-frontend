"use client";

import { usePlatformPageVm } from "@/modules/platform/viewModel/platformPageVm";
import { PlatformPageView } from "@/modules/platform/view/PlatformPageView";

export default function PlatformRootPage() {
  const vm = usePlatformPageVm();
  return <PlatformPageView vm={vm} />;
}
