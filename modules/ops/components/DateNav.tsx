"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { businessDate } from "./format";

export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Business-date state that starts on today in the hotel's timezone. */
export function useBusinessDate(timezone?: string) {
  const today = businessDate(timezone || "Asia/Bangkok");
  const [date, setDate] = React.useState(today);
  return { date, setDate, today, isToday: date === today };
}

export function DateNav({
  date,
  today,
  onChange,
}: {
  date: string;
  today: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button size="icon-sm" variant="outline" onClick={() => onChange(addDays(date, -1))} aria-label="Previous day">
        <ChevronLeft />
      </Button>
      <Input
        type="date"
        value={date}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="h-8 w-[9.5rem] text-[13px]"
        aria-label="Business date"
      />
      <Button size="icon-sm" variant="outline" onClick={() => onChange(addDays(date, 1))} aria-label="Next day">
        <ChevronRight />
      </Button>
      {date !== today ? (
        <Button size="sm" variant="ghost" onClick={() => onChange(today)}>
          Today
        </Button>
      ) : null}
    </div>
  );
}
