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

/** End-of-session mastery report. */
export function masteryReport(p: TeachProgress) {
  const keys = Object.keys(p.rules) as RuleKey[];
  const mastered = [
    ...keys.filter((k) => p.rules[k] === "respected").map((k) => RULE_LABEL[k]),
    ...p.steps.filter((s) => s.done).map((s) => s.label),
  ];
  const practise = [
    ...keys
      .filter((k) => p.rules[k] === "broken" || p.rules[k] === "fixed")
      .map((k) => `${RULE_LABEL[k]}${p.rules[k] === "fixed" ? ": caught by the tutor, practise spotting it yourself" : ""}`),
    ...p.steps.filter((s) => !s.done).map((s) => s.label),
  ];
  const untested = keys.filter((k) => p.rules[k] === "untested").map((k) => RULE_LABEL[k]);
  return { mastered, practise, untested };
}
