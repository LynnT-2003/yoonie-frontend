"use client";

import * as React from "react";
import { Car, Compass, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LiveService } from "@/lib/types/hospitality";
import { Panel } from "@/modules/ops/components/OpsPage";
import { DISPATCH_STATUS } from "@/modules/ops/components/roomStatus";
import { PICKUP_STAGE } from "@/modules/ops/components/pickupStage";
import { formatThb } from "@/modules/ops/components/format";

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  AIRPORT_TRANSFER: Car,
  SCHEDULED_TOUR: Compass,
  SPA_TREATMENT: Sparkles,
};

/** What a service line still needs, or where it is in dispatch. */
export function ServiceState({ service }: { service: LiveService }) {
  if (service.needsDetails) return <Badge tone="danger">No flight details</Badge>;
  if (service.dispatch?.hasIssue) return <Badge tone="danger">Driver needs the desk</Badge>;
  if (service.dispatch?.stage && service.dispatch.status !== "DISMISSED") {
    const st = PICKUP_STAGE[service.dispatch.stage];
    return <Badge tone={st.tone}>{service.dispatch.driverName || service.dispatch.stage !== "ASSIGNED" ? st.step : "No driver"}</Badge>;
  }
  if (service.dispatch) {
    const s = DISPATCH_STATUS[service.dispatch.status] ?? DISPATCH_STATUS.OPEN;
    return <Badge tone={s.tone}>{s.label}</Badge>;
  }
  return <Badge tone="neutral">Booked</Badge>;
}

export function serviceDetail(service: LiveService) {
  if (service.serviceKind === "AIRPORT_TRANSFER") {
    if (!service.flightNumber) return "flight not provided";
    const parts = [service.flightNumber];
    if (service.meetingDoor) parts.push(`door ${service.meetingDoor}`);
    if (service.dispatch?.driverName) parts.push(service.dispatch.driverName);
    return parts.join(" · ");
  }
  return `${service.pax} ${service.pax === 1 ? "guest" : "guests"}`;
}

export function ServicesPanel({
  services,
  isToday,
  onOpenRoom,
}: {
  services: LiveService[];
  isToday: boolean;
  onOpenRoom: (roomNumber: string) => void;
}) {
  const total = services.reduce((n, s) => n + s.totalThb, 0);
  return (
    <Panel
      title={isToday ? "Services today" : "Services"}
      meta={services.length ? `${services.length} · ${formatThb(total)}` : undefined}
      bodyClassName="p-0"
    >
      {services.length ? (
        <ul className="divide-y divide-border">
          {services.map((s) => {
            const Icon = KIND_ICON[s.serviceKind] ?? Compass;
            const body = (
              <>
                <span className="w-10 shrink-0 text-[13px] font-medium tabular-nums text-foreground">{s.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate">{s.serviceName}</span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {s.roomNumber ? `${s.roomNumber} · ` : ""}
                    {s.guestName} · {serviceDetail(s)}
                  </span>
                </span>
                <span className="shrink-0">
                  <ServiceState service={s} />
                </span>
              </>
            );
            const cls = "flex w-full items-center gap-3 px-4 py-2.5 text-left";
            return (
              <li key={s.lineId}>
                {s.roomNumber ? (
                  <button type="button" onClick={() => onOpenRoom(s.roomNumber!)} className={`${cls} hover:bg-muted`}>
                    {body}
                  </button>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">No services scheduled</p>
      )}
    </Panel>
  );
}
