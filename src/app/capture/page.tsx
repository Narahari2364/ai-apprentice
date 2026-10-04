"use client";
// Capture (Module 1): Ledgerline full screen as Paul; the Apprentice lives in its top bar.

import { useState } from "react";
import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import ModeRibbon from "@/components/ModeRibbon";
import VoiceAgentPanel, { type CaptureStage } from "@/features/capture/VoiceAgentPanel";

export default function CapturePage() {
  const [stage, setStage] = useState<CaptureStage>("closed");
  return (
    <div className="flex h-full flex-col">
      <ModeRibbon mode="learning" />
      <div className="min-h-0 flex-1">
        <LedgerlineFrame
          query="user=paul"
          mode="capture"
          apprenticeOn={stage !== "closed"}
          onApprenticeClick={() => setStage(stage === "closed" ? "intro" : stage)}
        />
      </div>
      <VoiceAgentPanel stage={stage} setStage={setStage} />
    </div>
  );
}
