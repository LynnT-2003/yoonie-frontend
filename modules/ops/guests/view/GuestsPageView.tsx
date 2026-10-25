"use client";

import * as React from "react";
import { Car, Compass, Mail, MessageCircle, Phone, Search, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/form";
import type { GuestStatus, GuestView } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { DateNav } from "@/modules/ops/components/DateNav";
import { Folio } from "@/modules/ops/components/Folio";
import { FlightEditor } from "@/modules/ops/components/FrontDesk";
import { EmptyState, LiveIndicator, OpsPage, OpsPageHeader, Panel, StatTile } from "@/modules/ops/components/OpsPage";
import { formatThb, shortDate, weekday } from "@/modules/ops/components/format";
import { roomTypeLabel } from "@/modules/ops/components/roomStatus";
import type { GuestFilter, GuestsPageVm } from "../viewModel/guestsPageVm";

const STATUS: Record<GuestStatus, { label: string; tone: "warning" | "brand" | "neutral" | "info" }> = {
  ARRIVING: { label: "Arriving", tone: "warning" },
  IN_HOUSE: { label: "In house", tone: "brand" },
  DEPARTING: { label: "Departing", tone: "info" },
  UPCOMING: { label: "Upcoming", tone: "neutral" },
};

const SERVICE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  AIRPORT_TRANSFER: Car,
  SCHEDULED_TOUR: Compass,
  SPA_TREATMENT: Sparkles,
};

const FILTERS: { value: GuestFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ARRIVING", label: "Arriving" },
  { value: "IN_HOUSE", label: "In house" },
  { value: "DEPARTING", label: "Departing" },
  { value: "UPCOMING", label: "Next 7 days" },
  { value: "VIP", label: "VIP" },
  { value: "OWES", label: "Balance due" },
];

const flag = (code?: string) =>
  code && code.length === 2
    ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))
    : "";

