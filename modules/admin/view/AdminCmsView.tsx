"use client";

import * as React from "react";
import { BedDouble, Building2, Compass, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BranchSettingsPanel } from "../components/BranchSettingsPanel";
import { RoomInventoryPanel } from "../components/RoomInventoryPanel";
import { RestaurantOutletsPanel } from "../components/RestaurantOutletsPanel";
import { ExperienceCatalogPanel } from "../components/ExperienceCatalogPanel";
import type { AdminCmsVm, AdminTab } from "../viewModel/adminCmsVm";

const SECTIONS: Array<{ id: AdminTab; label: string; description: string; icon: typeof Building2 }> = [
  {
    id: "BRANCH",
    label: "Property",
    description: "Profile, contact details, policies and brand imagery shown to guests.",
    icon: Building2,
  },
  {
    id: "ROOMS",
    label: "Rooms",
    description: "Physical room inventory, rates, amenities and photography.",
    icon: BedDouble,
  },
  {
    id: "RESTAURANTS",
    label: "Dining",
    description: "Restaurant outlets, service periods and table configuration.",
    icon: UtensilsCrossed,
  },
  {
    id: "SERVICES",
    label: "Experiences",
    description: "Tours, transfers and wellness treatments sold alongside stays.",
    icon: Compass,
  },
];

export function AdminCmsView({ vm }: { vm: AdminCmsVm }) {
  const {
    activeTab,
    setActiveTab,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    activeBranch,
    refetchBranches,
  } = vm;

  const section = SECTIONS.find((s) => s.id === activeTab) ?? SECTIONS[0];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
      {/* ─── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="flex shrink-0 flex-col gap-6 lg:sticky lg:top-24 lg:h-fit lg:w-60">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Property</span>
          {branches.length > 0 ? (
            <Select
              value={selectedBranchId}
              onValueChange={(val) => setSelectedBranchId(val)}
            >
              <SelectTrigger aria-label="Select property" className="w-full">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-9 animate-pulse rounded-md bg-subtle" />
          )}
        </div>

        <nav aria-label="Content sections" className="-mx-1 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          <span className="hidden px-3 pb-1 text-xs font-medium text-muted-foreground lg:block">Content</span>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeTab === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveTab(s.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-surface font-medium text-foreground shadow-xs ring-1 ring-border"
                    : "text-muted-foreground hover:bg-subtle hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {s.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <header className="flex flex-col gap-1 border-b border-border pb-5">
          <p className="text-xs font-medium text-muted-foreground">
            {activeBranch ? activeBranch.name : "Loading property…"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{section.label}</h1>
          <p className="text-sm text-muted-foreground">{section.description}</p>
        </header>

        {activeBranch ? (
          <>
            {activeTab === "BRANCH" && (
              <BranchSettingsPanel branch={activeBranch} onRefresh={() => void refetchBranches()} />
            )}
            {activeTab === "ROOMS" && <RoomInventoryPanel branchId={activeBranch._id} />}
            {activeTab === "RESTAURANTS" && <RestaurantOutletsPanel branchId={activeBranch._id} />}
            {activeTab === "SERVICES" && <ExperienceCatalogPanel branchId={activeBranch._id} />}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="h-10 w-full animate-pulse rounded-md bg-subtle" />
            <div className="h-64 w-full animate-pulse rounded-lg bg-subtle" />
          </div>
        )}
      </div>
    </div>
  );
}
