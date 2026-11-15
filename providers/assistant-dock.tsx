"use client";

import * as React from "react";

/**
 * Open/closed state of the "Ask Yoonie" sidebar. Lives at the root so the top bar can toggle it
 * and the studio shell can render it. Starts closed; remembered per browser. ⌘K (or ⌘J) toggles.
 */

const KEY = "yoonie.dock.open";

type DockValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  /** false until an analysis has finished: there's nothing to ask about before that */
  available: boolean;
  setAvailable: (v: boolean) => void;
};
const Ctx = React.createContext<DockValue | null>(null);

export function AssistantDockProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = React.useState(false);
  const [available, setAvailable] = React.useState(false);

  React.useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* blocked storage */
    }
    // closed until the owner asks for it
    setOpenState(saved === "1");
  }, []);

  const setOpen = React.useCallback((v: boolean) => {
    setOpenState(v);
    try {
      localStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      /* blocked storage */
    }
  }, []);
  const toggle = React.useCallback(() => setOpenState((v) => {
    try {
      localStorage.setItem(KEY, v ? "0" : "1");
    } catch {
      /* blocked storage */
    }
    return !v;
  }), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (available && (e.metaKey || e.ctrlKey) && ["k", "j"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, available]);

  const value = React.useMemo(() => ({ open, setOpen, toggle, available, setAvailable }), [open, setOpen, toggle, available]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssistantDock() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAssistantDock must be used within AssistantDockProvider");
  return ctx;
}
