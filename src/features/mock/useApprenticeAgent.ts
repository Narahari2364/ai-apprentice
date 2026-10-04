"use client";
// The panels' voice agent: the real ElevenLabs agent, or the scripted mock in mock mode (?mock).
// Both hooks always run (rules of hooks); the mock one never connects unless started.

import { useState } from "react";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import { installMockFetch, isMockMode } from "./mockMode";
import { useMockVoiceAgent } from "./useMockVoiceAgent";

export function useApprenticeAgent(role: "interviewer" | "tutor") {
  const [mock] = useState(() => {
    const on = isMockMode();
    if (on) installMockFetch();
    return on;
  });
  const real = useVoiceAgent(role);
  const fake = useMockVoiceAgent(role);
  return mock ? (fake as unknown as typeof real) : real;
}
