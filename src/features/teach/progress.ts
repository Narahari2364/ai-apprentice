"use client";
// Teach progress: which task steps the new hire has done and how each guardrail went.

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/events";
import type { GuardrailResult, RuleKey, ScreenEvent } from "@/lib/types";

export type RuleStatus = "untested" | "respected" | "broken" | "fixed";

export const RULE_LABEL: Record<RuleKey, string> = {
  delivery_docs: "Delivery order: receipt and invoice attached",
  approval: "Over 30 per person: supervisor approval attached",
};

const attached = (e: ScreenEvent, kind: string) => e.type === "attachment_added" && e.description.includes(`(${kind})`);

const STEPS: { label: string; done: (e: ScreenEvent, seen: Set<string>) => boolean }[] = [
  { label: "Open a Meals / Drinks expense", done: (e) => e.type === "expense_form_opened" },
  { label: "Attach the receipt", done: (e) => attached(e, "order_confirmation") || attached(e, "invoice") },
  {
    label: "Delivery order: attach the invoice too",
    done: (e, seen) => {
      if (attached(e, "order_confirmation")) seen.add("receipt");
      if (attached(e, "invoice")) seen.add("invoice");
      return seen.has("receipt") && seen.has("invoice");
    },
  },
  { label: "Over 30 per person: attach the approval", done: (e) => attached(e, "approval_email") },
  { label: "Save without a guardrail block", done: (e) => e.type === "expense_saved" },
];

export interface TeachProgress {
  steps: { label: string; done: boolean }[];
  rules: Record<RuleKey, RuleStatus>;
}

const initialRules = (): Record<RuleKey, RuleStatus> => ({ delivery_docs: "untested", approval: "untested" });

export function useTeachProgress() {
  const [steps, setSteps] = useState(() => STEPS.map((s) => ({ label: s.label, done: false })));
  const [rules, setRules] = useState(initialRules);

  useEffect(() => {
    const seen = new Set<string>();
    return subscribe((e) =>
      setSteps((prev) => prev.map((s, i) => (s.done || !STEPS[i].done(e, seen) ? s : { ...s, done: true }))),
    );
  }, []);

  /** Record the outcome of one guarded save. */
  function recordCheck(result: GuardrailResult) {
    const broken = new Set(result.violations.map((v) => v.key));
    setRules((prev) => {
      const next = { ...prev };
      for (const key of result.applicable) {
        if (broken.has(key)) next[key] = "broken";
        else if (prev[key] === "broken") next[key] = "fixed";
        else if (prev[key] === "untested") next[key] = "respected";
      }
      return next;
    });
  }

  function reset() {
    setSteps(STEPS.map((s) => ({ label: s.label, done: false })));
    setRules(initialRules());
  }

  const progress: TeachProgress = { steps, rules };
  return { progress, recordCheck, reset };
}

/** End-of-session report, as in the Teaching-mode design: how each part went and what to practise next. */
export type RowStatus = "alone" | "hint" | "open" | "done";

export function sessionReport(p: TeachProgress) {
  const step = (label: string) => p.steps.find((s) => s.label === label)?.done ?? false;
  const ruleRow = (key: RuleKey, label: string) => {
    const r = p.rules[key];
    if (r === "untested") return null;
    return {
      label,
      status: (r === "respected" ? "alone" : r === "fixed" ? "hint" : "open") as RowStatus,
      note: r === "respected" ? "on her own" : r === "fixed" ? "needed a hint" : "not fixed yet",
      detail: r === "fixed" ? "Caught before save, fixed after a hint" : undefined,
    };
  };
  const rows = [
    step("Attach the receipt") ? { label: "Uploaded the receipt", status: "alone" as RowStatus, note: "on her own" } : null,
    ruleRow("delivery_docs", "Delivery app → tax invoice"),
    ruleRow("approval", "Over 30 → supervisor approval"),
    { label: "Saved correctly", status: (step("Save without a guardrail block") ? "done" : "open") as RowStatus, note: step("Save without a guardrail block") ? "done" : "not yet" },
  ].filter(Boolean) as { label: string; status: RowStatus; note: string; detail?: string }[];

  const PRACTICE: Record<RuleKey, string> = {
    approval: "Catch the <b>30 per person</b> line yourself, without a prompt.",
    delivery_docs: "Remember the <b>tax invoice for delivery orders</b> without a prompt.",
  };
  const practise = (Object.keys(p.rules) as RuleKey[]).filter((k) => p.rules[k] === "fixed" || p.rules[k] === "broken").map((k) => PRACTICE[k]);
  return { rows, practise };
}
