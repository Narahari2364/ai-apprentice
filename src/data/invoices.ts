import type { Invoice } from "@/lib/types";

// The three invoices the expert (Sabine) processes in Capture.
export const expertInvoices: Invoice[] = [
  {
    // (a) Equipment over €5,000 booked as opex → must be re-coded to capex 0400.
    id: "4471",
    supplier: "Kessler Maschinenbau GmbH",
    amount: 8450,
    currency: "EUR",
    description: "CNC spindle unit SP-300, incl. installation",
    costCenter: "4711",
    assetNumber: "",
    status: "open",
  },
  {
    // (b) Supplier that double-bills every December → hold.
    id: "4472",
    supplier: "Brandt Industriebedarf KG",
    amount: 1280,
    currency: "EUR",
    description: "Cutting fluid and filters, December delivery",
    costCenter: "4711",
    assetNumber: "",
    status: "open",
  },
  {
    // (c) Czech subsidiary → send for 2nd approval.
    id: "4473",
    supplier: "Stuttgart Tools CZ s.r.o. (Brno)",
    amount: 3150,
    currency: "EUR",
    description: "Intercompany machining services, November",
    costCenter: "4711",
    assetNumber: "",
    status: "open",
  },
];

// Never shown to the expert. The new hire processes it in Teach.
// Correct handling: re-code to 0400 and enter an asset number before saving.
export const teachInvoice: Invoice = {
  id: "5120",
  supplier: "Hoffmann Präzisionstechnik GmbH",
  amount: 7200,
  currency: "EUR",
  description: "Laser measuring station LM-7, new equipment",
  costCenter: "4711",
  assetNumber: "",
  status: "open",
};
