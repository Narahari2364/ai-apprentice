"use client";
// Teach progress: which task steps the new hire has done and how each guardrail went.

import { useEffect, useState } from "react";
import { subscribe } from "@/lib/events";
import type { GuardrailResult, RuleKey, ScreenEvent } from "@/lib/types";

export type RuleStatus = "untested" | "respected" | "broken" | "fixed";

export const RULE_LABEL: Record<RuleKey, string> = {
  type_of_meal: "Type of Meal taken from the receipt",
  small_meals: "€30 per person, or PL approval attached",
  tax_invoice: "Tax invoice attached, not an order confirmation",
  company_address: "Over €250: invoice addressed to the company",
};

const STEPS: { label: string; done: (e: ScreenEvent, seen: Set<string>) => boolean }[] = [
  { label: "Create a report and a Meals / Drinks expense", done: (e) => e.type === "report_created" || e.type === "expense_form_opened" },
  { label: "Open the receipt and read it", done: (e) => e.type === "document_opened" },
  {
    label: "Split meal, drinks and tip",
    done: (e, seen) => {
      if (e.type === "field_changed" && ["meal_amount", "drink_amount", "tip_amount"].includes(e.field ?? "")) seen.add(e.field!);
      return seen.size >= 2;
    },
  },
  { label: "Set Type of Meal", done: (e) => e.type === "field_changed" && e.field === "type_of_meal" },
  { label: "Add every participant as a guest", done: (e) => e.type === "guest_added" },
  { label: "Attach the supporting documents", done: (e) => e.type === "attachment_added" },
  { label: "Save without a guardrail block", done: (e) => e.type === "expense_saved" },
];

export interface TeachProgress {
  steps: { label: string; done: boolean }[];
  rules: Record<RuleKey, RuleStatus>;
}

const initialRules = (): Record<RuleKey, RuleStatus> => ({
  type_of_meal: "untested",
  small_meals: "untested",
  tax_invoice: "untested",
  company_address: "untested",
});

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
    ...keys.filter((k) => p.rules[k] === "broken" || p.rules[k] === "fixed").map((k) => `${RULE_LABEL[k]}${p.rules[k] === "fixed" ? " (fixed after the tutor stepped in)" : ""}`),
    ...p.steps.filter((s) => !s.done).map((s) => s.label),
  ];
  const untested = keys.filter((k) => p.rules[k] === "untested").map((k) => RULE_LABEL[k]);
  return { mastered, practise, untested };
}