export function GuestsPageView({ vm }: { vm: GuestsPageVm }) {
  const s = vm.board?.summary;
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
        title="Guests"
        description={`${weekday(vm.date)} ${shortDate(vm.date)}${vm.isToday ? " · today" : ""} — who's here, who's coming, and what they've booked`}
        actions={<DateNav date={vm.date} today={vm.today} onChange={vm.setDate} />}
      />

      {vm.isError && !vm.board ? (
        <EmptyState
          title="Couldn't load guests"
          action={<Button size="sm" variant="outline" onClick={() => vm.refetch()}>Try again</Button>}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile
          label="In house tonight"
          value={s?.inHouse ?? "—"}
          detail={s ? `${s.arriving} arriving today` : undefined}
          active={vm.filter === "IN_HOUSE"}
          onClick={() => vm.setFilter(vm.filter === "IN_HOUSE" ? "ALL" : "IN_HOUSE")}
        />
        <StatTile
          label="Departing"
          value={s?.departing ?? "—"}
          active={vm.filter === "DEPARTING"}
          onClick={() => vm.setFilter(vm.filter === "DEPARTING" ? "ALL" : "DEPARTING")}
        />
        <StatTile
          label="Next 7 days"
          value={s?.upcoming ?? "—"}
          detail="Confirmed arrivals"
          active={vm.filter === "UPCOMING"}
          onClick={() => vm.setFilter(vm.filter === "UPCOMING" ? "ALL" : "UPCOMING")}
        />
        <StatTile
          label="VIPs in house"
          value={s?.vipInHouse ?? "—"}
          detail={s ? `${s.returning} returning guests` : undefined}
          active={vm.filter === "VIP"}
          onClick={() => vm.setFilter(vm.filter === "VIP" ? "ALL" : "VIP")}
        />
        <StatTile
          label="Balance due"
          value={s ? formatThb(s.outstandingThb) : "—"}
          detail="Unpaid across these guests"
          tone={s?.outstandingThb ? "warning" : "default"}
          active={vm.filter === "OWES"}
          onClick={() => vm.setFilter(vm.filter === "OWES" ? "ALL" : "OWES")}
        />
      </div>

      <Panel
        title="Guest list"
        meta={vm.board ? `${vm.guests.length} of ${vm.board.guests.length}` : undefined}
        bodyClassName="p-0"
      >
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter guests">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={vm.filter === f.value}
                onClick={() => vm.setFilter(f.value)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-[13px] transition-colors",
                  vm.filter === f.value
                    ? "bg-secondary font-medium text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder="Name, email, room or booking"
              className="h-8 pl-8 text-[13px]"
              aria-label="Search guests"
            />
            {vm.search ? (
              <button
                type="button"
                onClick={() => vm.setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {vm.isLoading ? (
          <div className="m-4 h-40 animate-pulse rounded-md bg-muted" />
        ) : vm.guests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Guest</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Room &amp; dates</th>
                  <th className="px-3 py-2 font-medium">Services</th>
                  <th className="px-4 py-2 text-right font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vm.guests.map((g) => (
                  <GuestRow key={g.guestId} guest={g} onOpen={() => vm.openGuest(g.guestId)} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState title="No guests match" description="Try another filter or date." />
          </div>
        )}
      </Panel>

      <GuestSheet guest={vm.selectedGuest} onClose={vm.closeGuest} />
    </OpsPage>
  );
}

function GuestRow({ guest: g, onOpen }: { guest: GuestView; onOpen: () => void }) {
  const stay = g.stays[0];
  return (
    <tr onClick={onOpen} className="cursor-pointer hover:bg-muted">
      <td className="px-4 py-2.5">
        <button type="button" onClick={onOpen} className="text-left">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            {flag(g.nationality)} {g.name}
            {g.vipTier !== "NONE" ? <Badge tone="warning">{g.vipTier.toLowerCase()}</Badge> : null}
          </span>
          <span className="block text-xs text-muted-foreground">
            {g.isReturning ? `Returning · ${g.stayCount} past stays` : "First stay"}
            {g.lineUserId ? " · LINE" : g.phone ? " · WhatsApp" : ""}
          </span>
        </button>
      </td>
      <td className="px-3 py-2.5">
        <Badge tone={STATUS[g.status].tone}>{STATUS[g.status].label}</Badge>
      </td>
      <td className="px-3 py-2.5">
        {stay?.roomNumber ? (
          <span className="font-mono font-medium tabular-nums">{stay.roomNumber}</span>
        ) : (
          <span className="text-xs font-medium text-warning">Unassigned</span>
        )}
        <span className="block text-xs text-muted-foreground">
          {stay ? `${shortDate(stay.checkInDate)} – ${shortDate(stay.checkOutDate)} · ${stay.pax} pax` : ""}
          {g.stays.length > 1 ? ` · +${g.stays.length - 1} more` : ""}
        </span>
      </td>
      <td className="px-3 py-2.5">
        {g.services.length ? (
          <span className="flex flex-wrap gap-1">
            {g.services.slice(0, 3).map((sv) => {
              const Icon = SERVICE_ICON[sv.kind] ?? Compass;
              return (
                <span
                  key={sv.lineId}
                  className="inline-flex items-center gap-1 rounded bg-subtle px-1.5 py-0.5 text-xs text-muted-foreground"
                  title={`${sv.name} · ${shortDate(sv.date)} ${sv.time}`}
                >
                  <Icon className="size-3" aria-hidden /> {shortDate(sv.date)} {sv.time}
                </span>
              );
            })}
            {g.services.length > 3 ? <span className="text-xs text-muted-foreground">+{g.services.length - 3}</span> : null}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums">
        {g.dueThb ? formatThb(g.dueThb) : <span className="text-success">Settled</span>}
      </td>
    </tr>
  );
}

function GuestSheet({ guest, onClose }: { guest?: GuestView; onClose: () => void }) {
  return (
    <Dialog open={Boolean(guest)} onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent size="md">{guest ? <GuestSheetBody guest={guest} /> : null}</SheetContent>
    </Dialog>
  );
}

function GuestSheetBody({ guest: g }: { guest: GuestView }) {
  return (
    <>
      <div className="border-b border-border px-6 py-5 pr-14">
        <DialogTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold">
          {flag(g.nationality)} {g.name}
          <Badge tone={STATUS[g.status].tone}>{STATUS[g.status].label}</Badge>
          {g.vipTier !== "NONE" ? <Badge tone="warning">{g.vipTier.toLowerCase()} · {g.vipScore}</Badge> : null}
        </DialogTitle>
        <DialogDescription className="mt-1 text-[13px]">
          {g.isReturning
            ? `Returning guest · ${g.stayCount} past stays · ${formatThb(g.lifetimeSpendThb)} lifetime`
            : "First stay with us"}
          {" · speaks "}
          {g.language === "th" ? "Thai" : "English"}
        </DialogDescription>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {g.email ? (
            <a href={`mailto:${g.email}`} className="flex items-center gap-1 hover:text-foreground">
              <Mail className="size-3" /> {g.email}
            </a>
          ) : null}
          {g.phone ? (
            <a href={`tel:${g.phone}`} className="flex items-center gap-1 hover:text-foreground">
              <Phone className="size-3" /> {g.phone}
            </a>
          ) : null}
          {g.lineUserId ? (
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3" /> LINE {g.lineUserId}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <section className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Stays</h3>
          {g.stays.map((st) => (
            <div key={`${st.orderId}-${st.checkInDate}`} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-xs">
              <div>
                <p className="text-sm font-medium">
                  <span className="font-mono">{st.roomNumber ?? "Unassigned"}</span> · {roomTypeLabel(st.roomType)}
                </p>
                <p className="text-muted-foreground">
                  {shortDate(st.checkInDate)} – {shortDate(st.checkOutDate)} · {st.nights}n · {st.pax} pax
                </p>
              </div>
              <span className="font-mono text-muted-foreground">{st.orderNumber}</span>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Services</h3>
          {g.services.length ? (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {g.services.map((sv) => {
                const Icon = SERVICE_ICON[sv.kind] ?? Compass;
                return (
                  <li key={sv.lineId} className="px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{sv.name}</span>
                        <span className="text-muted-foreground">
                          {weekday(sv.date)} {shortDate(sv.date)}
                          {sv.kind === "AIRPORT_TRANSFER" && !sv.flightNumber ? "" : ` ${sv.time}`} · {sv.pax}{" "}
                          {sv.pax === 1 ? "guest" : "guests"}
                          {sv.flightNumber ? ` · ${sv.flightNumber}` : ""}
                        </span>
                        {sv.kind === "AIRPORT_TRANSFER" && !sv.flightNumber ? (
                          <span className="block text-destructive">No flight details — pickup can&apos;t be scheduled</span>
                        ) : null}
                      </span>
                      <span className="tabular-nums">{formatThb(sv.amountThb)}</span>
                    </div>
                    {sv.kind === "AIRPORT_TRANSFER" ? (
                      <div className="mt-1.5 flex flex-wrap justify-end">
                        <FlightEditor
                          key={`${sv.flightNumber}-${sv.date}-${sv.time}`}
                          orderId={sv.orderId}
                          lineId={sv.lineId}
                          flightNumber={sv.flightNumber}
                          landingAt={
                            sv.flightNumber ? new Date(`${sv.date}T${sv.time}:00+07:00`).toISOString() : undefined
                          }
                          defaultDate={sv.date}
                        />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-4 py-4 text-center text-[13px] text-muted-foreground">
              No services booked — a chance to offer a transfer, tour or spa
            </p>
          )}
        </section>

        {g.folios.map((f) => (
          <section key={f.orderId} className="space-y-2">
            <h3 className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Folio</span>
              <span className="font-mono">{f.orderNumber}</span>
            </h3>
            <div className="rounded-lg border border-border p-4">
              <Folio charges={f.charges} orderId={f.orderId} />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
