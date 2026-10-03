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

export const loadSession = () => read<CapturedSession>(SESSION_KEY);
export const saveSession = (s: CapturedSession) => write(SESSION_KEY, s);
export const loadWorkMap = () => read<WorkMap>(WORKMAP_KEY);
export const saveWorkMap = (m: WorkMap) => write(WORKMAP_KEY, m);
