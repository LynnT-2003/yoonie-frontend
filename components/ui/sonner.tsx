"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/** shadcn-style Sonner toaster themed with the app's tokens. */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-border !bg-popover !text-popover-foreground !shadow-lg !font-sans !gap-2.5",
          title: "!text-[13px] !font-semibold",
          description: "!text-xs !text-muted-foreground",
          success: "[&_[data-icon]]:!text-success",
          error: "[&_[data-icon]]:!text-destructive",
          info: "[&_[data-icon]]:!text-info",
          closeButton: "!border-border !bg-popover !text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
