"use client";
// The surface other code uses to talk to the voice agent and to Ledgerline.
//   onLedgerlineEvent(fn)  raw Ledgerline events (re-exported from src/lib/ledgerline.ts)
//   sendToAgent(text)      silent context for the agent; { respond: true } makes it speak
//   AgentUiState           what the panel shows

export { onLedgerlineEvent } from "@/lib/ledgerline";

export type AgentUiState =
  | "not_started" // no session yet
  | "connecting"
  | "listening" // connected, expert working, agent may ask at the next pause
  | "quiet" // a question is waiting but the expert is busy (typing, reading, talking)
  | "asking" // agent is speaking
  | "off_record" // mic muted, events not forwarded or recorded
  | "debrief"
  | "building"; // turning the session into a Work Map

export const STATE_LABEL: Record<AgentUiState, string> = {
  not_started: "Not started",
  connecting: "Connecting…",
  listening: "Listening",
  quiet: "Quiet",
  asking: "Asking",
  off_record: "Off the record",
  debrief: "Debrief",
  building: "Building Work Map…",
};

interface Sink {
  context(text: string): void;
  message(text: string): void;
}

let sink: Sink | null = null;

/** Called by the panel when a voice session is live. */
export function registerAgent(s: Sink): () => void {
  sink = s;
  return () => {
    if (sink === s) sink = null;
  };
}

/** Send text to the live agent. Returns false when no session is running. */
export function sendToAgent(text: string, opts: { respond?: boolean } = {}): boolean {
  if (!sink) return false;
  if (opts.respond) sink.message(text);
  else sink.context(text);
  return true;
}
