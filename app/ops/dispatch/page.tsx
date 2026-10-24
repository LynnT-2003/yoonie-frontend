"use client";

import { useDispatchPageVm } from "@/modules/ops/dispatch/viewModel/dispatchPageVm";
import { DispatchPageView } from "@/modules/ops/dispatch/view/DispatchPageView";

export default function DispatchPage() {
  const vm = useDispatchPageVm();
  return <DispatchPageView vm={vm} />;
}
