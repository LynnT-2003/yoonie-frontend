"use client";

import { useGuestsPageVm } from "@/modules/ops/guests/viewModel/guestsPageVm";
import { GuestsPageView } from "@/modules/ops/guests/view/GuestsPageView";

export default function GuestsPage() {
  const vm = useGuestsPageVm();
  return <GuestsPageView vm={vm} />;
}
