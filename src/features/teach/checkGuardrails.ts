// Owner: CS 2. Called by the ERP on Save in /teach. Return ok: false to block.
// TODO(CS 2): check the invoice against the Work Map's guardrails, e.g.
//   amount > 5000 && equipment && costCenter === "4711" → violation on step s3,
//   costCenter === "0400" && !assetNumber → violation on step s4.
//   Use the expert's quote in `explanation` so the tutor can say it.
// TODO(CS 2): hand violations to the Tutor agent so it speaks before the save.

import type { GuardrailResult, Invoice, WorkMap } from "@/lib/types";

export function checkGuardrails(invoice: Invoice, workMap: WorkMap): GuardrailResult {
  console.log("[checkGuardrails stub]", invoice.id, "against", workMap.steps.length, "steps");
  return { ok: true, violations: [] };
}
