/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Crown,
  ExternalLink,
  Eye,
  Filter,
  LayoutGrid,
  MapPin,
  Maximize2,
  Phone,
  Plane,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import type {
  RoomVisibilityVm,
  StatusFilter,
  ViewMode,
} from "../viewModel/roomVisibilityVm";
import type {
  LiveRoomItem,
  RoomCleaningStatus,
  TimelineBooking,
} from "@/lib/types/hospitality";

const CLEANING_CONFIG: Record<
  RoomCleaningStatus,
  {
    title: string;
    pillBg: string;
    textColor: string;
    actionLabel: string;
    dotColor: string;
  }
> = {
  DIRTY: {
    title: "Needs Cleaning",
    pillBg: "bg-red-50 text-red-700 border-red-200",
    textColor: "text-red-700",
    actionLabel: "Start Cleaning",
    dotColor: "bg-red-500",
  },
  IN_PROGRESS: {
    title: "Cleaning in Progress",
    pillBg: "bg-[#E8A45B]/15 text-[#DF9B52] border-[#E8A45B]/30",
    textColor: "text-[#DF9B52]",
    actionLabel: "Mark Cleaned",
    dotColor: "bg-[#E8A45B]",
  },
  CLEAN: {
    title: "Clean · Awaiting Sign-off",
    pillBg: "bg-sky-50 text-sky-700 border-sky-200",
    textColor: "text-sky-700",
    actionLabel: "Inspect & Sign Off",
    dotColor: "bg-sky-500",
  },
  INSPECTED: {
    title: "Inspected & Ready",
    pillBg: "bg-[#28594E]/10 text-[#28594E] border-[#28594E]/20",
    textColor: "text-[#28594E]",
    actionLabel: "Guest Ready",
    dotColor: "bg-[#28594E]",
  },
};

const VIP_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  PLATINUM: {
    label: "VIP Platinum",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
  },
  GOLD: {
    label: "VIP Gold",
    badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200 font-bold",
  },
  SILVER: {
    label: "Silver",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 font-semibold",
  },
  NONE: {
    label: "Standard",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
};

