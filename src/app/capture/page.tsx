"use client";
// Capture (Module 1): Ledgerline full screen as Paul; the Apprentice lives in its top bar.

import { useState } from "react";
import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import VoiceAgentPanel, { type CaptureStage } from "@/features/capture/VoiceAgentPanel";

export default function CapturePage() {
  const [stage, setStage] = useState<CaptureStage>("closed");
  return (
    <div className="h-full">
      <LedgerlineFrame
        query="user=paul"
        mode="capture"
        apprenticeOn={stage !== "closed"}
        onApprenticeClick={() => setStage(stage === "closed" ? "intro" : stage)}
      />
      <VoiceAgentPanel stage={stage} setStage={setStage} />
    </div>
  );
}
