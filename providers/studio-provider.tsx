"use client";

import * as React from "react";
import type {
  Anomaly,
  Dataset,
  ExtractedField,
  Insight,
  PipelineEvent,
  Recommendation,
  SourceFile,
  StageId,
} from "@/lib/types/studio";
import { streamPipeline } from "@/lib/domain/studio/studio-api";

/**
 * Holds one analysis run and its result for the whole studio, so a run keeps streaming while
 * the owner moves between pages, and the latest result survives a reload (this browser only).
 */

export type StageState = { status: "waiting" | "running" | "done"; summary?: string; pct?: number; label?: string };

export type RunState = {
  status: "idle" | "running" | "done" | "error";
  stages: Record<StageId, StageState>;
  files: SourceFile[];
  anomalies: Anomaly[];
  fields: ExtractedField[];
  insights: Insight[];
  recommendations: Recommendation[];
  logs: string[];
  /** months as Structuring produces them, for the live chart */
  months: LiveMonth[];
  error?: string;
};

export type LiveMonth = { month: string; occupancy: number; revenue: number; costs: number | null };

const fresh = (): RunState => ({
  status: "idle",
  stages: {
    clean: { status: "waiting" },
    structure: { status: "waiting" },
    insights: { status: "waiting" },
    recommend: { status: "waiting" },
  },
  files: [],
  anomalies: [],
  fields: [],
  insights: [],
  recommendations: [],
  logs: [],
  months: [],
});

function reduce(s: RunState, e: PipelineEvent): RunState {
  switch (e.type) {
    case "stage":
      return {
        ...s,
        stages: {
          ...s.stages,
          [e.stage]: { ...s.stages[e.stage], status: e.status === "start" ? "running" : "done", summary: e.summary },
        },
      };
    case "log":
      return { ...s, logs: [...s.logs, e.message] };
    case "file":
      return { ...s, files: [...s.files, e.file] };
    case "anomaly":
      return { ...s, anomalies: [...s.anomalies, e.anomaly] };
    case "progress":
      return {
        ...s,
        months: e.month ? [...s.months, e.month] : s.months,
        stages: { ...s.stages, [e.stage]: { ...s.stages[e.stage], pct: e.pct, label: e.label } },
      };
    case "field":
      return { ...s, fields: [...s.fields, e.field] };
    case "insight":
      return { ...s, insights: [...s.insights, e.insight] };
    case "recommendation":
      return { ...s, recommendations: [...s.recommendations, e.recommendation] };
    case "result":
      return { ...s, status: "done" };
    case "error":
      return { ...s, status: "error", error: e.message };
  }
}

const DATASET_KEY = "yoonie.studio.dataset.v4";

/** Forget any analysis in this browser: called on sign-in and sign-out. */
export function clearStudioSession() {
  for (const store of [sessionStorage, localStorage]) {
    try {
      for (const k of Object.keys(store)) if (k.startsWith("yoonie.studio.")) store.removeItem(k);
    } catch {
      /* blocked storage */
    }
  }
}

/**
 * Results live in sessionStorage: they survive a reload in the same tab, but every new sign-in
 * (or new tab) starts empty. A judge signing in with the demo account always sees the upload.
 */
function load<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the result just won't survive a reload */
  }
}

type StudioContextValue = {
  run: RunState;
  dataset: Dataset | null;
  ready: boolean;
  start: (input: { files: File[] } | { demo: true }) => Promise<void>;
  cancel: () => void;
  clear: () => void;
};

const Ctx = React.createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [run, setRun] = React.useState<RunState>(fresh);
  const [dataset, setDataset] = React.useState<Dataset | null>(null);
  const [ready, setReady] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    setDataset(load<Dataset>(DATASET_KEY));
    setReady(true);
  }, []);

  const start = React.useCallback(async (input: { files: File[] } | { demo: true }) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setRun({ ...fresh(), status: "running" });
    try {
      await streamPipeline(
        input,
        (e) => {
          if (ac.signal.aborted) return;
          setRun((s) => reduce(s, e));
          if (e.type === "result") {
            setDataset(e.dataset);
            save(DATASET_KEY, e.dataset);
          }
        },
        ac.signal
      );
      setRun((s) => (s.status === "running" ? { ...s, status: "error", error: "The analysis stopped before it finished." } : s));
    } catch (err) {
      if (ac.signal.aborted) return;
      setRun((s) => ({ ...s, status: "error", error: err instanceof Error ? err.message : "Something went wrong." }));
    }
  }, []);

  const cancel = React.useCallback(() => {
    abortRef.current?.abort();
    setRun(fresh());
  }, []);

  const clear = React.useCallback(() => {
    abortRef.current?.abort();
    setRun(fresh());
    setDataset(null);
    save(DATASET_KEY, null);
  }, []);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const value = React.useMemo(
    () => ({ run, dataset, ready, start, cancel, clear }),
    [run, dataset, ready, start, cancel, clear]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudio() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
