import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared page frame for every /ops screen: same width, gutters and header rhythm. */
export function OpsPage({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function OpsPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">{eyebrow}</div>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Bordered surface with a compact title row, mirroring the tiles on the marketing site. */
export function Panel({
  title,
  meta,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-surface shadow-xs", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
          {meta ? <span className="truncate text-xs text-muted-foreground">{meta}</span> : null}
        </div>
        {actions}
      </div>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  detail,
  tone = "default",
  active,
  onClick,
  children,
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: "default" | "danger" | "warning" | "success";
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  const valueTone = {
    default: "text-foreground",
    danger: "text-destructive",
    warning: "text-warning",
    success: "text-success",
  }[tone];
  const body = (
    <>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-semibold tabular-nums tracking-tight", valueTone)}>{value}</p>
      {detail ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p> : null}
      {children}
    </>
  );
  const base = "flex flex-col justify-start rounded-lg border bg-surface p-4 text-left shadow-xs";
  if (!onClick) return <div className={cn(base, "border-border")}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        base,
        "transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      {body}
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-border bg-subtle p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-[5px] px-3 text-[13px] font-medium transition-colors",
            value === o.value
              ? "bg-surface text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** "Live · updated 12s ago" — re-renders itself so the age stays honest between polls. */
export function LiveIndicator({ updatedAt, isFetching }: { updatedAt?: number; isFetching?: boolean }) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(t);
  }, []);
  const age = updatedAt ? Math.max(0, Math.round((now - updatedAt) / 1000)) : null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn("size-1.5 rounded-full", isFetching ? "animate-pulse bg-warning" : "bg-success")}
        aria-hidden
      />
      Live
      {age !== null ? <span className="tabular-nums">· updated {age < 5 ? "just now" : `${age}s ago`}</span> : null}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-[13px] text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** Wall-clock time that ticks on an interval, for countdowns that must stay pure during render. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** The hotel's wall clock, so every deadline on screen has a "now" to read against. */
export function LiveClock({ timeZone = "Asia/Bangkok" }: { timeZone?: string }) {
  const now = useNow(10_000);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const time = new Date(now).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" suppressHydrationWarning>
      <Clock className="size-3" aria-hidden />
      <span className="font-medium tabular-nums text-foreground">{mounted ? time : "--:--"}</span>
      hotel time
    </span>
  );
}
