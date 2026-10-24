"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import type { HousekeepingPageVm } from "../viewModel/housekeepingPageVm";
import type { RoomItem, RoomCleaningStatus } from "@/lib/types/hospitality";

const STATUS_CONFIG: Record<
  RoomCleaningStatus,
  {
    title: string;
    pillBg: string;
    textColor: string;
    actionLabel: string;
    icon: typeof Sparkles;
  }
> = {
  DIRTY: {
    title: "Needs Cleaning",
    pillBg: "bg-red-500/10 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900",
    textColor: "text-red-700 dark:text-red-400",
    actionLabel: "Start Cleaning",
    icon: ShieldAlert,
  },
  IN_PROGRESS: {
    title: "In Progress",
    pillBg: "bg-[#E8A45B]/15 text-[#E8A45B] border-[#E8A45B]/30",
    textColor: "text-[#E8A45B]",
    actionLabel: "Mark Cleaned",
    icon: Clock,
  },
  CLEAN: {
    title: "Clean · Awaiting Sign-off",
    pillBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    textColor: "text-blue-700 dark:text-blue-400",
    actionLabel: "Inspect & Sign Off",
    icon: Sparkles,
  },
  INSPECTED: {
    title: "Inspected & Ready",
    pillBg: "bg-[#28594E]/10 text-[#28594E] dark:bg-[#28594E]/30 dark:text-[#D8E6DA] border-[#28594E]/20",
    textColor: "text-[#28594E] dark:text-[#D8E6DA]",
    actionLabel: "Reset",
    icon: CheckCircle2,
  },
};

