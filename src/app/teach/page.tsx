"use client";
// Teach: Lena works in Ledgerline with ?guard=1, so every Save waits for our decision.
// save_requested → checkGuardrails → save_decision (allow, or block in Sabine's words + fields to highlight).

import { useEffect, useRef, useState } from "react";
import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import TutorPanel from "@/features/teach/TutorPanel";
import { checkGuardrails } from "@/features/teach/checkGuardrails";
import { useTeachProgress } from "@/features/teach/progress";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import { onLedgerlineEvent, sendCommand } from "@/lib/ledgerline";
import { loadWorkMap } from "@/lib/session";
import type { ExpenseSnapshot, GuardrailResult } from "@/lib/types";

export default function TeachPage() {
  const [violations, setViolations] = useState<GuardrailResult["violations"]>([]);
  const { progress, recordCheck, reset } = useTeachProgress();
  const recordRef = useRef(recordCheck);

  useEffect(() => {
    recordRef.current = recordCheck;
  });

  useEffect(
    () =>
      onLedgerlineEvent((e) => {
        if (e.type !== "save_requested") return;
        const result = checkGuardrails(e.expense as ExpenseSnapshot, loadWorkMap() ?? sampleWorkMap);
        setViolations(result.violations);
        recordRef.current(result);
        sendCommand(
          result.ok
            ? { cmd: "save_decision", request_id: e.request_id as string, allow: true }
            : {
                cmd: "save_decision",
                request_id: e.request_id as string,
                allow: false,
                title: "Sabine would stop here.",
                message: result.violations.map((v) => `${v.rule} ${v.explanation}`).join(" "),
                fields: [...new Set(result.violations.flatMap((v) => v.fields))],
                note: result.violations[0].explanation,
              },
        );
      }),
    [],
  );

  return (
    <div className="grid h-full grid-cols-[68%_32%]">
      <LedgerlineFrame query="user=lena&guard=1" />
      <aside className="flex min-h-0 flex-col border-l border-line bg-panel p-3">
        <TutorPanel violations={violations} progress={progress} onReset={reset} />
      </aside>
    </div>
  );
}
