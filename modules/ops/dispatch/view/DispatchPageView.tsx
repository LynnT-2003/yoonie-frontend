"use client";

import * as React from "react";
import {
  AlertTriangle,
  Compass,
  Copy,
  Plane,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import type { DispatchPageVm } from "../viewModel/dispatchPageVm";
import type { DispatchTaskType } from "@/lib/types/hospitality";

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
    advanceTaskStatus,
  } = vm;

  const [copiedCardId, setCopiedCardId] = React.useState<string | null>(null);

  const copyBilingualCard = (taskId: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedCardId(taskId);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] dark:bg-[#17201D] dark:text-[#F5EBDD] py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* ─── Header & Mascot Dispatch Bar ───────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <YoonieMascot
            mood={criticalCount > 0 ? "thinking" : completedCount === allTasksCount ? "happy" : "calm"}
            size="md"
            badge="Dispatch"
            message={
              criticalCount > 0
                ? `${criticalCount} priority actions flagged for today!`
                : "All flight pickups & tour dispatches are on track."
            }
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8A45B]/15 text-[#303A36] dark:text-[#E8A45B] text-xs font-bold uppercase tracking-wider">
                05:30 Daily Dispatch Hub
              </span>
              <span className="text-xs text-[#6B7B74] dark:text-[#8FA299]">
                {branch?.name || "BKK Riverside"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#28594E] dark:text-[#F5EBDD] font-sans mt-1">
              Frontline Operations Run-Sheet
            </h1>
            <p className="text-xs text-[#6B7B74] dark:text-[#8FA299] mt-0.5">
              Automated air-traffic controller: Tour yield optimization, VIP room priority, and airport logistics.
            </p>
          </div>
        </div>

        {/* Date Selector & Stats */}
        <div className="flex items-center gap-3 bg-[#F8F5EE] dark:bg-[#17201D] p-3 rounded-2xl border border-[#E5DBD0] dark:border-[#2D3D36]">
          <div>
            <label className="text-[10px] font-bold uppercase text-[#6B7B74] block">
              Run-Sheet Date
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="text-xs font-bold bg-transparent border-0 p-0 text-[#28594E] dark:text-[#F5EBDD] focus:ring-0"
            />
          </div>

          <div className="border-l border-[#E5DBD0] dark:border-[#2D3D36] pl-3 flex flex-col text-right">
            <span className="text-[10px] font-bold text-[#E8A45B] flex items-center gap-1">
              <AlertTriangle className="size-2.5" /> {criticalCount} Alerts
            </span>
            <span className="text-[11px] font-semibold text-[#6B7B74]">
              {completedCount} / {allTasksCount} Done
            </span>
          </div>
        </div>
      </div>

      {/* ─── Task Filters ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          { id: "ALL", label: "All Tasks" },
          { id: "HOUSEKEEPING_TURNAROUND", label: "Housekeeping Turnaround" },
          { id: "TOUR_CONSOLIDATION", label: "Tour Yield Consolidation" },
          { id: "AIRPORT_PICKUP", label: "Airport Transit Pickups" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as DispatchTaskType | "ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition ${
              activeFilter === f.id
                ? "bg-[#28594E] text-[#F5EBDD] shadow-xs"
                : "bg-white dark:bg-[#202C27] text-[#6B7B74] hover:text-[#303A36] border border-[#E5DBD0] dark:border-[#2D3D36]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ─── Task Cards List ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-[#202C27] border border-[#E5DBD0] dark:border-[#2D3D36] text-center flex flex-col items-center gap-3">
            <YoonieMascot mood="sleeping" size="md" />
            <p className="font-bold text-sm text-[#28594E] dark:text-[#D8E6DA]">
              No dispatch tasks for this date!
            </p>
            <p className="text-xs text-[#6B7B74]">
              Tasks generate automatically at 05:30 based on live bookings.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === "DONE";
            return (
              <div
                key={task._id}
                className={`rounded-2xl p-5 border transition-all duration-200 bg-white dark:bg-[#202C27] shadow-xs ${
                  isCompleted
                    ? "opacity-60 border-[#E5DBD0]"
                    : task.severity === "WARN" || task.severity === "CRITICAL"
                    ? "border-l-4 border-l-[#E8A45B] border-[#E5DBD0] dark:border-[#2D3D36]"
                    : "border-[#E5DBD0] dark:border-[#2D3D36]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                        task.type === "AIRPORT_PICKUP"
                          ? "bg-blue-500/10 text-blue-600"
                          : task.type === "TOUR_CONSOLIDATION"
                          ? "bg-[#E8A45B]/15 text-[#E8A45B]"
                          : "bg-[#28594E]/10 text-[#28594E] dark:text-[#D8E6DA]"
                      }`}
                    >
                      {task.type === "AIRPORT_PICKUP" ? (
                        <Plane className="size-4" />
                      ) : task.type === "TOUR_CONSOLIDATION" ? (
                        <Compass className="size-4" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7B74]">
                          {task.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#E8A45B]">
                          Score: {task.priorityScore}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#303A36] dark:text-[#F5EBDD] mt-0.5">
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  {/* Status Toggle Action */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        task.status === "DONE"
                          ? "bg-[#28594E]/10 text-[#28594E] dark:bg-[#28594E]/30 dark:text-[#D8E6DA]"
                          : task.status === "IN_PROGRESS"
                          ? "bg-[#E8A45B]/20 text-[#303A36] dark:text-[#E8A45B]"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {task.status}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => advanceTaskStatus(task._id, task.status)}
                      className="h-8 rounded-xl bg-[#28594E] hover:bg-[#1E433A] text-[#F5EBDD] text-xs font-bold"
                    >
                      {task.status === "OPEN"
                        ? "Acknowledge"
                        : task.status === "ACKNOWLEDGED"
                        ? "Start Task"
                        : task.status === "IN_PROGRESS"
                        ? "Mark Done ✓"
                        : "Reopen"}
                    </Button>
                  </div>
                </div>

                {/* Specific Card Details: Tour Consolidation */}
                {task.consolidation ? (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#F8F5EE] dark:bg-[#1A2521] border border-[#E5DBD0] dark:border-[#2D3D36] text-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-[#6B7B74] block">Booked vs Min Pax</span>
                        <span className="font-bold text-sm text-[#303A36] dark:text-[#F5EBDD]">
                          {task.consolidation.booked} / {task.consolidation.capacity} pax (Min: {task.consolidation.minViablePax})
                        </span>
                      </div>
                      <div className="border-l border-[#E5DBD0] pl-3">
                        <span className="text-[10px] text-[#6B7B74] block">Recommendation</span>
                        <span className="font-extrabold text-sm text-[#E8A45B]">
                          {task.consolidation.recommendation}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#6B7B74] block">Departure</span>
                      <span className="font-mono font-bold">
                        {new Date(task.consolidation.departsAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Specific Card Details: Bilingual Airport Pickup */}
                {task.pickup?.card ? (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#F8F5EE] dark:bg-[#1A2521] border border-[#E5DBD0] dark:border-[#2D3D36] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#28594E] dark:text-[#D8E6DA] flex items-center gap-1.5">
                        <Plane className="size-3.5" /> Bilingual Driver Card (Ready for WhatsApp / LINE)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyBilingualCard(
                            task._id,
                            `${task.pickup?.card?.en}\n\n${task.pickup?.card?.th}`
                          )
                        }
                        className="h-6 text-[10px] text-[#28594E] dark:text-[#D8E6DA] hover:bg-[#D8E6DA]/50"
                      >
                        <Copy className="size-3 mr-1" />
                        {copiedCardId === task._id ? "Copied!" : "Copy Card"}
                      </Button>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-[#202C27] font-mono text-[11px] text-[#303A36] dark:text-[#D8E6DA] whitespace-pre-line">
                      {task.pickup.card.en}
                      <span className="block mt-1 text-[#6B7B74] dark:text-[#8FA299]">
                        {task.pickup.card.th}
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Specific Card Details: Housekeeping Turnaround */}
                {task.housekeeping ? (
                  <div className="mt-3 flex items-center gap-4 text-xs text-[#6B7B74] dark:text-[#8FA299]">
                    <span>Room: <strong className="text-[#28594E] dark:text-[#D8E6DA]">{task.housekeeping.roomNumber}</strong></span>
                    {task.housekeeping.guestName ? (
                      <span>Guest: <strong>{task.housekeeping.guestName}</strong></span>
                    ) : null}
                    {task.housekeeping.isVip ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#E8A45B]/20 text-[#303A36] dark:text-[#E8A45B] font-bold text-[10px]">
                        VIP ARRIVAL
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
