"use client";
// Teach (Module 3): Ledgerline full screen as Maya with ?guard=1, so every Save waits for us.
// save_requested → checkGuardrails → save_decision (allow, or block in Paul's words + fields to highlight).

import { useEffect, useRef, useState } from "react";
import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import ModeRibbon from "@/components/ModeRibbon";
import TutorPanel, { type TeachStage } from "@/features/teach/TutorPanel";
import { checkGuardrails } from "@/features/teach/checkGuardrails";
import { useTeachProgress } from "@/features/teach/progress";
import { onLedgerlineEvent, sendCommand } from "@/lib/ledgerline";
import { loadTeachingMap } from "@/lib/session";
import type { ExpenseSnapshot, GuardrailResult } from "@/lib/types";

export default function TeachPage() {
  const [stage, setStage] = useState<TeachStage>("closed");
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
        const result = checkGuardrails(e.expense as ExpenseSnapshot, loadTeachingMap());
        setViolations(result.violations);
        recordRef.current(result);
        sendCommand(
          result.ok
            ? { cmd: "save_decision", request_id: e.request_id as string, allow: true }
            : {
                cmd: "save_decision",
                request_id: e.request_id as string,
                allow: false,
                // Soft banner: the tutor asks a hint question first instead of revealing the rule.
                title: "Save is paused.",
                message: "Your tutor has a question about this expense.",
                fields: [...new Set(result.violations.flatMap((v) => v.fields))],
                note: result.violations.map((v) => v.missing).join(" · "),
              },
        );
      }),
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <ModeRibbon mode="teaching" />
      <div className="min-h-0 flex-1">
        <LedgerlineFrame
          query="user=maya&guard=1"
          mode="teach"
          apprenticeOn={stage !== "closed"}
          onApprenticeClick={() => setStage(stage === "closed" ? "intro" : stage)}
        />
      </div>
      <TutorPanel stage={stage} setStage={setStage} violations={violations} progress={progress} onReset={reset} />
    </div>
  );
}
