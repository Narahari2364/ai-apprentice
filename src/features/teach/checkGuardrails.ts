// Called by the ERP on Save in /teach. Returns ok: false to block the save.
// Rules mirror the expert's guardrails; explanations quote the expert from the Work Map.

import type { GuardrailResult, Invoice, WorkMap, WorkMapStep } from "@/lib/types";

const EQUIPMENT = /equipment|machine|station|spindle|unit|device|tool/i;

function findStep(map: WorkMap, pattern: RegExp): WorkMapStep | undefined {
  return map.steps.find((s) => pattern.test(`${s.title} ${s.decision} ${s.reason} ${s.guardrails.join(" ")}`));
}

function quote(step: WorkMapStep | undefined, fallback: string) {
  return step?.expertQuote ? `Sabine said: “${step.expertQuote}”` : fallback;
}

export function checkGuardrails(invoice: Invoice, workMap: WorkMap): GuardrailResult {
  const violations: GuardrailResult["violations"] = [];

  if (invoice.amount > 5000 && EQUIPMENT.test(invoice.description) && invoice.costCenter === "4711") {
    const step = findStep(workMap, /capex|0400/i);
    violations.push({
      stepId: step?.id ?? "s3",
      rule: "Equipment over €5,000 must be booked as capex (0400), not opex (4711).",
      explanation: quote(step, "Equipment over €5,000 is always capex."),
    });
  }

  if (invoice.costCenter === "0400" && !invoice.assetNumber.trim()) {
    const step = findStep(workMap, /asset number/i);
    violations.push({
      stepId: step?.id ?? "s4",
      rule: "Capex booking without an asset number.",
      explanation: quote(step, "No asset number, no capex booking."),
    });
  }

  if (/brandt/i.test(invoice.supplier) && /december/i.test(invoice.description) && invoice.status === "approved") {
    const step = findStep(workMap, /brandt|double-bill|december/i);
    violations.push({
      stepId: step?.id ?? "s5",
      rule: "December Brandt invoice approved without a duplicate check.",
      explanation: quote(step, "Brandt double-bills every December."),
    });
  }

  if (/\bCZ\b|czech|s\.r\.o/i.test(invoice.supplier) && invoice.status === "approved") {
    const step = findStep(workMap, /czech|second approval|2nd approval|intercompany/i);
    violations.push({
      stepId: step?.id ?? "s6",
      rule: "Czech intercompany invoice approved without a second approval.",
      explanation: quote(step, "Intercompany always needs the controller's second signature."),
    });
  }

  return { ok: violations.length === 0, violations };
}
