"use client";
// Owner: CS 2. Mock ERP: invoice list + detail form. Every user action emits a
// ScreenEvent on the shared bus (src/lib/events.ts).
// TODO(CS 2): persist edits to localStorage; add data-* hooks for vision if useful.

import { useState } from "react";
import { emit } from "@/lib/events";
import type { CostCenter, GuardrailResult, Invoice, InvoiceStatus } from "@/lib/types";

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  open: "Open",
  approved: "Approved",
  on_hold: "On hold",
  pending_2nd_approval: "2nd approval",
};

const COST_CENTERS: { value: CostCenter; label: string }[] = [
  { value: "4711", label: "4711 — Opex (operating expense)" },
  { value: "0400", label: "0400 — Capex (fixed asset)" },
];

const fmt = (i: Invoice) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: i.currency }).format(i.amount);

interface Props {
  invoices: Invoice[];
  /** Called before saving. Return { ok: false } to block the save. */
  beforeSave?: (invoice: Invoice) => GuardrailResult;
}

export default function MockErp({ invoices: initial, beforeSave }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Invoice | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Snapshot of a text field when focused, so we emit one event per edit on blur.
  const [focusValue, setFocusValue] = useState<string>("");

  function open(inv: Invoice) {
    setSelectedId(inv.id);
    setDraft({ ...inv });
    setMessage(null);
    emit({
      invoiceId: inv.id,
      type: "invoice_opened",
      description: `Invoice ${inv.id} opened (${inv.supplier}, ${fmt(inv)})`,
      source: "dom",
    });
  }

  function fieldChanged(field: keyof Invoice, from: string, to: string) {
    if (!draft || from === to) return;
    emit({
      invoiceId: draft.id,
      type: "field_changed",
      field,
      from,
      to,
      description: `Invoice ${draft.id}: ${field} changed from "${from}" to "${to}"`,
      source: "dom",
    });
  }

  function setStatus(status: InvoiceStatus) {
    if (!draft) return;
    const from = draft.status;
    setDraft({ ...draft, status });
    emit({
      invoiceId: draft.id,
      type: "status_changed",
      field: "status",
      from,
      to: status,
      description: `Invoice ${draft.id}: status set to ${STATUS_LABEL[status]}`,
      source: "dom",
    });
  }

  function save() {
    if (!draft) return;
    const check = beforeSave?.(draft);
    if (check && !check.ok) {
      const text = check.violations.map((v) => v.explanation).join(" ");
      setMessage({ kind: "error", text: text || "Save blocked by a guardrail." });
      emit({
        invoiceId: draft.id,
        type: "save_blocked",
        description: `Save of invoice ${draft.id} blocked: ${check.violations.map((v) => `${v.rule} (${v.explanation})`).join("; ")}`,
        source: "dom",
      });
      return;
    }
    setInvoices((list) => list.map((i) => (i.id === draft.id ? draft : i)));
    setMessage({ kind: "ok", text: `Invoice ${draft.id} saved.` });
    emit({
      invoiceId: draft.id,
      type: "saved",
      description: `Invoice ${draft.id} saved (cost center ${draft.costCenter}, status ${STATUS_LABEL[draft.status]})`,
      source: "dom",
    });
  }

  const textInput = (field: "supplier" | "description" | "assetNumber", label: string) =>
    draft && (
      <label className="block">
        <span className="erp-label">{label}</span>
        <input
          className="erp-input"
          value={draft[field]}
          onFocus={() => setFocusValue(draft[field])}
          onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
          onBlur={() => fieldChanged(field, focusValue, draft[field])}
        />
      </label>
    );

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-slate-300 bg-white p-4 text-slate-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-xl font-bold">AP Workbench — Open invoices</h2>
        <span className="text-sm text-slate-500">Mock ERP</span>
      </div>

      <table className="w-full text-left text-lg">
        <thead className="text-sm uppercase text-slate-500">
          <tr>
            <th className="py-1">Invoice</th>
            <th>Supplier</th>
            <th className="text-right">Amount</th>
            <th className="pl-4">Cost ctr</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr
              key={inv.id}
              onClick={() => open(inv)}
              className={`cursor-pointer border-t border-slate-100 hover:bg-sky-50 ${
                inv.id === selectedId ? "bg-sky-100" : ""
              }`}
            >
              <td className="py-2 font-mono">{inv.id}</td>
              <td>{inv.supplier}</td>
              <td className="text-right font-mono">{fmt(inv)}</td>
              <td className="pl-4 font-mono">{inv.costCenter}</td>
              <td>{STATUS_LABEL[inv.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {draft ? (
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
          <h3 className="text-lg font-semibold">
            Invoice <span className="font-mono">{draft.id}</span> ·{" "}
            <span className="text-slate-500">{STATUS_LABEL[draft.status]}</span>
          </h3>
          {textInput("supplier", "Supplier")}
          <label className="block">
            <span className="erp-label">Amount</span>
            <input
              className="erp-input font-mono"
              type="number"
              value={draft.amount}
              onFocus={() => setFocusValue(String(draft.amount))}
              onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
              onBlur={() => fieldChanged("amount", focusValue, String(draft.amount))}
            />
          </label>
          {textInput("description", "Description")}
          <label className="block">
            <span className="erp-label">Cost center</span>
            <select
              className="erp-input font-mono"
              value={draft.costCenter}
              onChange={(e) => {
                const to = e.target.value as CostCenter;
                fieldChanged("costCenter", draft.costCenter, to);
                setDraft({ ...draft, costCenter: to });
              }}
            >
              {COST_CENTERS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          {textInput("assetNumber", "Asset number")}

          <div className="flex flex-wrap gap-2 pt-2">
            <button className="erp-btn bg-emerald-600 text-white" onClick={() => setStatus("approved")}>
              Approve
            </button>
            <button className="erp-btn bg-amber-500 text-white" onClick={() => setStatus("on_hold")}>
              Hold
            </button>
            <button className="erp-btn bg-violet-600 text-white" onClick={() => setStatus("pending_2nd_approval")}>
              Send for 2nd approval
            </button>
            <button className="erp-btn ml-auto bg-slate-900 text-white" onClick={save}>
              Save
            </button>
          </div>
          {message && (
            <p
              className={`rounded-lg p-3 text-base ${
                message.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      ) : (
        <p className="border-t border-slate-200 pt-4 text-slate-500">Select an invoice to open it.</p>
      )}
    </div>
  );
}
