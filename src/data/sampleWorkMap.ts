import type { WorkMap } from "@/lib/types";

// A complete Work Map: 7 steps, 3 judgment calls (steps 3, 5, 6), 4 guardrails.
// Matches fakeSession.ts. Teach uses this until the real Map module exists.
export const sampleWorkMap: WorkMap = {
  task: "Process open supplier invoices before month-end close",
  confirmed: true,
  gaps: [
    "Who decides when to release a held December invoice?",
    "Does the €5,000 capex line apply to the net or the gross amount?",
    "Do other subsidiaries besides Czech need a second approval?",
  ],
  steps: [
    {
      id: "s1",
      order: 1,
      title: "Open the invoice and check supplier and amount",
      time: "01:05",
      decision: "",
      reason: "Know who is billing and how much before touching any field.",
      expertQuote: "Let's start with Kessler.",
      guardrails: [],
    },
    {
      id: "s2",
      order: 2,
      title: "Read the description: equipment or consumable?",
      time: "01:40",
      decision: "",
      reason: "The description decides whether it is an asset or an expense.",
      expertQuote: "Opex is for consumables and services.",
      guardrails: [],
    },
    {
      id: "s3",
      order: 3,
      title: "Code the invoice to a cost center",
      time: "03:12",
      decision: "Re-coded from opex (4711) to capex (0400)",
      reason: "Equipment over €5,000 is always capex.",
      expertQuote: "Equipment over five thousand euros is always capex.",
      guardrails: [
        "No asset number, no capex booking.",
        "Unknown supplier: stop and ask the controller.",
      ],
    },
    {
      id: "s4",
      order: 4,
      title: "Enter the asset number and approve",
      time: "03:40",
      decision: "",
      reason: "A capex booking needs an asset number before it can be saved.",
      expertQuote: "No asset number, no capex booking.",
      guardrails: [],
    },
    {
      id: "s5",
      order: 5,
      title: "Hold December invoices from Brandt",
      time: "05:30",
      decision: "Put invoice 4472 on hold instead of approving",
      reason: "Brandt double-bills every December.",
      expertQuote: "Brandt double-bills every December. I hold it until I've checked there's no second invoice.",
      guardrails: [
        "Never approve a December Brandt invoice before checking for a duplicate.",
      ],
    },
    {
      id: "s6",
      order: 6,
      title: "Send Czech subsidiary invoices for 2nd approval",
      time: "07:10",
      decision: "Sent invoice 4473 for second approval",
      reason: "Intercompany invoices from the Czech subsidiary need the controller's signature.",
      expertQuote: "Never, if it comes from the Czech subsidiary. Intercompany always needs the controller's second signature.",
      guardrails: [
        "Never approve Czech intercompany invoices yourself.",
      ],
    },
    {
      id: "s7",
      order: 7,
      title: "Save and move to the next invoice",
      time: "07:14",
      decision: "",
      reason: "Every invoice is saved with a status before close.",
      expertQuote: "That's it, all three done.",
      guardrails: [],
    },
  ],
};
