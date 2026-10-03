// Shared data formats. Source of truth: docs/formats.md — change both together.

export type CostCenter = "4711" | "0400"; // 4711 = opex, 0400 = capex

export type InvoiceStatus =
  | "open"
  | "approved"
  | "on_hold"
  | "pending_2nd_approval";

export interface Invoice {
  id: string;
  supplier: string;
  amount: number;
  currency: string; // ISO code, e.g. "EUR"
  description: string;
  costCenter: CostCenter;
  assetNumber: string; // "" when none
  status: InvoiceStatus;
}

export type ScreenEventType =
  | "invoice_opened"
  | "field_changed"
  | "status_changed"
  | "saved"
  | "save_blocked";

export interface ScreenEvent {
  time: string; // "mm:ss" since session start
  invoiceId: string;
  type: ScreenEventType;
  field?: string;
  from?: string;
  to?: string;
  description: string; // human-readable, fed to the agent
  source: "dom" | "vision";
}

export interface TranscriptLine {
  time: string; // "mm:ss"
  speaker: "expert" | "agent";
  text: string;
}

export interface WorkMapStep {
  id: string;
  order: number;
  title: string;
  time: string; // screen moment, "mm:ss"
  screenshot?: string; // data URL or /public path
  decision: string; // "" for routine steps
  reason: string;
  expertQuote: string;
  guardrails: string[];
}

export interface WorkMap {
  task: string;
  steps: WorkMapStep[];
  gaps: string[]; // open questions for the debrief
  confirmed: boolean; // expert confirmed the teach-back
}

export interface GuardrailResult {
  ok: boolean;
  violations: { stepId: string; rule: string; explanation: string }[];
}
