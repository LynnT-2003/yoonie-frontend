"use client";

import * as React from "react";
import { PAYMENT_METHOD_LABEL, RecordPayment } from "./FrontDesk";
import type { OrderCharges } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { formatThb } from "./format";

const pct = (rate: number) => `${Math.round(rate * 100)}%`;

function Row({
  label,
  detail,
  amount,
  muted,
  strong,
  struck,
}: {
  label: React.ReactNode;
  detail?: string;
  amount: number;
  muted?: boolean;
  strong?: boolean;
  struck?: boolean;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", muted && "text-muted-foreground", strong && "font-medium text-foreground")}>
      <dt className="min-w-0">
        <span className={cn("block truncate", struck && "line-through")}>{label}</span>
        {detail ? <span className="block truncate text-[11px] text-muted-foreground">{detail}</span> : null}
      </dt>
      <dd className={cn("shrink-0 tabular-nums", struck && "line-through")}>{formatThb(amount)}</dd>
    </div>
  );
}

/** Guest folio: every line, then how service charge and VAT build the total, then what's owed. */
export function Folio({ charges, orderId }: { charges: OrderCharges; orderId?: string }) {
  const c = charges;
  const unpaid = c.dueThb > 0;
  return (
    <dl className="space-y-2 text-xs">
      {c.lines.map((l) => (
        <Row key={l.lineId} label={l.label} detail={l.detail} amount={l.amountThb} struck={Boolean(l.status)} />
      ))}
      <div className="space-y-1 border-t border-border pt-2">
        <Row
          muted
          label="Subtotal"
          detail={[
            c.roomsThb ? `rooms ${formatThb(c.roomsThb)}` : null,
            c.servicesThb ? `services ${formatThb(c.servicesThb)}` : null,
            c.diningThb ? `dining ${formatThb(c.diningThb)}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          amount={c.subtotalThb}
        />
        {c.discountThb ? <Row muted label="Discount" amount={-c.discountThb} /> : null}
        <Row muted label={`Service charge ${pct(c.serviceChargeRate)}`} amount={c.serviceChargeThb} />
        <Row muted label={`VAT ${pct(c.vatRate)}`} detail="on subtotal + service charge" amount={c.vatThb} />
      </div>
      <div className="space-y-1 border-t border-border pt-2">
        <Row strong label="Total" amount={c.totalThb} />
        {c.payments.length ? (
          c.payments.map((p, i) => (
            <Row
              key={i}
              muted
              label={`Paid · ${PAYMENT_METHOD_LABEL[p.method] ?? p.method}`}
              detail={[
                new Date(p.receivedAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Bangkok",
                }),
                p.reference,
                p.receivedByName,
              ]
                .filter(Boolean)
                .join(" · ")}
              amount={-p.amountThb}
            />
          ))
        ) : (
          <Row muted label="Paid" amount={0} />
        )}
        <div className={cn("flex items-baseline justify-between gap-3 text-sm font-semibold", unpaid ? "text-foreground" : "text-success")}>
          <dt>{unpaid ? (c.paymentMethod === "PAY_AT_HOTEL" ? "Due at hotel" : "Balance due") : "Settled"}</dt>
          <dd className="tabular-nums">{formatThb(c.dueThb)}</dd>
        </div>
      </div>
      {orderId && unpaid ? (
        <div className="pt-1">
          <RecordPayment key={c.dueThb} orderId={orderId} dueThb={c.dueThb} />
        </div>
      ) : null}
    </dl>
  );
}