export function RoomVisibilityView({ vm }: { vm: RoomVisibilityVm }) {
  const {
    branch,
    selectedDate,
    setSelectedDate,
    timelineDates,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    floorFilter,
    setFloorFilter,
    searchQuery,
    setSearchQuery,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    summary,
    rooms,
    allRooms,
    timeline,
    isLoading,
    isUpdating,
    advanceRoomStatus,
    setRoomStatus,
    refetch,
  } = vm;

  // Group filtered rooms by floor
  const floorGroups = React.useMemo(() => {
    const groups: Record<string, LiveRoomItem[]> = {};
    for (const room of rooms) {
      const key =
        room.roomType === "POOL_VILLA"
          ? "Penthouse Villas"
          : `Floor ${room.floor}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(room);
    }
    return groups;
  }, [rooms]);

  // Map timeline bookings by room number for rapid lookup in Tape Chart
  const timelineMap = React.useMemo(() => {
    const map = new Map<string, TimelineBooking[]>();
    for (const item of timeline) {
      if (!map.has(item.roomNumber)) {
        map.set(item.roomNumber, []);
      }
      map.get(item.roomNumber)!.push(item);
    }
    return map;
  }, [timeline]);

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] pb-24">
      {/* ─── Top Operational Command Header ─────────────────────────────── */}
      <div className="border-b border-[#28594E]/15 bg-white/80 backdrop-blur-md sticky top-16 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Mascot */}
            <div className="flex items-center gap-3.5">
              <YoonieMascot mood="checking" size="sm" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#E8A45B]">
                    Live Room Operations
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-xs font-bold text-[#6B7B74]">
                    {branch?.name || "BKK Riverside Boutique Hotel"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E] font-sans mt-0.5">
                  Room Visibility & Tape Chart
                </h1>
                <p className="text-xs text-[#7A8B84] font-medium mt-0.5">
                  Complete operational clarity on every key: live occupancy, stay length, flight ETAs, and turnaround status.
                </p>
              </div>
            </div>

            {/* Operating Date & View Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Input */}
              <div className="flex items-center gap-2 bg-[#F8F5EE] px-3.5 py-2 rounded-xl border border-[#28594E]/15 shadow-xs">
                <Calendar className="size-4 text-[#28594E] shrink-0" />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7B74] block leading-none">
                    Target Business Date
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs font-extrabold bg-transparent border-0 p-0 text-[#28594E] focus:ring-0 cursor-pointer mt-0.5"
                  />
                </div>
              </div>

              {/* View Mode Toggle: Matrix vs Tape Chart */}
              <div className="flex items-center bg-[#F8F5EE] p-1 rounded-xl border border-[#28594E]/15 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("MATRIX")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === "MATRIX"
                      ? "bg-[#28594E] text-[#F5EBDD] shadow-xs"
                      : "text-[#6B7B74] hover:text-[#303A36]"
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                  40-Key Board
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("TAPE_CHART")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === "TAPE_CHART"
                      ? "bg-[#28594E] text-[#F5EBDD] shadow-xs"
                      : "text-[#6B7B74] hover:text-[#303A36]"
                  }`}
                >
                  <Calendar className="size-3.5" />
                  Tape Chart Timeline
                </button>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-9 px-3 rounded-xl border-[#28594E]/20 text-[#28594E] hover:bg-emerald-50/50"
                title="Refresh Live Occupancy"
              >
                <RefreshCw
                  className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ─── Top Operational KPI Pulse (5 Clean Cards) ──────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Card 1: Occupancy */}
          <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-[#E5DBD0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7B74]">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Occupancy Rate
              </span>
              <BedDouble className="size-4 text-[#28594E]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#28594E] tracking-tight">
                {summary?.occupancyRate ?? 0}%
              </div>
              <div className="text-xs font-semibold text-[#6B7B74] mt-0.5">
                {summary?.occupiedCount ?? 0} of {summary?.totalKeys ?? 40} keys active
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#F8F5EE] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#28594E] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${summary?.occupancyRate ?? 0}%` }}
              />
            </div>
          </div>

          {/* Card 2: Arriving Today */}
          <button
            type="button"
            onClick={() => setStatusFilter("ARRIVING")}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
              statusFilter === "ARRIVING"
                ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-sm"
                : "bg-white hover:bg-amber-50/40 border-[#E5DBD0] text-[#303A36] shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between opacity-80">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Arrivals Today
              </span>
              <Plane className="size-4 text-[#E8A45B]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold tracking-tight">
                {summary?.arrivingTodayCount ?? 0}
              </div>
              <div className="text-xs font-semibold opacity-75 mt-0.5">
                Flight airport transfers scheduled
              </div>
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#E8A45B]">
              VIP Arrivals Landing →
            </div>
          </button>

          {/* Card 3: Housekeeping Turnover */}
          <button
            type="button"
            onClick={() => setStatusFilter("TURNOVER_NEEDED")}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
              statusFilter === "TURNOVER_NEEDED"
                ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-sm"
                : "bg-white hover:bg-rose-50/40 border-[#E5DBD0] text-[#303A36] shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between opacity-80">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Turnover Needed
              </span>
              <ShieldAlert className="size-4 text-red-500" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold tracking-tight text-red-600">
                {(summary?.dirtyCount ?? 0) + (summary?.inProgressCount ?? 0)}
              </div>
              <div className="text-xs font-semibold opacity-75 mt-0.5">
                {summary?.dirtyCount ?? 0} dirty · {summary?.inProgressCount ?? 0} in-progress
              </div>
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">
              Needs Housekeeping Action →
            </div>
          </button>

          {/* Card 4: Inspected Ready */}
          <button
            type="button"
            onClick={() => setStatusFilter("INSPECTED")}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
              statusFilter === "INSPECTED"
                ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-sm"
                : "bg-white hover:bg-emerald-50/40 border-[#E5DBD0] text-[#303A36] shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between opacity-80">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Guest Ready
              </span>
              <CheckCircle2 className="size-4 text-[#28594E]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold tracking-tight text-[#28594E]">
                {summary?.inspectedCount ?? 0}
              </div>
              <div className="text-xs font-semibold opacity-75 mt-0.5">
                Inspected & signed-off for check-in
              </div>
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#28594E]">
              Immediate Walk-in Ready →
            </div>
          </button>

          {/* Card 5: Direct Booking Yield */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DBD0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#6B7B74]">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Direct Share
              </span>
              <TrendingUp className="size-4 text-[#E8A45B]" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-extrabold text-[#303A36] tracking-tight">
                {summary?.directBookingRatio ?? 63}%
              </div>
              <div className="text-xs font-semibold text-[#6B7B74] mt-0.5">
                Direct booking yield vs OTA commissions
              </div>
            </div>
            <div className="text-[10px] font-bold text-[#E8A45B] flex items-center gap-1">
              <span>+21 pts since go-live</span>
            </div>
          </div>
        </div>

        {/* ─── Filter & Search Bar ────────────────────────────────────────── */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E5DBD0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: `All Rooms (${allRooms.length})` },
              { id: "OCCUPIED", label: `Occupied (${summary?.occupiedCount ?? 0})` },
              { id: "ARRIVING", label: `Arriving Today (${summary?.arrivingTodayCount ?? 0})` },
              { id: "TURNOVER_NEEDED", label: `Turnover (${(summary?.dirtyCount ?? 0) + (summary?.inProgressCount ?? 0)})` },
              { id: "INSPECTED", label: `Ready (${summary?.inspectedCount ?? 0})` },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id as StatusFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === chip.id
                    ? "bg-[#28594E] text-[#F5EBDD] shadow-xs"
                    : "bg-[#F8F5EE] text-[#6B7B74] hover:text-[#303A36] hover:bg-zinc-100"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Floor & Search Filter */}
          <div className="flex items-center gap-2">
            {/* Floor Filter */}
            <select
              value={floorFilter}
              onChange={(e) =>
                setFloorFilter(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                )
              }
              className="text-xs font-bold rounded-xl border border-[#E5DBD0] bg-[#F8F5EE] px-3 py-2 text-[#303A36] focus:border-[#28594E] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Levels</option>
              <option value="1">Floor 1 (River Access)</option>
              <option value="2">Floor 2 (Canal View)</option>
              <option value="3">Floor 3 (Garden)</option>
              <option value="4">Floor 4 (Suites)</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8B84]" />
              <input
                type="text"
                placeholder="Search room, guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-56 text-xs font-medium rounded-xl border border-[#E5DBD0] bg-[#F8F5EE] pl-8 pr-3 py-2 text-[#303A36] placeholder-[#7A8B84] focus:border-[#28594E] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── VIEW MODE A: 40-KEY ROOM BOARD (ORGANIZED BY FLOOR) ────────── */}
        {viewMode === "MATRIX" && (
          <div className="space-y-6">
            {Object.keys(floorGroups).length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5DBD0] p-12 text-center">
                <YoonieMascot mood="thinking" size="md" />
                <h3 className="font-extrabold text-lg text-[#28594E] mt-3">
                  No rooms match this filter
                </h3>
                <p className="text-xs text-[#7A8B84] mt-1">
                  Try adjusting your floor or status filter above.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setFloorFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-xl text-xs font-bold border-[#28594E]/20 text-[#28594E]"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              Object.entries(floorGroups).map(([groupName, floorRooms]) => (
                <div key={groupName} className="space-y-3">
                  {/* Floor Header */}
                  <div className="flex items-center justify-between border-b border-[#28594E]/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#28594E] uppercase tracking-wider">
                        {groupName}
                      </span>
                      <span className="text-[11px] font-bold text-[#6B7B74] bg-white px-2 py-0.5 rounded-full border border-[#E5DBD0]">
                        {floorRooms.length} Keys
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-[#7A8B84]">
                      <span>
                        {floorRooms.filter((r) => r.occupancyStatus === "OCCUPIED" || Boolean(r.currentBooking)).length} Occupied
                      </span>
                      <span>·</span>
                      <span>
                        {floorRooms.filter((r) => r.cleaningStatus === "INSPECTED").length} Ready
                      </span>
                    </div>
                  </div>

                  {/* Room Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                    {floorRooms.map((room) => {
                      const cleanCfg = CLEANING_CONFIG[room.cleaningStatus];
                      const isOccupied = room.occupancyStatus === "OCCUPIED" || Boolean(room.currentBooking);
                      const hasBooking = Boolean(room.currentBooking);
                      const booking = room.currentBooking;
                      const isArriving = room.occupancyStatus === "ARRIVING_TODAY";
                      const vipBadge = booking
                        ? VIP_CONFIG[booking.vipTier] || VIP_CONFIG.NONE
                        : null;

                      return (
                        <div
                          key={room._id}
                          onClick={() => setSelectedRoomId(room._id)}
                          className={`group relative rounded-2xl bg-white border p-3.5 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 hover:-translate-y-0.5 hover:shadow-md ${
                            selectedRoomId === room._id
                              ? "border-[#28594E] ring-2 ring-[#28594E]/20"
                              : "border-[#E5DBD0] hover:border-[#28594E]/40"
                          }`}
                        >
                          {/* Top Row: Room Number, Type & Status Badge */}
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xl tracking-tight text-[#28594E] font-mono group-hover:text-[#E8A45B] transition">
                                  {room.roomNumber}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#F8F5EE] text-[#6B7B74] border border-[#E5DBD0]">
                                  Fl.{room.floor}
                                </span>
                              </div>

                              {/* Status Badge */}
                              {isOccupied ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#28594E] text-[#F5EBDD] text-[10px] font-bold tracking-tight shadow-xs">
                                  <User className="size-2.5" />
                                  Occupied
                                </span>
                              ) : isArriving ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8A45B] text-[#303A36] text-[10px] font-extrabold tracking-tight shadow-xs">
                                  <Plane className="size-2.5" />
                                  Arrival
                                </span>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cleanCfg.pillBg}`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${cleanCfg.dotColor}`}
                                  />
                                  {room.cleaningStatus === "INSPECTED"
                                    ? "Ready"
                                    : room.cleaningStatus === "DIRTY"
                                    ? "Turnover"
                                    : "Cleaning"}
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-semibold text-[#7A8B84] truncate mt-0.5">
                              {room.roomType.replace(/_/g, " ")}
                            </div>
                          </div>

                          {/* Middle: Guest Stay Duration or Vacancy Info */}
                          <div className="rounded-xl bg-[#F8F5EE] p-2.5 border border-[#28594E]/10 space-y-1.5">
                            {hasBooking && booking ? (
                              <>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-[#28594E] truncate">
                                    {booking.guestName}
                                  </span>
                                  {vipBadge && (
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded border shrink-0 ${vipBadge.badgeClass}`}
                                    >
                                      {booking.vipTier !== "NONE"
                                        ? booking.vipTier
                                        : "GUEST"}
                                    </span>
                                  )}
                                </div>

                                {/* Stay Duration & Dates */}
                                <div className="flex items-center justify-between text-[10px] font-bold text-[#6B7B74]">
                                  <span className="flex items-center gap-1">
                                    <Clock className="size-3 text-[#E8A45B]" />
                                    {booking.nights} Nights
                                  </span>
                                  <span className="font-mono text-[#303A36]">
                                    {booking.checkInDate.slice(5)} → {booking.checkOutDate.slice(5)}
                                  </span>
                                </div>

                                {/* Flight Info Pill (if arriving today) */}
                                {booking.flightNumber && (
                                  <div className="flex items-center justify-between text-[10px] font-semibold bg-white px-2 py-1 rounded-md border border-[#E5DBD0]">
                                    <span className="flex items-center gap-1 text-[#28594E] font-bold">
                                      <Plane className="size-3 text-[#E8A45B]" />
                                      {booking.flightNumber}
                                    </span>
                                    <span className="font-mono text-[#6B7B74]">
                                      ETA {booking.flightEta || "--:--"}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="py-2 text-center">
                                <span className="text-[11px] font-bold text-[#6B7B74] block">
                                  Vacant Key
                                </span>
                                <span className="text-[10px] font-mono text-[#7A8B84]">
                                  THB {room.baseRateThb?.toLocaleString() || "3,800"} / night
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Row: Housekeeping Status & Action */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px]">
                            <div className="flex items-center gap-1.5 text-[#6B7B74]">
                              <span
                                className={`size-2 rounded-full ${cleanCfg.dotColor}`}
                              />
                              <span className="font-semibold truncate">
                                {cleanCfg.title}
                              </span>
                            </div>

                            <span className="font-bold text-[#28594E] group-hover:text-[#E8A45B] transition flex items-center gap-0.5">
                              Dossier <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── VIEW MODE B: MULTI-DAY TAPE CHART TIMELINE ────────────────── */}
        {viewMode === "TAPE_CHART" && (
          <div className="bg-white rounded-2xl border border-[#E5DBD0] shadow-xs overflow-hidden">
            {/* Ribbon Header Explanation */}
            <div className="p-4 border-b border-[#E5DBD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F5EE]/50">
              <div>
                <h3 className="font-extrabold text-base text-[#28594E]">
                  Multi-Day Tape Chart & Reservation Ribbon
                </h3>
                <p className="text-xs text-[#7A8B84] mt-0.5">
                  Visual timeline showing who occupies each room and exact stay lengths across dates.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#28594E]">
                  <span className="size-2.5 rounded-sm bg-[#28594E]" /> In-House Stay
                </span>
                <span className="flex items-center gap-1.5 text-[#E8A45B]">
                  <span className="size-2.5 rounded-sm bg-[#E8A45B]" /> Today&apos;s Date
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="size-2.5 rounded-sm bg-zinc-200" /> Vacant
                </span>
              </div>
            </div>

            {/* Calendar Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DBD0] bg-[#F8F5EE] text-[11px] font-extrabold text-[#6B7B74]">
                    <th className="sticky left-0 z-20 bg-[#F8F5EE] p-3 w-40 min-w-40 border-r border-[#E5DBD0]">
                      Room & Key
                    </th>
                    {timelineDates.map((dateStr) => {
                      const isToday = dateStr === selectedDate;
                      const dayName = new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(
                        "en-US",
                        { weekday: "short" }
                      );
                      const dayNum = dateStr.slice(8);
                      const monthName = new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(
                        "en-US",
                        { month: "short" }
                      );

                      return (
                        <th
                          key={dateStr}
                          className={`p-2.5 text-center min-w-[100px] border-r border-[#E5DBD0] ${
                            isToday
                              ? "bg-[#E8A45B]/15 text-[#28594E] font-black"
                              : ""
                          }`}
                        >
                          <div className="uppercase text-[10px] tracking-wider">
                            {dayName}
                          </div>
                          <div className="text-sm font-mono font-extrabold mt-0.5">
                            {dayNum} {monthName}
                          </div>
                          {isToday && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full bg-[#E8A45B] text-[#303A36] text-[8px] font-black uppercase tracking-wider">
                              Today
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5DBD0] text-xs font-medium">
                  {rooms.map((room) => {
                    const roomBookings = timelineMap.get(room.roomNumber) || [];
                    const cleanCfg = CLEANING_CONFIG[room.cleaningStatus];

                    return (
                      <tr
                        key={room._id}
                        className="hover:bg-[#F8F5EE]/40 transition"
                      >
                        {/* Fixed Room Key Column */}
                        <td className="sticky left-0 z-10 bg-white p-3 border-r border-[#E5DBD0] shadow-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomId(room._id)}
                            className="text-left w-full group"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-extrabold text-sm text-[#28594E] group-hover:text-[#E8A45B]">
                                {room.roomNumber}
                              </span>
                              <span
                                className={`size-1.5 rounded-full ${cleanCfg.dotColor}`}
                                title={cleanCfg.title}
                              />
                              <span className="text-[10px] font-bold text-[#7A8B84]">
                                Fl.{room.floor}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#7A8B84] truncate">
                              {room.roomType.replace(/_/g, " ")}
                            </div>
                          </button>
                        </td>

                        {/* Timeline Date Columns */}
                        {timelineDates.map((dateStr) => {
                          const isToday = dateStr === selectedDate;
                          // Check if any booking covers this date
                          const bookingOnDate = roomBookings.find(
                            (b) =>
                              b.checkInDate <= dateStr &&
                              dateStr < b.checkOutDate
                          );

                          const isCheckInDay =
                            bookingOnDate && bookingOnDate.checkInDate === dateStr;
                          const isCheckOutDay =
                            bookingOnDate &&
                            new Date(bookingOnDate.checkOutDate).toISOString().slice(0, 10) === dateStr;

                          return (
                            <td
                              key={dateStr}
                              className={`p-1.5 border-r border-[#E5DBD0] align-middle ${
                                isToday ? "bg-[#E8A45B]/5" : ""
                              }`}
                            >
                              {bookingOnDate ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedRoomId(room._id)}
                                  className={`w-full p-1.5 rounded-lg text-left transition shadow-xs text-[10px] flex flex-col justify-between h-14 ${
                                    bookingOnDate.vipTier === "PLATINUM"
                                      ? "bg-[#28594E] text-[#F5EBDD] hover:bg-[#346e61]"
                                      : bookingOnDate.vipTier === "GOLD"
                                      ? "bg-[#304B43] text-amber-200 hover:bg-[#3d5e54]"
                                      : "bg-[#28594E]/85 text-white hover:bg-[#28594E]"
                                  }`}
                                  title={`${bookingOnDate.guestName} (${bookingOnDate.nights} nights: ${bookingOnDate.checkInDate} to ${bookingOnDate.checkOutDate})`}
                                >
                                  <div className="font-bold truncate leading-tight">
                                    {bookingOnDate.guestName}
                                  </div>
                                  <div className="flex items-center justify-between text-[9px] opacity-80 font-mono">
                                    <span>{bookingOnDate.nights}n</span>
                                    {bookingOnDate.flightNumber && (
                                      <span className="flex items-center gap-0.5 text-[#E8A45B] font-bold">
                                        <Plane className="size-2.5" />
                                        {bookingOnDate.flightNumber}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ) : (
                                <div className="h-14 flex items-center justify-center text-zinc-300 hover:bg-[#F8F5EE] rounded-lg transition">
                                  <span className="text-[10px] font-mono select-none">
                                    ·
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── ROOM 360 & GUEST DOSSIER SLIDE-OVER DRAWER ─────────────────── */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-[#E5DBD0] flex items-center justify-between bg-[#F8F5EE]">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-2xl text-[#28594E]">
                    Room {selectedRoom.roomNumber}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#E5DBD0] text-[#6B7B74]">
                    Floor {selectedRoom.floor}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      CLEANING_CONFIG[selectedRoom.cleaningStatus].pillBg
                    }`}
                  >
                    {CLEANING_CONFIG[selectedRoom.cleaningStatus].title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRoomId(null)}
                  className="size-8 rounded-full bg-white border border-[#E5DBD0] flex items-center justify-center text-zinc-500 hover:text-zinc-800"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                {/* Room Details Banner */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F5EE] border border-[#28594E]/15">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-[#E8A45B]">
                      {selectedRoom.roomType.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm font-bold text-[#28594E] mt-0.5">
                      Max {selectedRoom.maxOccupancy} Guests · THB{" "}
                      {selectedRoom.baseRateThb?.toLocaleString()} / night
                    </div>
                  </div>
                  <BedDouble className="size-6 text-[#28594E]" />
                </div>

                {/* Housekeeping Advance Status Stepper */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B7B74] block">
                    Housekeeping Status Workflow
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      ["DIRTY", "IN_PROGRESS", "CLEAN", "INSPECTED"] as RoomCleaningStatus[]
                    ).map((status) => {
                      const isCurrent = selectedRoom.cleaningStatus === status;
                      const cfg = CLEANING_CONFIG[status];
                      return (
                        <button
                          key={status}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setRoomStatus(selectedRoom._id, status)}
                          className={`p-2 rounded-xl text-center border text-[11px] font-bold transition flex flex-col items-center gap-1 ${
                            isCurrent
                              ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-xs"
                              : "bg-white hover:bg-zinc-50 border-[#E5DBD0] text-[#6B7B74]"
                          }`}
                        >
                          <span
                            className={`size-2 rounded-full ${
                              isCurrent ? "bg-[#E8A45B]" : cfg.dotColor
                            }`}
                          />
                          {status === "DIRTY"
                            ? "Dirty"
                            : status === "IN_PROGRESS"
                            ? "Cleaning"
                            : status === "CLEAN"
                            ? "Clean"
                            : "Inspected"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Active Guest Card */}
                {selectedRoom.currentBooking ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#28594E]">
                        In-House Guest Dossier
                      </span>
                      <span className="text-[10px] font-bold text-[#E8A45B] uppercase tracking-wider">
                        Active Stay
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#E5DBD0] shadow-xs space-y-3">
                      {/* Guest name & VIP */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-extrabold text-[#28594E]">
                            {selectedRoom.currentBooking.guestName}
                          </div>
                          <div className="text-xs text-[#7A8B84]">
                            {selectedRoom.currentBooking.guestEmail || "No email"} ·{" "}
                            {selectedRoom.currentBooking.guestPhone || "No phone"}
                          </div>
                        </div>

                        {selectedRoom.currentBooking.vipTier !== "NONE" && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                            <Crown className="size-3 text-amber-600" />
                            {selectedRoom.currentBooking.vipTier}
                          </div>
                        )}
                      </div>

                      {/* Stay Duration Dates */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F8F5EE] border border-[#28594E]/10">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#6B7B74] block">
                            Check-in Date
                          </span>
                          <span className="text-xs font-extrabold text-[#28594E]">
                            {selectedRoom.currentBooking.checkInDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#6B7B74] block">
                            Check-out Date
                          </span>
                          <span className="text-xs font-extrabold text-[#28594E]">
                            {selectedRoom.currentBooking.checkOutDate} ({selectedRoom.currentBooking.nights} Nights)
                          </span>
                        </div>
                      </div>

                      {/* Flight Details (if present) */}
                      {selectedRoom.currentBooking.flightNumber && (
                        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Plane className="size-4 text-[#28594E]" />
                            <div>
                              <div className="text-xs font-bold text-[#28594E]">
                                {selectedRoom.currentBooking.flightNumber}
                              </div>
                              <div className="text-[10px] text-sky-700">
                                Meeting Door {selectedRoom.currentBooking.meetingDoor || 4}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase text-sky-700 block">
                              Flight ETA
                            </span>
                            <span className="text-xs font-extrabold text-[#28594E]">
                              {selectedRoom.currentBooking.flightEta || "--:--"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Revenue & Attribution */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
                        <span className="text-[#7A8B84]">
                          Channel:{" "}
                          <strong className="text-[#303A36] uppercase">
                            {selectedRoom.currentBooking.attributionSource || "Direct"}
                          </strong>
                        </span>
                        <span className="font-extrabold text-[#28594E]">
                          THB {selectedRoom.currentBooking.grandTotalThb?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F8F5EE] border border-[#28594E]/15 text-center space-y-2">
                    <BedDouble className="size-8 text-[#28594E]/40 mx-auto" />
                    <h4 className="font-extrabold text-sm text-[#28594E]">
                      Room is currently Vacant
                    </h4>
                    <p className="text-xs text-[#7A8B84]">
                      Available for immediate booking, walk-in check-in, or VIP assignment.
                    </p>
                  </div>
                )}

                {/* Upcoming Bookings for this room */}
                {selectedRoom.upcomingBookings && selectedRoom.upcomingBookings.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7B74] block">
                      Upcoming Scheduled Stays ({selectedRoom.upcomingBookings.length})
                    </span>
                    <div className="space-y-2">
                      {selectedRoom.upcomingBookings.map((up) => (
                        <div
                          key={up.orderId}
                          className="p-3 rounded-xl bg-white border border-[#E5DBD0] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#28594E]">
                              {up.guestName}
                            </div>
                            <div className="text-[10px] text-[#7A8B84]">
                              {up.checkInDate} → {up.checkOutDate} ({up.nights} nights)
                            </div>
                          </div>
                          {up.vipTier !== "NONE" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {up.vipTier}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E5DBD0] bg-[#F8F5EE] flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRoomId(null)}
                className="rounded-xl text-xs font-bold border-[#E5DBD0] text-[#6B7B74]"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedRoom.cleaningStatus === "INSPECTED" ? (
                  <>
                    <span className="text-xs font-bold text-[#28594E] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#28594E]/10 border border-[#28594E]/20">
                      <CheckCircle2 className="size-3.5" />
                      Guest-Ready
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRoomStatus(selectedRoom._id, "DIRTY")}
                      disabled={isUpdating}
                      className="rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <ShieldAlert className="size-3 mr-1" />
                      Trigger Turnover (Guest Left)
                    </Button>
                  </>
                ) : selectedRoom.cleaningStatus === "DIRTY" ? (
                  <Button
                    size="sm"
                    onClick={() => setRoomStatus(selectedRoom._id, "IN_PROGRESS")}
                    disabled={isUpdating}
                    className="rounded-xl text-xs font-bold bg-[#E8A45B] text-[#303A36] hover:bg-[#d8964e]"
                  >
                    <Clock className="size-3.5 mr-1" />
                    Start Cleaning
                  </Button>
                ) : selectedRoom.cleaningStatus === "IN_PROGRESS" ? (
                  <Button
                    size="sm"
                    onClick={() => setRoomStatus(selectedRoom._id, "CLEAN")}
                    disabled={isUpdating}
                    className="rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700"
                  >
                    <Sparkles className="size-3.5 mr-1" />
                    Complete Cleaning
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setRoomStatus(selectedRoom._id, "INSPECTED")}
                    disabled={isUpdating}
                    className="rounded-xl text-xs font-bold bg-[#28594E] text-[#F5EBDD] hover:bg-[#346e61]"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" />
                    Sign Off & Mark Ready
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
