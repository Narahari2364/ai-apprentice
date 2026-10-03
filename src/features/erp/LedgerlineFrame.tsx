"use client";
// Embeds the Ledgerline expense tool (public/ledgerline.html, unchanged) and bridges it:
//  - its events  → our ScreenEvent bus (src/lib/events.ts)
//  - typing/pointer activity → markActivity() for pause detection
//  - optional Save guard → the mock waits for our allow/block decision
// The mock is 1180px wide minimum, so the frame is scaled down to fit.

import { useEffect, useRef, useState } from "react";
import { emit, markActivity } from "@/lib/events";
import type { ExpenseSnapshot } from "@/lib/types";

const MOCK_WIDTH = 1180;

export interface GuardDecision {
  allow: boolean;
  title?: string;
  message?: string;
  fields?: string[];
}

interface LedgerEvent {
  type: string;
  [k: string]: unknown;
}

interface ExpenseDemoApi {
  on(fn: (e: LedgerEvent) => void): () => void;
  setSaveGuard(fn: ((snap: ExpenseSnapshot) => GuardDecision | Promise<GuardDecision>) | null): void;
  newSession(): void;
}

// Events that are noise for the agent and the Work Map.
const SKIP = new Set(["state", "guard_status", "highlight_shown", "session_started", "save_clicked", "save_requested", "screen_changed"]);

const money = (n: unknown) => `€${Number(n ?? 0).toFixed(2)}`;

function describe(e: LedgerEvent): { description: string; id: string; field?: string; from?: string; to?: string; type: string } | null {
  const exp = e.expense as ExpenseSnapshot | undefined;
  const report = e.report as { number?: string; name?: string; total?: number } | undefined;
  const doc = e.doc as { file?: string; facts?: { kind?: string } } | undefined;
  const id = exp?.id ?? report?.number ?? "";
  switch (e.type) {
    case "report_created": return { type: e.type, id, description: `Created expense report "${report?.name}"` };
    case "report_opened": return { type: e.type, id, description: `Opened expense report "${report?.name}" (${money(report?.total)})` };
    case "expense_type_selected": return { type: e.type, id, description: `Chose expense type ${e.expense_type}` };
    case "expense_form_opened": return { type: e.type, id, description: e.is_new ? "Opened a new Meals / Drinks expense form" : `Opened expense at ${exp?.restaurant_name} for editing` };
    case "expense_viewed": return { type: e.type, id, description: `Viewed expense at ${exp?.restaurant_name} (${money(exp?.spent)})` };
    case "field_changed":
      return {
        type: e.type, id, field: String(e.field), from: String(e.old ?? ""), to: String(e.new ?? ""),
        description: `${e.label ?? e.field} changed from "${e.old ?? ""}" to "${e.new ?? ""}"`,
      };
    case "dropdown_opened": return { type: e.type, id, field: String(e.field), description: `Opened the ${e.label} dropdown` };
    case "guest_added": {
      const g = e.guest as { name: string; title: string };
      return { type: e.type, id, description: `Added guest ${g.name} (${g.title}); ${e.guest_count} guests, ${money(e.amount_per_person)} per person` };
    }
    case "guest_removed": return { type: e.type, id, description: `Removed guest ${(e.guest as { name: string }).name}; ${e.guest_count} guests left` };
    case "project_selected": return { type: e.type, id, description: `Selected project ${(e.project as { name: string }).name}` };
    case "attachment_added": return { type: e.type, id, description: `Attached ${doc?.file} (${doc?.facts?.kind ?? "file"})` };
    case "attachment_removed": return { type: e.type, id, description: `Removed attachment ${doc?.file}` };
    case "gallery_opened": return { type: e.type, id, description: "Opened the receipt gallery" };
    case "document_opened": return { type: e.type, id, description: `Opened document ${doc?.file} to read it` };
    case "document_closed": return { type: e.type, id, description: `Closed the document after ${e.seconds_open}s` };
    case "save_blocked":
      return e.by === "guard"
        ? { type: "save_blocked", id, description: `Save blocked by guardrail: ${e.message}` }
        : { type: "validation_failed", id, description: `Save failed validation: ${Object.values(e.errors as Record<string, string>).join(" ")}` };
    case "expense_saved":
      return {
        type: e.type, id,
        description: `Saved expense at ${exp?.restaurant_name}: ${money(exp?.spent)}, ${exp?.type_of_meal}, ${exp?.guest_count} guests (${money(exp?.amount_per_person)} pp), attachments: ${exp?.attachments.map((a) => a.file).join(", ") || "none"}`,
      };
    case "expense_cancelled": return { type: e.type, id, description: "Cancelled the expense form" };
    case "expense_deleted": return { type: e.type, id, description: `Deleted expense at ${exp?.restaurant_name}` };
    case "report_submitted": return { type: e.type, id, description: `Submitted report "${report?.name}" (${money(report?.total)})` };
    case "comment_posted": return { type: e.type, id, description: `Posted comment: "${e.text}"` };
    case "user_switched": return { type: e.type, id, description: `Switched user to ${e.to}` };
    default: return { type: e.type, id, description: e.type.replace(/_/g, " ") };
  }
}

interface Props {
  user: "sabine" | "lena";
  /** When set, every Save waits for this decision (Teach mode). */
  guard?: (snap: ExpenseSnapshot) => GuardDecision;
}

export default function LedgerlineFrame({ user, guard }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const guardRef = useRef(guard);
  const [size, setSize] = useState({ scale: 1, height: 800 });

  useEffect(() => {
    guardRef.current = guard;
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const scale = Math.min(1, entry.contentRect.width / MOCK_WIDTH);
      setSize({ scale, height: entry.contentRect.height / scale });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    let off: (() => void) | undefined;

    function connect() {
      const api = (iframe!.contentWindow as unknown as { ExpenseDemo?: ExpenseDemoApi }).ExpenseDemo;
      if (!api) return;
      off?.();
      off = api.on((e) => {
        if (e.type === "user_activity") return markActivity();
        if (SKIP.has(e.type)) return;
        const d = describe(e);
        if (!d) return;
        emit({ invoiceId: d.id, type: d.type, field: d.field, from: d.from, to: d.to, description: d.description, source: "dom", data: e.expense ?? undefined });
      });
      api.setSaveGuard(guardRef.current ? (snap) => guardRef.current!(snap) : null);
      api.newSession();
    }

    iframe.addEventListener("load", connect);
    connect();
    return () => {
      iframe.removeEventListener("load", connect);
      off?.();
    };
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <iframe
        ref={frame}
        src={`/ledgerline.html?user=${user}`}
        title="Ledgerline expenses"
        style={{ width: MOCK_WIDTH, height: size.height, transform: `scale(${size.scale})`, transformOrigin: "0 0", border: 0 }}
      />
    </div>
  );
}
