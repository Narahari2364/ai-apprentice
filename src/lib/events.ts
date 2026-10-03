// Tiny shared event bus. The ERP emits ScreenEvents; capture, voice agent and
// tutor subscribe. Vision-derived events should go through emit() too.
"use client";

import { useEffect, useState } from "react";
import type { ScreenEvent } from "./types";

type Listener = (event: ScreenEvent) => void;

const listeners = new Set<Listener>();
const history: ScreenEvent[] = [];
let sessionStart = Date.now();

export function elapsed(): string {
  const s = Math.floor((Date.now() - sessionStart) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Emit an event. `time` is filled in automatically if omitted. */
export function emit(event: Omit<ScreenEvent, "time"> & { time?: string }) {
  const full: ScreenEvent = { ...event, time: event.time ?? elapsed() };
  history.push(full);
  listeners.forEach((l) => l(full));
  return full;
}

/** Subscribe; returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// User activity (typing / pointer / scroll) — kept off the event log, used for pause detection.
const activityListeners = new Set<() => void>();
export function markActivity() {
  activityListeners.forEach((l) => l());
}
export function onActivity(listener: () => void): () => void {
  activityListeners.add(listener);
  return () => activityListeners.delete(listener);
}

export function getHistory(): ScreenEvent[] {
  return [...history];
}

export function resetSession() {
  history.length = 0;
  sessionStart = Date.now();
}

/** React hook: live list of events emitted since mount. */
export function useScreenEvents(): ScreenEvent[] {
  const [events, setEvents] = useState<ScreenEvent[]>([]);
  useEffect(() => subscribe((e) => setEvents((prev) => [...prev, e])), []);
  return events;
}
