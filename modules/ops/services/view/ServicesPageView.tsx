"use client";

import * as React from "react";
import { Car, ChevronDown, Compass, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceBoardItem, ServiceSlotView } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { DateNav } from "@/modules/ops/components/DateNav";
import {
  EmptyState,
  LiveIndicator,
  OpsPage,
  OpsPageHeader,
  Panel,
  SegmentedControl,
  StatTile,
} from "@/modules/ops/components/OpsPage";
import { formatThb, shortDate, weekday } from "@/modules/ops/components/format";
import type { ServiceFilter, ServicesPageVm } from "../viewModel/servicesPageVm";

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  AIRPORT_TRANSFER: Car,
  SCHEDULED_TOUR: Compass,
  SPA_TREATMENT: Sparkles,
};

const UNIT_LABEL = { seat: "seats", treatment: "treatments", pickup: "pickups" } as const;

export function ServicesPageView({ vm }: { vm: ServicesPageVm }) {
  const { board } = vm;
  const s = board?.summary;
  const peak = vm.peakPickupHour;

  return (
    <OpsPage>
      <OpsPageHeader
        eyebrow={
          <>
            <span>{vm.branch?.name ?? "—"}</span>
            <span aria-hidden>·</span>
            <LiveIndicator updatedAt={vm.updatedAt} isFetching={vm.isFetching} />
          </>
        }
        title="Services"
        description={`${weekday(vm.date)} ${shortDate(vm.date)}${vm.isToday ? " · today" : ""} — capacity, demand and margin for every transfer, tour and treatment`}
        actions={<DateNav date={vm.date} today={vm.today} onChange={vm.setDate} />}
      />

      {vm.isError && !board ? (
        <EmptyState
          title="Couldn't load services"
          action={<Button size="sm" variant="outline" onClick={() => vm.refetch()}>Try again</Button>}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile
          label="Service revenue"
          value={s ? formatThb(s.revenueThb) : "—"}
          detail={s ? `${formatThb(s.marginThb)} after ${formatThb(s.fixedCostThb)} running cost` : undefined}
        />
        <StatTile
          label="Seats & treatments sold"
          value={s ? `${s.seatsSold}/${s.seatsOffered}` : "—"}
          detail={s ? `${s.utilization}% of scheduled capacity` : undefined}
        >
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${s?.utilization ?? 0}%` }} />
          </div>
        </StatTile>
        <StatTile
          label="Unsold capacity"
          value={s?.unsoldSeats ?? "—"}
          detail="Empty seats and treatment slots"
          tone={s && s.seatsOffered && s.utilization < 40 ? "warning" : "default"}
        />
        <StatTile
          label="Below minimum"
          value={s?.belowMinimum ?? "—"}
          detail={
            s?.belowMinimum
              ? s.projectedLossThb
                ? `${formatThb(s.projectedLossThb)} projected loss — merge or cancel`
                : "Under operating minimum, still covering cost"
              : "Every departure is viable"
          }
          tone={s?.projectedLossThb ? "danger" : s?.belowMinimum ? "warning" : "success"}
        />
        <StatTile
          label="Airport pickups"
          value={s?.pickups ?? "—"}
          detail={
            s
              ? peak && peak.booked
                ? `Peak ${peak.time}: ${peak.booked}/${peak.capacity} vans`
                : `Fleet of ${s.fleetSize} vans`
              : undefined
          }
          tone={peak && peak.capacity && peak.booked >= peak.capacity ? "warning" : "default"}
        />
      </div>

      {board ? <WeekGrid services={board.services} days={board.days} date={vm.date} onPick={vm.setDate} /> : null}

      <div className="flex items-center justify-between gap-3">
        <SegmentedControl<ServiceFilter>
          label="Service type"
          value={vm.filter}
          onChange={vm.setFilter}
          options={[
            { value: "ALL", label: "All" },
            { value: "AIRPORT_TRANSFER", label: "Transfers" },
            { value: "SCHEDULED_TOUR", label: "Tours" },
            { value: "SPA_TREATMENT", label: "Spa" },
          ]}
        />
      </div>

      {vm.isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      ) : vm.services.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {vm.services.map((svc) => (
            <ServiceCard key={svc.serviceId} service={svc} />
          ))}
        </div>
      ) : (
        <EmptyState title="No services of this type" />
      )}
    </OpsPage>
  );
}

/** Seven days of fill per service — where there's room to sell, and where you're about to run out. */
function WeekGrid({
  services,
  days,
  date,
  onPick,
}: {
  services: ServiceBoardItem[];
  days: string[];
  date: string;
  onPick: (d: string) => void;
}) {
  return (
    <Panel title="Availability" meta="next 7 days · sold / offered" bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-[13px]">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">Service</th>
              {days.map((d) => (
                <th key={d} className={cn("px-2 py-2 text-center font-medium", d === date && "text-foreground")}>
                  <button type="button" onClick={() => onPick(d)} className="hover:text-foreground">
                    {weekday(d)} {shortDate(d)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((svc) => (
              <tr key={svc.serviceId}>
                <td className="max-w-[14rem] truncate px-4 py-2 text-foreground">{svc.name}</td>
                {svc.week.map((w) => (
                  <td key={w.date} className="px-1.5 py-1.5">
                    <WeekCell unit={svc.unit} sold={w.sold} offered={w.offered} utilization={w.utilization} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function WeekCell({
  unit,
  sold,
  offered,
  utilization,
}: {
  unit: ServiceBoardItem["unit"];
  sold: number;
  offered: number | null;
  utilization: number | null;
}) {
  if (unit === "pickup") {
    return (
      <div className="rounded-md px-2 py-1.5 text-center tabular-nums text-muted-foreground">
        {sold ? <span className="text-foreground">{sold}</span> : "–"}
      </div>
    );
  }
  const u = utilization ?? 0;
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1.5 text-center tabular-nums",
        u >= 90 ? "bg-warning-soft text-warning" : u >= 40 ? "bg-success-soft text-success" : u > 0 ? "bg-secondary text-secondary-foreground" : "bg-subtle text-muted-foreground"
      )}
      title={`${u}% sold`}
    >
      {sold}/{offered}
    </div>
  );
}

function ServiceCard({ service }: { service: ServiceBoardItem }) {
  const Icon = KIND_ICON[service.kind] ?? Compass;
  const t = service.today;
  const isPickup = service.unit === "pickup";
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {service.name}
        </span>
      }
      meta={`${formatThb(service.priceThb)} ${service.pricingModel === "PER_PAX" ? "per guest" : service.pricingModel === "PER_VEHICLE" ? "per vehicle" : "per treatment"}`}
      bodyClassName="p-0"
    >
      <div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-3 text-xs">
        <div>
          <p className="text-muted-foreground">{isPickup ? "Pickups" : "Sold"}</p>
          <p className="text-sm font-medium tabular-nums">
            {t.sold}
            {t.offered !== null ? <span className="text-muted-foreground">/{t.offered}</span> : null}
            {t.utilization !== null ? <span className="ml-1 text-xs text-muted-foreground">({t.utilization}%)</span> : null}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Revenue</p>
          <p className="text-sm font-medium tabular-nums">{formatThb(t.revenueThb)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t.fixedCostThb ? "Margin after cost" : "Running cost"}</p>
          <p className={cn("text-sm font-medium tabular-nums", t.marginThb < 0 && "text-destructive")}>
            {t.fixedCostThb ? formatThb(t.marginThb) : "not tracked"}
          </p>
        </div>
      </div>
      {service.slots.length ? (
        <ul className="divide-y divide-border">
          {service.slots.map((slot) => (
            <SlotRow key={slot.startsAt} slot={slot} unit={service.unit} />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
          {isPickup ? "No pickups booked" : "Nothing scheduled"}
        </p>
      )}
    </Panel>
  );
}

function SlotRow({ slot, unit }: { slot: ServiceSlotView; unit: ServiceBoardItem["unit"] }) {
  const [open, setOpen] = React.useState(false);
  const full = slot.available === 0 && slot.capacity > 0;
  const pct = (n: number) => (slot.capacity ? `${(n / slot.capacity) * 100}%` : "0%");
  const state = slot.belowMinimum ? (
    <Badge tone={slot.marginThb < 0 ? "danger" : "warning"}>Below min {slot.minViablePax}</Badge>
  ) : full ? (
    <Badge tone="warning">Full</Badge>
  ) : slot.booked === 0 ? (
    <Badge tone="neutral">{unit === "seat" ? "Won't run" : "Open"}</Badge>
  ) : (
    <Badge tone="success">{slot.available} left</Badge>
  );

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={!slot.bookings.length}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left enabled:hover:bg-muted disabled:cursor-default"
      >
        <span className="w-11 shrink-0 text-[13px] font-medium tabular-nums">{slot.time}</span>
        <span className="min-w-0 flex-1">
          {/* capacity bar: booked solid, held striped, minimum as a tick */}
          <span className="relative block h-2 overflow-hidden rounded-full bg-muted">
            <span className="absolute inset-y-0 left-0 bg-primary" style={{ width: pct(slot.booked) }} />
            <span
              className="absolute inset-y-0 bg-primary/40"
              style={{ left: pct(slot.booked), width: pct(slot.held) }}
            />
          </span>
          {slot.minViablePax ? (
            <span className="relative block h-0">
              <span
                className="absolute -top-2.5 h-3 w-px bg-foreground/50"
                style={{ left: pct(slot.minViablePax) }}
                aria-hidden
              />
            </span>
          ) : null}
          <span className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {slot.booked}/{slot.capacity} {UNIT_LABEL[unit]}
              {slot.held ? ` · ${slot.held} held` : ""}
            </span>
            <span className="tabular-nums">
              {formatThb(slot.revenueThb)}
              {slot.fixedCostThb ? ` − ${formatThb(slot.fixedCostThb)} cost` : ""}
            </span>
          </span>
        </span>
        <span className="shrink-0">{state}</span>
        <ChevronDown
          className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180", !slot.bookings.length && "invisible")}
          aria-hidden
        />
      </button>
      {open ? (
        <ul className="space-y-1.5 bg-subtle px-4 py-2.5 pl-[4.25rem] text-xs">
          {slot.bookings.map((b) => (
            <li key={b.lineId} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">
                <span className="font-medium text-foreground">{b.guestName}</span>
                <span className="text-muted-foreground">
                  {b.roomNumber ? ` · room ${b.roomNumber}` : ""} · {b.pax} {b.pax === 1 ? "guest" : "guests"}
                  {b.flightNumber ? ` · ${b.flightNumber} ${b.flightTime ?? ""}` : ""}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatThb(b.amountThb)}
                {b.paymentStatus === "UNPAID" ? " · unpaid" : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
