"use client";

import { useRoomVisibilityVm } from "@/modules/ops/rooms/viewModel/roomVisibilityVm";
import { RoomVisibilityView } from "@/modules/ops/rooms/view/RoomVisibilityView";

export default function RoomsVisibilityPage() {
  const vm = useRoomVisibilityVm();
  return <RoomVisibilityView vm={vm} />;
}
