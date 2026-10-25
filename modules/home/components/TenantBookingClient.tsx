"use client";

import * as React from "react";
import { useHomePageVm } from "@/modules/home/viewModel/homePageVm";
import { HomePageView } from "@/modules/home/view/HomePageView";

export function TenantBookingClient({ slug }: { slug: string }) {
  const vm = useHomePageVm(slug);

  return (
    <div className="flex flex-1 flex-col">
      <HomePageView vm={vm} />
    </div>
  );
}
