"use client";
// Client for the Ledgerline expense mock (public/ledgerline/index.html) running in an iframe.
//  Events out: Ledgerline posts {source: 'expense-demo', event} to window.parent.
//  Commands in: we post {target: 'expense-demo', cmd, ...} to the iframe.
// Every Ledgerline event is
//  1. passed raw to onLedgerlineEvent() listeners (e.g. Teach answers save_requested),
//  2. user_activity → markActivity() for pause detection,
//  3. converted to a ScreenEvent and published on the shared bus (src/lib/events.ts).

import { emit, markActivity } from "./events";
import type { ExpenseSnapshot, ScreenEvent } from "./types";

export const CHANNEL = "expense-demo";

export interface LedgerEvent {
  id: number;
  type: string;
  t: number;
  user: string;
  role: "expert" | "new_hire";
  screen: string;
  [k: string]: unknown;
}

export type LedgerCommand =
  | { cmd: "guard"; enabled: boolean }
  | { cmd: "save_decision"; request_id: string; allow: boolean; title?: string; message?: string; fields?: string[]; note?: string }
  | { cmd: "highlight"; fields: string[]; message?: string }
  | { cmd: "clear_highlight" }
  | { cmd: "switch_user"; user: "sabine" | "lena" }
  | { cmd: "open_document"; doc_id: string }
  | { cmd: "reset" }
  | { cmd: "new_session" }
  | { cmd: "get_state"; request_id?: string };

let frame: HTMLIFrameElement | null = null;
const listeners = new Set<(e: LedgerEvent) => void>();

/** Subscribe to raw Ledgerline events. Returns an unsubscribe function. */
export function onLedgerlineEvent(fn: (e: LedgerEvent) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Send a command to the embedded Ledgerline. */
export function sendCommand(command: LedgerCommand) {
  frame?.contentWindow?.postMessage({ target: CHANNEL, ...command }, window.location.origin);
}

function onMessage(msg: MessageEvent) {
  if (!frame || msg.source !== frame.contentWindow) return;
  const data = msg.data as { source?: string; event?: LedgerEvent };
  if (data?.source !== CHANNEL || !data.event) return;
  const e = data.event;
  listeners.forEach((l) => l(e));
  if (e.type === "user_activity") return markActivity();
  const screenEvent = toScreenEvent(e);
  if (screenEvent) emit(screenEvent);
}

/** Connect to an iframe running Ledgerline. Only one is active at a time. */
export function attachLedgerline(iframe: HTMLIFrameElement): () => void {
  frame = iframe;
  window.addEventListener("message", onMessage);
  return () => {
    window.removeEventListener("message", onMessage);
    if (frame === iframe) frame = null;
  };
}

// ---------- Ledgerline event → ScreenEvent ----------

// Noise for the agent and the Work Map.
const SKIP = new Set(["state", "guard_status", "highlight_shown", "session_started", "save_clicked", "save_requested", "screen_changed", "user_activity"]);

const money = (n: unknown) => `€${Number(n ?? 0).toFixed(2)}`;

type Doc = { id?: string; file?: string; kind?: string };

export function toScreenEvent(e: LedgerEvent): Omit<ScreenEvent, "time"> | null {
  if (SKIP.has(e.type)) return null;
  const exp = e.expense as ExpenseSnapshot | undefined;
  const report = e.report as { number?: string; name?: string; total?: number } | undefined;
  const doc = e.doc as Doc | undefined;
  const base = {
    invoiceId: exp?.id ?? (e.expense_id as string) ?? report?.number ?? "",
    type: e.type,
    source: "dom" as const,
    docId: doc?.id ?? (e.doc_id as string | undefined),
    data: exp,
  };
  const ev = (description: string, extra: Partial<ScreenEvent> = {}) => ({ ...base, description, ...extra });

  switch (e.type) {
    case "report_created": return ev(`Created expense report "${report?.name}"`);
    case "report_opened": return ev(`Opened expense report "${report?.name}" (${money(report?.total)})`);
    case "expense_type_selected": return ev(`Chose expense type ${e.expense_type}`);
    case "expense_form_opened": return ev(e.is_new ? "Opened a new Meals / Drinks expense form" : `Opened the expense at ${exp?.restaurant_name} for editing`);
    case "expense_viewed": return ev(`Viewed the expense at ${exp?.restaurant_name} (${money(exp?.spent)})`);
    case "field_changed":
      return ev(`${e.label ?? e.field} changed from "${e.old ?? ""}" to "${e.new ?? ""}"`, {
        field: String(e.field), from: String(e.old ?? ""), to: String(e.new ?? ""),
      });
    case "dropdown_opened": return ev(`Opened the ${e.label} dropdown`, { field: String(e.field) });
    case "guest_added": {
      const g = e.guest as { name: string; title: string };
      return ev(`Added guest ${g.name} (${g.title}); ${e.guest_count} guests, ${money(e.amount_per_person)} per person`);
    }
    case "guest_removed": return ev(`Removed guest ${(e.guest as { name: string }).name}; ${e.guest_count} guests left`);
    case "allocation_changed": return ev(`Changed ${e.guest}'s share to ${e.pct} %`);
    case "project_selected": return ev(`Selected project ${(e.project as { name: string }).name}`);
    case "attachment_added": return ev(`Attached ${doc?.file} (${doc?.kind ?? "file"})`);
    case "attachment_removed": return ev(`Removed attachment ${doc?.file}`);
    case "gallery_opened": return ev("Opened the receipt gallery");
    case "document_opened": return ev(`Opened ${doc?.file} to read it`);
    case "document_closed": return ev(`Closed the document after ${e.seconds_open}s`);
    case "save_blocked":
      return e.by === "guard"
        ? ev(`Save blocked by a guardrail: ${e.message}`)
        : ev(`Save failed validation: ${Object.values((e.errors ?? {}) as Record<string, string>).join(" ")}`, { type: "validation_failed" });
    case "save_guard_timeout": return ev("Save guard did not answer in time; Ledgerline saved anyway");
    case "expense_saved":
      return ev(
        `Saved the expense at ${exp?.restaurant_name}: ${money(exp?.spent)}, ${exp?.type_of_meal}, ${exp?.guest_count} guests (${money(exp?.amount_per_person)} pp), attachments: ${exp?.attachments.map((a) => a.file).join(", ") || "none"}`,
      );
    case "expense_cancelled": return ev("Cancelled the expense form");
    case "expense_deleted": return ev(`Deleted the expense at ${exp?.restaurant_name}`);
    case "report_submitted": return ev(`Submitted report "${report?.name}" (${money(report?.total)})`);
    case "comment_posted": return ev(`Posted a comment: "${e.text}"`);
    case "user_switched": return ev(`Switched user to ${e.to}`);
    case "data_reset": return ev("Reset the demo data");
    default: return ev(e.type.replace(/_/g, " "));
  }
}
