import type { ScreenEvent, TranscriptLine } from "@/lib/types";

// A realistic recorded expert session in Ledgerline: Sabine files four team meals.
// Use this to build the Work Map / debrief without running a live capture.

const e = (time: string, type: string, description: string, extra: Partial<ScreenEvent> = {}): ScreenEvent => ({
  time, invoiceId: "", type, description, source: "dom", ...extra,
});

export const fakeEvents: ScreenEvent[] = [
  e("00:40", "report_created", 'Created expense report "Food – October"'),
  e("01:05", "expense_form_opened", "Opened a new Meals / Drinks expense form"),
  e("01:20", "document_opened", "Opened document Receipt – Trattoria da Lupo.jpg to read it"),
  e("02:05", "field_changed", 'Spent changed from "0.00" to "78.00"', { field: "spent", from: "0.00", to: "78.00" }),
  e("02:40", "field_changed", 'Type of Meal changed from "Take Away" to "Eat In"', { field: "type_of_meal", from: "Take Away", to: "Eat In" }),
  e("03:30", "guest_added", "Added guest Tobias Lindqvist (CONS); 3 guests, €26.00 per person"),
  e("04:02", "expense_saved", "Saved expense at Trattoria da Lupo: €78.00, Eat In, 3 guests (€26.00 pp), attachments: Receipt – Trattoria da Lupo.jpg"),
  e("05:10", "attachment_added", "Attached Bitebox invoice BBX-DE-2026-48213.pdf (invoice)"),
  e("05:40", "expense_saved", "Saved expense at Saigon Kitchen: €97.78, Take Away, 4 guests (€24.45 pp), attachments: Bitebox invoice BBX-DE-2026-48213.pdf"),
  e("07:20", "attachment_added", "Attached Restaurant Kranich – Rechnung 2026-0912-K (korrigiert).pdf (invoice)"),
  e("07:45", "attachment_added", "Attached Approval – dinner 23.09. (J. Weber).msg (approval_email)"),
  e("08:10", "expense_saved", "Saved expense at Restaurant Kranich: €268.00, Eat In, 9 guests (€29.78 pp), attachments: corrected invoice, approval"),
];

export const fakeTranscript: TranscriptLine[] = [
  { time: "00:30", speaker: "expert", text: "Okay, October food expenses. One report per month, called Food and the month." },
  { time: "01:25", speaker: "expert", text: "I always open the receipt first. Everything I type comes from there." },
  { time: "02:46", speaker: "agent", text: "You switched it to Eat In. What made you change that?" },
  { time: "02:50", speaker: "expert", text: "Look at the receipt. Im Haus means Eat In, and that changes the VAT. Delivery is always Take Away." },
  { time: "03:38", speaker: "agent", text: "Is there a limit on how much a meal can cost per person?" },
  { time: "03:42", speaker: "expert", text: "Over thirty euros a head, I attach Jonas's approval. No approval, I stop and ask him before I file it." },
  { time: "05:16", speaker: "agent", text: "You picked the invoice, not the confirmation. Why?" },
  { time: "05:20", speaker: "expert", text: "The Bitebox confirmation is not an invoice. It even says so at the bottom. Download the real invoice first." },
  { time: "07:26", speaker: "agent", text: "Why the corrected invoice for Kranich?" },
  { time: "07:30", speaker: "expert", text: "Above 250 euros the invoice needs our company address, so I ask the restaurant for a corrected one." },
  { time: "08:20", speaker: "expert", text: "That's it, report's ready." },
];
