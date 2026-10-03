// Personal-data redaction applied before text reaches an LLM, the agent or the Work Map.
// Lightweight regex version of what Microsoft Presidio does (the brief's suggestion).

const RULES: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]"],
  [/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,4})?\b/g, "[iban]"],
  [/(?:•{2,}|\*{2,}|x{4})\s?\d{4}\b/gi, "[card]"],
  [/\b(?:\d[ -]?){13,19}\b/g, "[card]"],
  [/\bSt\.?-?Nr\.?\s*[\d/ ]{8,}/gi, "St.-Nr. [tax id]"],
  [/\b\d{2,3}\/\d{3}\/\d{4,5}\b/g, "[tax id]"],
  [/(?:\+49[\s-]?|\b0)\d{2,4}[\s/-]\d{3,4}[\s-]?\d{3,5}\b/g, "[phone]"], // needs a separator, so ids like 010054913286 stay
];

export function redact(text: string): string {
  return RULES.reduce((t, [re, label]) => t.replace(re, label), text);
}

/** Redact every string inside a JSON-like value. */
export function redactDeep<T>(value: T): T {
  if (typeof value === "string") return redact(value) as T;
  if (Array.isArray(value)) return value.map(redactDeep) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === "screenshot" ? v : redactDeep(v)])) as T;
  }
  return value;
}
