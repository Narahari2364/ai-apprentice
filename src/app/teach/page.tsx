"use client";

import { useState } from "react";
import MockErp from "@/features/erp/MockErp";
import TutorPanel from "@/features/teach/TutorPanel";
import { checkGuardrails } from "@/features/teach/checkGuardrails";
import { teachInvoice } from "@/data/invoices";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import { loadWorkMap } from "@/lib/session";
import type { GuardrailResult } from "@/lib/types";

export default function TeachPage() {
  const [violations, setViolations] = useState<GuardrailResult["violations"]>([]);

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-6 lg:grid-cols-[2fr_1fr]">
      <MockErp
        invoices={[teachInvoice]}
        beforeSave={(inv) => {
          const result = checkGuardrails(inv, loadWorkMap() ?? sampleWorkMap);
          setViolations(result.violations);
          return result;
        }}
      />
      <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        <TutorPanel violations={violations} />
      </aside>
    </div>
  );
}
