"use client";

import { useState } from "react";
import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import TutorPanel from "@/features/teach/TutorPanel";
import { checkGuardrails } from "@/features/teach/checkGuardrails";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import { loadWorkMap } from "@/lib/session";
import type { GuardrailResult } from "@/lib/types";

export default function TeachPage() {
  const [violations, setViolations] = useState<GuardrailResult["violations"]>([]);

  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <LedgerlineFrame
        user="lena"
        guard={(expense) => {
          const result = checkGuardrails(expense, loadWorkMap() ?? sampleWorkMap);
          setViolations(result.violations);
          if (result.ok) return { allow: true };
          return {
            allow: false,
            title: "Sabine would stop here.",
            message: result.violations.map((v) => `${v.rule} ${v.explanation}`).join(" "),
            fields: [...new Set(result.violations.flatMap((v) => v.fields))],
          };
        }}
      />
      <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        <TutorPanel violations={violations} />
      </aside>
    </div>
  );
}
