"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

/** Inline "why?" prompt for actions the audit trail needs a reason for. */
export function ReasonForm({
  placeholder,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  placeholder: string;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = React.useState("");
  return (
    <form
      className="flex w-full flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (reason.trim()) onSubmit(reason.trim());
      }}
    >
      <Input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={placeholder}
        className="h-8 flex-1 text-[13px]"
        aria-label="Reason"
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!reason.trim() || pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
