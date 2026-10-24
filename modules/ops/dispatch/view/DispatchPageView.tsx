/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  HelpCircle,
  Info,
  MessageSquare,
  Plane,
  Share2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import type { DispatchPageVm } from "../viewModel/dispatchPageVm";
import type { DispatchStatus, DispatchTaskType } from "@/lib/types/hospitality";

interface DispatchFilterOption {
  id: DispatchTaskType | "ALL";
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

export function DispatchPageView({ vm }: { vm: DispatchPageVm }) {
  const {
    branch,
    serviceDate,
    setServiceDate,
    activeFilter,
    setActiveFilter,
    tasks,
    allTasksCount,
    criticalCount,
    completedCount,
    pickupCount,
    housekeepingCount,
    tourCount,
    advanceTaskStatus,
  } = vm;

  const [copiedCardId, setCopiedCardId] = React.useState<string | null>(null);
  const [showExplainer, setShowExplainer] = React.useState(false);

  const copyBilingualCard = (taskId: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedCardId(taskId);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  const shareToWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const filterOptions: DispatchFilterOption[] = [
    {
      id: "ALL",
      label: "All Operations",
      sublabel: "Complete daily run-sheet",
      icon: Clock,
      count: allTasksCount,
    },
    {
      id: "HOUSEKEEPING_TURNAROUND",
      label: "VIP Room Prep",
      sublabel: "Prioritized for early arrivals",
      icon: BedDouble,
      count: housekeepingCount,
    },
    {
      id: "AIRPORT_PICKUP",
      label: "Flight Pickups",
      sublabel: "Driver cards & flight tracking",
      icon: Plane,
      count: pickupCount,
    },
    {
      id: "TOUR_CONSOLIDATION",
      label: "Tour Fill & Revenue",
      sublabel: "Break-even & yield alerts",
      icon: Compass,
      count: tourCount,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* ─── Operating System Morning Command Header ─────────────────────── */}
      <div className="rounded-3xl bg-white border border-[#28594E]/15 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <YoonieMascot
            mood={criticalCount > 0 ? "thinking" : completedCount === allTasksCount ? "happy" : "calm"}
            size="md"
            badge="05:30 OS"
            message={
              criticalCount > 0
                ? `${criticalCount} priority operations need your attention!`
                : "All airport transfers, VIP rooms, and tour departs are running smoothly."
            }
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#28594E]/10 text-[#28594E] text-xs font-bold uppercase tracking-wider">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                05:30 Autonomous Dispatch Engine
              </span>
              <span className="text-xs font-bold text-[#6B7B74]">
                {branch?.name || "BKK Riverside Boutique Hotel"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E] font-sans mt-1">
              Frontline Operations Command
            </h1>
            <p className="text-xs text-[#7A8B84] font-medium mt-0.5">
              The autonomous air-traffic controller: Synchronizing airport drivers, priority housekeeping, and tour yield.
            </p>
          </div>
        </div>

        {/* Date Selector & Stats */}
        <div className="flex items-center gap-4 bg-[#F8F5EE] p-3.5 rounded-2xl border border-[#28594E]/15 shrink-0">
          <div>
            <label className="text-[10px] font-bold uppercase text-[#6B7B74] block">
              Operating Date (Bangkok)
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="text-xs font-extrabold bg-transparent border-0 p-0 text-[#28594E] focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="border-l border-[#28594E]/15 pl-4 flex flex-col text-right">
            <span className="text-[10px] font-bold text-[#E8A45B] flex items-center justify-end gap-1">
              <AlertTriangle className="size-3" /> {criticalCount} Priority Flags
            </span>
            <span className="text-xs font-bold text-[#28594E]">
              {completedCount} / {allTasksCount} Completed
            </span>
          </div>
        </div>
      </div>

      {/* ─── Top OS Metric Gauges (Click to filter) ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Gauge 1: VIP Room Turnaround */}
        <button
          type="button"
          onClick={() => setActiveFilter("HOUSEKEEPING_TURNAROUND")}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
            activeFilter === "HOUSEKEEPING_TURNAROUND"
              ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-sm"
              : "bg-white hover:bg-emerald-50/50 border-[#28594E]/15 text-[#303A36]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeFilter === "HOUSEKEEPING_TURNAROUND"
                  ? "bg-white/15 text-white"
                  : "bg-[#28594E]/10 text-[#28594E]"
              }`}
            >
              <BedDouble className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                VIP Room Prep
              </div>
              <div className="text-xl font-extrabold">{housekeepingCount} Rooms</div>
            </div>
          </div>
          <div className="text-right text-[11px] font-medium opacity-80">
            Target check-in prep
          </div>
        </button>

        {/* Gauge 2: Flight Logistics */}
        <button
          type="button"
          onClick={() => setActiveFilter("AIRPORT_PICKUP")}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
            activeFilter === "AIRPORT_PICKUP"
              ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-sm"
              : "bg-white hover:bg-blue-50/50 border-[#28594E]/15 text-[#303A36]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeFilter === "AIRPORT_PICKUP"
                  ? "bg-white/15 text-white"
                  : "bg-blue-500/10 text-blue-600"
              }`}
            >
              <Plane className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                Flight Pickups
              </div>
              <div className="text-xl font-extrabold">{pickupCount} Arrivals</div>
            </div>
          </div>
          <div className="text-right text-[11px] font-medium opacity-80">
            Door placards & drivers
          </div>
        </button>

        {/* Gauge 3: Tour Capacity */}
        <button
          type="button"
          onClick={() => setActiveFilter("TOUR_CONSOLIDATION")}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
            activeFilter === "TOUR_CONSOLIDATION"
              ? "bg-[#28594E] text-[#F5EBDD] border-[#28594E] shadow-sm"
              : "bg-white hover:bg-amber-50/50 border-[#28594E]/15 text-[#303A36]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeFilter === "TOUR_CONSOLIDATION"
                  ? "bg-white/15 text-white"
                  : "bg-[#E8A45B]/15 text-[#E8A45B]"
              }`}
            >
              <Compass className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                Tour Capacity
              </div>
              <div className="text-xl font-extrabold">{tourCount} Scheduled</div>
            </div>
          </div>
          <div className="text-right text-[11px] font-medium opacity-80">
            Fill rate & yield
          </div>
        </button>
      </div>

      {/* ─── Explainer Accordion: What does this mean? ──────────────────── */}
      <div className="rounded-2xl border border-[#28594E]/15 bg-white p-4 shadow-xs">
        <button
          type="button"
          onClick={() => setShowExplainer(!showExplainer)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#28594E]">
            <HelpCircle className="size-4 text-[#E8A45B]" />
            <span>How does Yoonie&apos;s 05:30 Autonomous Dispatch work?</span>
          </div>
          <span className="text-[11px] font-semibold text-[#7A8B84] flex items-center gap-1 group-hover:text-[#28594E]">
            {showExplainer ? "Hide Guide" : "What each operation means"}
            {showExplainer ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </span>
        </button>

        {showExplainer && (
          <div className="mt-4 pt-4 border-t border-[#28594E]/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#28594E]/10">
              <div className="font-bold text-[#28594E] flex items-center gap-1.5">
                <BedDouble className="size-3.5 text-[#28594E]" />
                1. VIP Room Prep
              </div>
              <p className="text-[#6B7B74] text-[11px] leading-relaxed">
                When a guest lands early (e.g., 07:55 AM on flight QR 836), standard check-in at 14:00 is too late.
                Yoonie automatically fast-tracks that specific room in housekeeping so it is inspected and ready before the car reaches the hotel driveway.
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#28594E]/10">
              <div className="font-bold text-blue-700 flex items-center gap-1.5">
                <Plane className="size-3.5 text-blue-600" />
                2. Flight Pickups & Driver Cards
              </div>
              <p className="text-[#6B7B74] text-[11px] leading-relaxed">
                Tracks live flight ETAs at Suvarnabhumi & Don Mueang. Auto-generates bilingual driver pickup cards (English & Thai) with meeting door numbers and vehicle plates, ready for 1-click dispatch via WhatsApp or LINE.
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-[#F8F5EE]/60 border border-[#28594E]/10">
              <div className="font-bold text-[#E8A45B] flex items-center gap-1.5">
                <Compass className="size-3.5 text-[#E8A45B]" />
                3. Tour Yield & Break-Even
              </div>
              <p className="text-[#6B7B74] text-[11px] leading-relaxed">
                Monitors tour capacity against fixed costs (boat, guide, permits). If a tour is under break-even fill rate, Yoonie alerts management to offer a flash upsell to in-house guests or merge departures so you never lose money.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Friendly Filter Tabs ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-[#28594E] text-[#F5EBDD] shadow-xs"
                  : "bg-white hover:bg-zinc-100 text-[#6B7B74] border border-[#28594E]/15"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{f.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-[#303A36]"
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Task Cards Run-Sheet ────────────────────────────────────────── */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-[#28594E]/15 text-center flex flex-col items-center gap-3">
            <YoonieMascot mood="sleeping" size="md" />
            <p className="font-bold text-sm text-[#28594E]">
              No dispatch tasks found for this category or date!
            </p>
            <p className="text-xs text-[#7A8B84] max-w-sm">
              Tasks are automatically evaluated and refreshed at 05:30 based on live guest arrivals and tour bookings.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const bkkNow = new Date(Date.now() + 420 * 60_000);
                setServiceDate(bkkNow.toISOString().slice(0, 10));
                setActiveFilter("ALL");
              }}
              className="mt-1 text-xs font-bold text-[#28594E] border-[#28594E]/20"
            >
              View Today&apos;s Full Run-Sheet
            </Button>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === "DONE";
            const isWarn = task.severity === "WARN" || task.severity === "CRITICAL";

            return (
              <div
                key={task._id}
                className={`rounded-3xl p-6 border transition-all duration-200 bg-white shadow-xs space-y-4 ${
                  isCompleted
                    ? "opacity-60 border-zinc-200 bg-zinc-50/50"
                    : isWarn
                    ? "border-[#E8A45B]/60 border-l-[6px] border-l-[#E8A45B]"
                    : "border-[#28594E]/15 hover:border-[#28594E]/40"
                }`}
              >
                {/* Card Top Row: Type, Priority Context, Status Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Icon Badge */}
                    <span
                      className={`size-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        task.type === "AIRPORT_PICKUP"
                          ? "bg-blue-500/15 text-blue-700"
                          : task.type === "TOUR_CONSOLIDATION"
                          ? "bg-[#E8A45B]/20 text-[#D88D38]"
                          : "bg-[#28594E]/15 text-[#28594E]"
                      }`}
                    >
                      {task.type === "AIRPORT_PICKUP" ? (
                        <Plane className="size-5" />
                      ) : task.type === "TOUR_CONSOLIDATION" ? (
                        <Compass className="size-5" />
                      ) : (
                        <BedDouble className="size-5" />
                      )}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Friendly Category Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-zinc-100 text-[#6B7B74]">
                          {task.type === "AIRPORT_PICKUP"
                            ? "Flight Pickup & Transfer"
                            : task.type === "TOUR_CONSOLIDATION"
                            ? "Tour Yield & Break-Even"
                            : "VIP Room Turnaround"}
                        </span>

                        {/* Priority / Severity Badge */}
                        {isWarn ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/15 text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="size-2.5" /> High Priority Flag
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/15 text-emerald-800">
                            On Schedule
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-[#7A8B84]">
                          Score: {task.priorityScore}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base sm:text-lg text-[#28594E] mt-1">
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  {/* Status Progression Controls */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        task.status === "DONE"
                          ? "bg-emerald-500/15 text-emerald-800"
                          : task.status === "IN_PROGRESS"
                          ? "bg-[#E8A45B]/20 text-amber-900"
                          : task.status === "ACKNOWLEDGED"
                          ? "bg-blue-500/15 text-blue-800"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {task.status}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => advanceTaskStatus(task._id, task.status)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition shadow-xs ${
                        task.status === "DONE"
                          ? "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
                          : "bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD]"
                      }`}
                    >
                      {task.status === "OPEN"
                        ? "Acknowledge"
                        : task.status === "ACKNOWLEDGED"
                        ? "Start Operation"
                        : task.status === "IN_PROGRESS"
                        ? "Mark Completed ✓"
                        : "Reopen"}
                    </Button>
                  </div>
                </div>

                {/* ─── Detail Block: Airport Pickup ─────────────────────────── */}
                {task.pickup && (
                  <div className="rounded-2xl bg-[#F8F5EE] border border-[#28594E]/10 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#28594E] flex items-center gap-1.5">
                          <Plane className="size-3.5" />
                          Flight: <strong>{task.pickup.flightNumber}</strong>
                        </span>
                        <span className="text-[#7A8B84]">·</span>
                        <span className="text-[#303A36]">
                          Guest: <strong>{task.pickup.guestName}</strong>
                        </span>
                        <span className="text-[#7A8B84]">·</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                          Arrivals Door {task.pickup.meetingDoor}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#6B7B74]">
                        Vehicle: <strong>{task.pickup.vehiclePlate}</strong>
                      </div>
                    </div>

                    {/* Bilingual Placard Box */}
                    {task.pickup.card && (
                      <div className="p-3.5 rounded-xl bg-white border border-[#28594E]/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#28594E] flex items-center gap-1">
                            <Share2 className="size-3" /> Bilingual Driver Card (Instant WhatsApp / LINE)
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                shareToWhatsApp(
                                  `${task.pickup?.card?.en}\n\n${task.pickup?.card?.th}`
                                )
                              }
                              className="h-7 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"
                            >
                              <MessageSquare className="size-3 mr-1" />
                              WhatsApp
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyBilingualCard(
                                  task._id,
                                  `${task.pickup?.card?.en}\n\n${task.pickup?.card?.th}`
                                )
                              }
                              className="h-7 text-[10px] font-bold text-[#28594E] hover:bg-zinc-100"
                            >
                              <Copy className="size-3 mr-1" />
                              {copiedCardId === task._id ? "Copied!" : "Copy Placard"}
                            </Button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#F8F5EE]/70 font-mono text-[11px] text-[#303A36] whitespace-pre-line leading-relaxed">
                          {task.pickup.card.en}
                          <span className="block mt-1 text-[#6B7B74]">
                            {task.pickup.card.th}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Detail Block: Housekeeping Turnaround ─────────────────── */}
                {task.housekeeping && (
                  <div className="rounded-2xl bg-[#F8F5EE] border border-[#28594E]/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#6B7B74]">Room</span>
                        <strong className="text-base text-[#28594E] font-extrabold">
                          #{task.housekeeping.roomNumber}
                        </strong>
                      </div>

                      {task.housekeeping.guestName && (
                        <div className="border-l border-[#28594E]/10 pl-3">
                          <span className="text-[10px] text-[#6B7B74] block">Incoming VIP Guest</span>
                          <strong className="text-[#303A36]">{task.housekeeping.guestName}</strong>
                        </div>
                      )}

                      {task.housekeeping.etaAt && (
                        <div className="border-l border-[#28594E]/10 pl-3">
                          <span className="text-[10px] text-[#6B7B74] block">Guest Arrival ETA</span>
                          <span className="font-mono font-bold text-blue-700">
                            {new Date(task.housekeeping.etaAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {task.housekeeping.isVip && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E8A45B]/20 text-[#303A36] font-bold text-[10px] uppercase tracking-wider">
                          ★ VIP Arrival
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-[#28594E]/15 text-[11px] font-bold text-[#28594E]">
                        Target Ready: {task.housekeeping.targetReadyBy ? new Date(task.housekeeping.targetReadyBy).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "14:00"}
                      </span>
                    </div>
                  </div>
                )}

                {/* ─── Detail Block: Tour Consolidation ──────────────────────── */}
                {task.consolidation && (
                  <div className="rounded-2xl bg-[#F8F5EE] border border-[#28594E]/10 p-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-[#6B7B74] uppercase font-bold">
                          Excursion Name
                        </div>
                        <div className="font-extrabold text-[#28594E] text-sm">
                          {task.consolidation.serviceName}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-[10px] text-[#6B7B74]">Fill Rate</div>
                          <div className="font-bold text-[#303A36]">
                            {task.consolidation.booked} / {task.consolidation.capacity} Pax (
                            {task.consolidation.capacity > 0
                              ? Math.round(
                                  (task.consolidation.booked / task.consolidation.capacity) *
                                    100
                                )
                              : 0}
                            %)
                          </div>
                        </div>

                        <div className="border-l border-[#28594E]/10 pl-4">
                          <div className="text-[10px] text-[#6B7B74]">Profit Status</div>
                          <div
                            className={`font-extrabold ${
                              task.consolidation.projectedLossThb > 0
                                ? "text-red-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {task.consolidation.projectedLossThb > 0
                              ? `-฿${task.consolidation.projectedLossThb.toLocaleString()} Loss Risk`
                              : "Profitable · Yield Met"}
                          </div>
                        </div>

                        <div className="border-l border-[#28594E]/10 pl-4">
                          <div className="text-[10px] text-[#6B7B74]">Action</div>
                          <span className="px-2 py-0.5 rounded-full bg-[#E8A45B]/20 text-[#303A36] font-bold text-[10px] uppercase">
                            {task.consolidation.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fill Rate Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            task.consolidation.booked >= task.consolidation.minViablePax
                              ? "bg-emerald-500"
                              : "bg-[#E8A45B]"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              task.consolidation.capacity > 0
                                ? Math.round(
                                    (task.consolidation.booked /
                                      task.consolidation.capacity) *
                                      100
                                  )
                                : 0
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#7A8B84]">
                        <span>Break-even threshold: {task.consolidation.minViablePax} pax</span>
                        <span>Capacity: {task.consolidation.capacity} max</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
