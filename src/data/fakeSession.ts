import type { ScreenEvent, TranscriptLine } from "@/lib/types";

// A realistic recorded expert session: Sabine processes invoices 4471–4473.
// Use this to build the Work Map / debrief without running a live capture.

export const fakeEvents: ScreenEvent[] = [
  { time: "01:05", invoiceId: "4471", type: "invoice_opened", description: "Invoice 4471 opened (Kessler Maschinenbau GmbH, €8,450)", source: "dom" },
  { time: "03:12", invoiceId: "4471", type: "field_changed", field: "costCenter", from: "4711", to: "0400", description: "Invoice 4471: cost center changed from 4711 (opex) to 0400 (capex)", source: "dom" },
  { time: "03:40", invoiceId: "4471", type: "field_changed", field: "assetNumber", from: "", to: "AN-2026-118", description: "Invoice 4471: asset number set to AN-2026-118", source: "dom" },
  { time: "04:05", invoiceId: "4471", type: "status_changed", field: "status", from: "open", to: "approved", description: "Invoice 4471 approved", source: "dom" },
  { time: "04:08", invoiceId: "4471", type: "saved", description: "Invoice 4471 saved", source: "dom" },
  { time: "05:02", invoiceId: "4472", type: "invoice_opened", description: "Invoice 4472 opened (Brandt Industriebedarf KG, €1,280)", source: "dom" },
  { time: "05:30", invoiceId: "4472", type: "status_changed", field: "status", from: "open", to: "on_hold", description: "Invoice 4472 put on hold", source: "dom" },
  { time: "05:33", invoiceId: "4472", type: "saved", description: "Invoice 4472 saved", source: "dom" },
  { time: "06:48", invoiceId: "4473", type: "invoice_opened", description: "Invoice 4473 opened (Stuttgart Tools CZ s.r.o., €3,150)", source: "dom" },
  { time: "07:10", invoiceId: "4473", type: "status_changed", field: "status", from: "open", to: "pending_2nd_approval", description: "Invoice 4473 sent for 2nd approval", source: "dom" },
  { time: "07:14", invoiceId: "4473", type: "saved", description: "Invoice 4473 saved", source: "dom" },
];

export const fakeTranscript: TranscriptLine[] = [
  { time: "00:40", speaker: "expert", text: "Okay, three invoices left before close. Let's start with Kessler." },
  { time: "03:15", speaker: "agent", text: "You moved that one to capex. What made you do that?" },
  { time: "03:18", speaker: "expert", text: "Equipment over five thousand euros is always capex. Opex is for consumables and services." },
  { time: "03:44", speaker: "agent", text: "Is there anything that would stop you booking it as capex?" },
  { time: "03:47", speaker: "expert", text: "No asset number, no capex booking. And if I don't know the supplier, I stop and ask the controller." },
  { time: "05:36", speaker: "agent", text: "You put the Brandt invoice on hold. Why that one?" },
  { time: "05:40", speaker: "expert", text: "Brandt double-bills every December. I hold it until I've checked there's no second invoice for the same delivery." },
  { time: "07:18", speaker: "agent", text: "That one went for a second approval. When would you approve it yourself?" },
  { time: "07:22", speaker: "expert", text: "Never, if it comes from the Czech subsidiary. Intercompany always needs the controller's second signature." },
  { time: "08:05", speaker: "expert", text: "That's it, all three done." },
];
