"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useHomePageVm } from "@/modules/home/viewModel/homePageVm";
import { HomePageView } from "@/modules/home/view/HomePageView";

export default function TenantStayPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : undefined;
  const vm = useHomePageVm(slug);

  return (
    <div className="flex flex-1 flex-col">
      <HomePageView vm={vm} />
    </div>
  );
}
