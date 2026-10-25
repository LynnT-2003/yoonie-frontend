"use client";

import * as React from "react";
import { usePlatformPageVm } from "@/modules/platform/viewModel/platformPageVm";
import { PlatformPageView } from "@/modules/platform/view/PlatformPageView";

export function PlatformLandingClient() {
  const vm = usePlatformPageVm();
  return <PlatformPageView vm={vm} />;
}
