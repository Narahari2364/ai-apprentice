// localStorage persistence for the captured session and the generated Work Map.
import type { ScreenEvent, TranscriptLine, WorkMap } from "./types";

const SESSION_KEY = "apprentice.session";
const WORKMAP_KEY = "apprentice.workmap";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export interface CapturedSession {
  events: ScreenEvent[];
  transcript: TranscriptLine[];
}

const seconds = (t: string) => {
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
};

/** Give each step the screenshot taken closest to its screen moment. */
export function attachScreenshots(map: WorkMap, shots: Record<string, string>): WorkMap {
  const times = Object.keys(shots);
  if (!times.length) return map;
  return {
    ...map,
    steps: map.steps.map((step) => {
      const t = seconds(step.time);
      const best = times.reduce((a, b) => (Math.abs(seconds(b) - t) < Math.abs(seconds(a) - t) ? b : a));
      return { ...step, screenshot: shots[best] };
    }),
  };
}

/** Link each step to the Ledgerline document touched closest to its screen moment (within 90 s). */
export function attachDocs(map: WorkMap, events: ScreenEvent[]): WorkMap {
  const withDocs = events.filter((e) => e.docId);
  if (!withDocs.length) return map;
  return {
    ...map,
    steps: map.steps.map((step) => {
      if (step.docId) return step;
      const t = seconds(step.time);
      const best = withDocs.reduce((a, b) => (Math.abs(seconds(b.time) - t) < Math.abs(seconds(a.time) - t) ? b : a));
      return Math.abs(seconds(best.time) - t) <= 90 ? { ...step, docId: best.docId } : step;
    }),
  };
}

export const loadSession = () => read<CapturedSession>(SESSION_KEY);
export const saveSession = (s: CapturedSession) => write(SESSION_KEY, s);
export const loadWorkMap = () => read<WorkMap>(WORKMAP_KEY);
export const saveWorkMap = (m: WorkMap) => write(WORKMAP_KEY, m);