function RoomCard({
  room,
  onAdvance,
}: {
  room: RoomItem;
  onAdvance: (roomId: string, current: RoomCleaningStatus) => void;
}) {
  const cfg = STATUS_CONFIG[room.cleaningStatus];
  const isVipCandidate = room.roomType === "POOL_VILLA" || room.roomNumber === "105" || room.roomNumber === "305";

  return (
    <div className="rounded-2xl bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-[#28594E]/40 transition duration-200">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-[#28594E] dark:text-[#F5EBDD] font-mono">
              {room.roomNumber}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#F8F5EE] dark:bg-[#1A2521] text-[#6B7B74] border border-[#E5DBD0] dark:border-[#2D3D36]">
              Fl. {room.floor}
            </span>
          </div>

          {isVipCandidate ? (
            <span className="px-2 py-0.5 rounded-full bg-[#E8A45B]/20 text-[#303A36] dark:text-[#E8A45B] text-[10px] font-bold">
              VIP ETA
            </span>
          ) : null}
        </div>

        <p className="text-xs font-semibold text-[#303A36] dark:text-[#D8E6DA] mt-1.5">
          {room.roomType.replace(/_/g, " ")}
        </p>

        <div className="flex flex-wrap gap-1 mt-2">
          {room.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#F8F5EE] dark:bg-[#17201D] text-[#6B7B74] dark:text-[#8FA299]"
            >
              {a.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[#E5DBD0]/50 dark:border-[#2D3D36]/50 flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.pillBg}`}>
          {cfg.title}
        </span>

        <Button
          size="sm"
          onClick={() => onAdvance(room._id, room.cleaningStatus)}
          className={`h-7 px-3 text-xs font-bold rounded-xl transition ${
            room.cleaningStatus === "DIRTY"
              ? "bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD]"
              : room.cleaningStatus === "IN_PROGRESS"
              ? "bg-[#E8A45B] hover:bg-[#D9964E] text-[#303A36]"
              : room.cleaningStatus === "CLEAN"
              ? "bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD]"
              : "bg-transparent hover:bg-[#E5DBD0]/40 text-[#6B7B74] border border-[#E5DBD0]"
          }`}
        >
          {cfg.actionLabel}
        </Button>
      </div>
    </div>
  );
}

export function HousekeepingPageView({ vm }: { vm: HousekeepingPageVm }) {
  const {
    branch,
    board,
    totalRooms,
    inspectedPercentage,
    advanceRoomStatus,
  } = vm;

  const allClear = board.dirty.length === 0 && board.inProgress.length === 0;

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] dark:bg-[#17201D] dark:text-[#F5EBDD] py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* ─── Header & Mascot Bar ────────────────────────────────────────────── */}
      <div id="tour-hk-header" className="rounded-3xl bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <YoonieMascot
            mood={allClear ? "sleeping" : board.dirty.length > 2 ? "worried" : "checking"}
            size="md"
            badge="HK Lead"
            message={
              allClear
                ? "Front-Desk Zero! Every room is green and ready."
                : `${board.dirty.length} rooms prioritized by guest arrival ETA!`
            }
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#28594E]/10 text-[#28594E] dark:text-[#D8E6DA] text-xs font-bold uppercase tracking-wider">
                Front-Desk Zero Engine
              </span>
              <span className="text-xs text-[#6B7B74] dark:text-[#8FA299]">
                {branch?.name || "BKK Riverside"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E] dark:text-[#F5EBDD] font-sans mt-1">
              Housekeeping Command Board
            </h1>
            <p className="text-xs text-[#6B7B74] dark:text-[#8FA299] mt-0.5">
              Clean rooms in arrival-ETA & VIP priority order, not numeric order.
            </p>
          </div>
        </div>

        {/* Progress gauge */}
        <div className="flex items-center gap-4 bg-[#F8F5EE] dark:bg-[#17201D] p-4 rounded-2xl border border-[#E5DBD0] dark:border-[#2D3D36]">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase text-[#6B7B74]">
              Ready for Handover
            </span>
            <span className="text-2xl font-extrabold text-[#28594E] dark:text-[#D8E6DA]">
              {inspectedPercentage}%
            </span>
            <span className="text-[10px] text-[#6B7B74]">
              {board.inspected.length} of {totalRooms} rooms
            </span>
          </div>

          <div className="w-16 h-16 rounded-full border-4 border-[#28594E] flex items-center justify-center font-bold text-xs text-[#28594E] dark:text-[#D8E6DA]">
            {inspectedPercentage}%
          </div>
        </div>
      </div>

      {/* ─── 4 Columns Kanban ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Dirty */}
        <div id="tour-hk-dirty-column" className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-500">
            <span className="text-xs font-extrabold tracking-wider text-red-600 dark:text-red-400 uppercase flex items-center gap-1.5">
              <ShieldAlert className="size-4" /> Dirty ({board.dirty.length})
            </span>
            <span className="text-[10px] font-bold text-[#6B7B74]">ETA Ranked</span>
          </div>

          <div className="flex flex-col gap-3">
            {board.dirty.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-[#202C27]/60 border border-dashed border-[#E5DBD0] text-center text-xs text-[#6B7B74]">
                No dirty rooms! ✨
              </div>
            ) : (
              board.dirty.map((room) => (
                <RoomCard key={room._id} room={room} onAdvance={advanceRoomStatus} />
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#E8A45B]">
            <span className="text-xs font-extrabold tracking-wider text-[#E8A45B] uppercase flex items-center gap-1.5">
              <Clock className="size-4" /> In Progress ({board.inProgress.length})
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {board.inProgress.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-[#202C27]/60 border border-dashed border-[#E5DBD0] text-center text-xs text-[#6B7B74]">
                No cleanings in progress
              </div>
            ) : (
              board.inProgress.map((room) => (
                <RoomCard key={room._id} room={room} onAdvance={advanceRoomStatus} />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Clean */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-blue-500">
            <span className="text-xs font-extrabold tracking-wider text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1.5">
              <Sparkles className="size-4" /> Clean ({board.clean.length})
            </span>
            <span className="text-[10px] font-bold text-[#6B7B74]">Awaiting Sign-off</span>
          </div>

          <div className="flex flex-col gap-3">
            {board.clean.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-[#202C27]/60 border border-dashed border-[#E5DBD0] text-center text-xs text-[#6B7B74]">
                All clean rooms inspected
              </div>
            ) : (
              board.clean.map((room) => (
                <RoomCard key={room._id} room={room} onAdvance={advanceRoomStatus} />
              ))
            )}
          </div>
        </div>

        {/* Column 4: Inspected */}
        <div id="tour-hk-inspected-column" className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#28594E]">
            <span className="text-xs font-extrabold tracking-wider text-[#28594E] dark:text-[#D8E6DA] uppercase flex items-center gap-1.5">
              <CheckCircle2 className="size-4" /> Inspected ({board.inspected.length})
            </span>
            <span className="text-[10px] font-bold text-[#28594E]">Key Ready</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1">
            {board.inspected.map((room) => (
              <RoomCard key={room._id} room={room} onAdvance={advanceRoomStatus} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
