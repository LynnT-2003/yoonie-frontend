"use client";

import { useServicesPageVm } from "@/modules/ops/services/viewModel/servicesPageVm";
import { ServicesPageView } from "@/modules/ops/services/view/ServicesPageView";

export default function ServicesPage() {
  const vm = useServicesPageVm();
  return <ServicesPageView vm={vm} />;
}
