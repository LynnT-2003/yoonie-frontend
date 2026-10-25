"use client";

import { Suspense } from "react";
import { useDispatchPageVm } from "@/modules/ops/dispatch/viewModel/dispatchPageVm";
import { DispatchPageView } from "@/modules/ops/dispatch/view/DispatchPageView";

function DispatchPageInner() {
  const vm = useDispatchPageVm();
  return <DispatchPageView vm={vm} />;
}

export default function DispatchPage() {
  return (
    <Suspense>
      <DispatchPageInner />
    </Suspense>
  );
}
