"use client";

import * as React from "react";
import { Pencil, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { ApiError } from "@/lib/domain/api/ApiError";
import { useRecordPaymentMutation, useUpdateFlightMutation } from "@/lib/domain/hospitality/hospitality-api";
import type { PaymentMethod } from "@/lib/types/hospitality";
import { cn } from "@/lib/utils";
import { formatThb } from "./format";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  PROMPTPAY: "PromptPay",
  BANK_TRANSFER: "Bank transfer",
};

const errorText = (err: unknown) => (err instanceof ApiError ? err.message : err ? "Something went wrong" : null);

/** Take money at the desk: defaults to the full balance, accepts a deposit, never more than owed. */
export function RecordPayment({ orderId, dueThb }: { orderId: string; dueThb: number }) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(String(dueThb));
  const [method, setMethod] = React.useState<PaymentMethod>("CARD");
  const [reference, setReference] = React.useState("");
  const mutation = useRecordPaymentMutation();

  if (!open) {
    return (
      <Button
        size="sm"
        className="w-full"
        onClick={() => {
          setAmount(String(dueThb));
          mutation.reset();
          setOpen(true);
        }}
      >
        Record payment
      </Button>
    );
  }

  const value = Number(amount);
  const invalid = !Number.isFinite(value) || value <= 0 || value > dueThb;
  return (
    <form
      className="space-y-2 rounded-md bg-subtle p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (invalid) return;
        mutation.mutate(
          { orderId, amountThb: value, method, reference: reference.trim() || undefined },
          {
            onSuccess: () => {
              setOpen(false);
              toast.success(`${formatThb(value)} received · ${PAYMENT_METHOD_LABEL[method]}`, {
                description: value < dueThb ? `${formatThb(dueThb - value)} still due` : "Booking paid in full",
              });
            },
          }
        );
      }}
    >
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Payment method">
        {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={method === m}
            onClick={() => setMethod(m)}
            className={cn(
              "h-7 rounded-md border px-2.5 text-xs transition-colors",
              method === m
                ? "border-primary bg-secondary font-medium text-secondary-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            )}
          >
            {PAYMENT_METHOD_LABEL[m]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={1}
          max={dueThb}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-8 text-[13px]"
          aria-label="Amount in baht"
        />
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Slip / reference"
          className="h-8 text-[13px]"
          aria-label="Payment reference"
        />
      </div>
      <p className={cn("text-xs", mutation.isError ? "text-destructive" : "text-muted-foreground")}>
        {errorText(mutation.error) ??
          (value > 0 && value < dueThb
            ? `Deposit — ${formatThb(dueThb - value)} will remain due`
            : "Settles the booking in full")}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={invalid || mutation.isPending}>
          {mutation.isPending ? "Saving…" : `Take ${Number.isFinite(value) && value > 0 ? formatThb(value) : "payment"}`}
        </Button>
      </div>
    </form>
  );
}

/** Hotel-local date + time → ISO, so staff type the time the guest sees on their ticket. */
const toIso = (date: string, time: string) => new Date(`${date}T${time}:00+07:00`).toISOString();
const isoToLocal = (iso?: string) => {
  if (!iso) return { date: "", time: "" };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
};

/** Add or correct the arrival flight on a transfer; the pickup and room prep re-plan themselves. */
export function FlightEditor({
  orderId,
  lineId,
  flightNumber,
  landingAt,
  meetingDoor,
  defaultDate,
}: {
  orderId: string;
  lineId: string;
  flightNumber?: string;
  landingAt?: string;
  meetingDoor?: number;
  defaultDate: string;
}) {
  const local = isoToLocal(landingAt);
  const [open, setOpen] = React.useState(false);
  const [number, setNumber] = React.useState(flightNumber ?? "");
  const [date, setDate] = React.useState(local.date || defaultDate);
  const [time, setTime] = React.useState(local.time);
  const [door, setDoor] = React.useState(meetingDoor ? String(meetingDoor) : "");
  const mutation = useUpdateFlightMutation();

  if (!open) {
    return (
      <Button
        size="xs"
        variant={flightNumber ? "ghost" : "default"}
        onClick={() => {
          mutation.reset();
          setOpen(true);
        }}
      >
        {flightNumber ? <Pencil /> : <Plane />}
        {flightNumber ? "Edit flight" : "Add flight"}
      </Button>
    );
  }

  const invalid = !number.trim() || !date || !time;
  return (
    <form
      className="mt-2 w-full space-y-2 rounded-md bg-subtle p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (invalid) return;
        mutation.mutate(
          {
            orderId,
            lineId,
            number: number.trim(),
            landingAt: toIso(date, time),
            meetingDoor: door ? Number(door) : undefined,
          },
          {
            onSuccess: () => {
              setOpen(false);
              toast.success(`Flight ${number.trim().toUpperCase()} saved · lands ${time}`, {
                description: "Pickup and room prep re-planned; the driver is told if the time moved",
              });
            },
          }
        );
      }}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="TG 930"
          className="h-8 text-[13px]"
          aria-label="Flight number"
        />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 text-[13px]" aria-label="Landing date" />
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-8 text-[13px]" aria-label="Landing time" />
        <Select value={door || "DEFAULT"} onValueChange={(v) => setDoor(v === "DEFAULT" ? "" : v)}>
          <SelectTrigger className="h-8 text-[13px]" aria-label="Meeting door">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEFAULT">Default door</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
              <SelectItem key={d} value={String(d)}>
                Door {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className={cn("text-xs", mutation.isError ? "text-destructive" : "text-muted-foreground")}>
        {errorText(mutation.error) ?? "Landing time in Bangkok time. The driver and room prep re-plan automatically."}
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={invalid || mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save flight"}
        </Button>
      </div>
    </form>
  );
}
