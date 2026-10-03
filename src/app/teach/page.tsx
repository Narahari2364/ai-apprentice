"use client";

import MockErp from "@/features/erp/MockErp";
import TutorPanel from "@/features/teach/TutorPanel";
import { checkGuardrails } from "@/features/teach/checkGuardrails";
import { teachInvoice } from "@/data/invoices";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import { loadWorkMap } from "@/lib/session";

export default function TeachPage() {
  return (
    <div className="grid h-[calc(100vh-7rem)] gap-6 lg:grid-cols-[2fr_1fr]">
      <MockErp
        invoices={[teachInvoice]}
        beforeSave={(inv) => checkGuardrails(inv, loadWorkMap() ?? sampleWorkMap)}
      />
      <aside className="flex flex-col gap-4">
        <TutorPanel />
      </aside>
    </div>
  );
}
