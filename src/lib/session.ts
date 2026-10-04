// localStorage persistence for the captured session and the generated Work Map.
import { sampleWorkMap, capturedSessionEnabled } from "@/data/sampleWorkMap";
import type { ReviewItem, ScreenEvent, StepMastery, TranscriptLine, WorkMap, WorkflowRecord } from "./types";

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

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // e.g. storage full
  }
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

/** The map Teaching mode uses: the expert's own once he published it, else the prepared one. */
export function loadTeachingMap(): WorkMap {
  const map = loadWorkMap();
  return capturedSessionEnabled && map?.published ? map : sampleWorkMap;
}

// ---------- Teaching → supervisor review ----------
const REVIEW_KEY = "apprentice.reviews";
export interface ReviewBatch {
  learner: string;
  items: ReviewItem[];
  submitted: boolean;
}
export const loadReviews = () => read<ReviewBatch>(REVIEW_KEY);
export const saveReviews = (b: ReviewBatch) => write(REVIEW_KEY, b);

// ---------- Workflow library: every recording, saved under its name ----------
const LIB_KEY = "torchbearer.workflows";

/** The prepared example: always available, already approved. */
export const EXAMPLE_ID = "example";
export const exampleWorkflow = (): WorkflowRecord => ({
  id: EXAMPLE_ID,
  name: "Meal expense report (prepared example)",
  createdAt: "2026-10-03T09:00:00Z",
  map: { ...sampleWorkMap, published: true },
});

export const listWorkflows = (): WorkflowRecord[] => read<WorkflowRecord[]>(LIB_KEY) ?? [];
export const getWorkflow = (id: string | null | undefined): WorkflowRecord | null =>
  id === EXAMPLE_ID ? exampleWorkflow() : listWorkflows().find((w) => w.id === id) ?? null;

export function saveWorkflow(record: WorkflowRecord) {
  if (record.id === EXAMPLE_ID) return;
  const others = listWorkflows().filter((w) => w.id !== record.id);
  if (write(LIB_KEY, [record, ...others])) return;
  // Storage full: keep this workflow's screenshots, drop the older ones', and retry.
  const slim = others.map((w) => ({ ...w, map: { ...w.map, steps: w.map.steps.map((s) => ({ ...s, screenshot: undefined })) } }));
  write(LIB_KEY, [record, ...slim]);
}

export function deleteWorkflow(id: string) {
  write(LIB_KEY, listWorkflows().filter((w) => w.id !== id));
}

// ---------- Teaching: learned / relearn per step, per workflow and learner ----------
const progressKey = (workflowId: string, learner: string) => `torchbearer.progress.${workflowId}.${learner}`;
export const loadMastery = (workflowId: string, learner: string) => read<Record<string, StepMastery>>(progressKey(workflowId, learner)) ?? {};
export function saveMastery(workflowId: string, learner: string, mastery: Record<string, StepMastery>) {
  write(progressKey(workflowId, learner), { ...loadMastery(workflowId, learner), ...mastery });
}
