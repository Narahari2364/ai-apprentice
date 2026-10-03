// Teach-mode Save guard for Ledgerline meal expenses. Returns ok: false to block.
// Rules mirror Sabine's guardrails; explanations quote her from the Work Map.
// `fields` are Ledgerline data-field names the mock highlights (type_of_meal, guests, attachments).

import type { DocFacts, ExpenseSnapshot, GuardrailResult, WorkMap, WorkMapStep } from "@/lib/types";

const SMALL_MEALS_LIMIT = 30; // € per person without PL approval
const COMPANY_ADDRESS_LIMIT = 250; // € — above this the invoice must name the company

function findStep(map: WorkMap, pattern: RegExp): WorkMapStep | undefined {
  return (
    map.steps.find((s) => pattern.test(s.title)) ??
    map.steps.find((s) => pattern.test(`${s.decision} ${s.reason} ${s.guardrails.join(" ")}`))
  );
}

function quote(step: WorkMapStep | undefined, fallback: string) {
  return `Sabine said: “${step?.expertQuote || fallback}”`;
}

export function checkGuardrails(exp: ExpenseSnapshot, workMap: WorkMap): GuardrailResult {
  const violations: GuardrailResult["violations"] = [];
  const docs = exp.attachments.map((a) => a.facts).filter(Boolean) as DocFacts[];
  const receipts = docs.filter((d) => d.kind === "invoice" || d.kind === "order_confirmation");
  const hasApproval = docs.some((d) => d.kind === "approval_email");

  // 1. Type of meal comes from the receipt, not habit.
  const receipt = receipts[0];
  if (receipt && exp.type_of_meal) {
    const expected =
      receipt.kind === "order_confirmation" || receipt.platform || receipt.consumption === "außer Haus"
        ? "Take Away"
        : receipt.consumption === "im Haus"
          ? "Eat In"
          : null;
    if (expected && exp.type_of_meal !== expected) {
      const step = findStep(workMap, /type of meal|eat in|take away/i);
      violations.push({
        stepId: step?.id ?? "s4",
        rule: `Type of Meal should be ${expected}: the receipt says ${receipt.consumption ? `"Verzehr: ${receipt.consumption}"` : "it was delivered"}.`,
        explanation: quote(step, "Look at the receipt. Im Haus means Eat In, and that changes the VAT."),
        fields: ["type_of_meal"],
      });
    }
  }

  // 2. An order confirmation is not a tax invoice.
  if (receipts.length && !receipts.some((d) => d.is_tax_invoice)) {
    const step = findStep(workMap, /order confirmation|tax invoice|delivery/i);
    violations.push({
      stepId: step?.id ?? "s6",
      rule: "Only an order confirmation is attached. It is not a tax invoice.",
      explanation: quote(step, "The Bitebox confirmation is not an invoice. Download the real invoice first."),
      fields: ["attachments"],
    });
  }

  // 3. Small-meals limit: over €30 per person needs the PL's approval email attached.
  if ((exp.amount_per_person ?? 0) > SMALL_MEALS_LIMIT && !hasApproval) {
    const step = findStep(workMap, /per person|€30|approval/i);
    violations.push({
      stepId: step?.id ?? "s5",
      rule: `€${exp.amount_per_person?.toFixed(2)} per person is over the €${SMALL_MEALS_LIMIT} small-meals limit and no PL approval is attached.`,
      explanation: quote(step, "Over thirty euros a head, I attach Jonas's approval. No approval, I stop and ask him."),
      fields: ["guests", "attachments"],
    });
  }

  // 4. Over €250 the invoice must be addressed to the company.
  const big = receipts.find((d) => d.kind === "invoice" && (d.total_paid ?? 0) > COMPANY_ADDRESS_LIMIT && !d.addressed_to);
  if (big) {
    const step = findStep(workMap, /€250|addressed|corrected invoice/i);
    violations.push({
      stepId: step?.id ?? "s7",
      rule: `The invoice is over €${COMPANY_ADDRESS_LIMIT} but not addressed to Nordhaven Consulting GmbH.`,
      explanation: quote(step, "Above 250 euros the invoice needs our company address, so I ask the restaurant for a corrected one."),
      fields: ["attachments"],
    });
  }

  return { ok: violations.length === 0, violations };
}
