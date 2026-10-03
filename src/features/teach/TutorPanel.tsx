"use client";
// Owner: CS 2. Placeholder for the ElevenLabs Tutor agent.
// TODO(CS 2): connect @elevenlabs/react with ELEVENLABS_TUTOR_AGENT_ID, load the
//   Work Map as context, ask the new hire to predict the next decision.
// TODO(CS 2): when checkGuardrails blocks a save, have the tutor explain it in
//   the expert's words and replay the step's screenshot.
// TODO(CS 2): end-of-session summary: mastered vs. practice next.

import { useScreenEvents } from "@/lib/events";

export default function TutorPanel() {
  const events = useScreenEvents();
  const last = events[events.length - 1];
  return (
    <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-6">
      <h3 className="text-lg font-semibold text-emerald-900">Tutor</h3>
      <p className="mt-1 text-emerald-800">Placeholder — ElevenLabs tutor will coach here.</p>
      {last && (
        <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-700">
          Last action: <span className="font-mono">{last.description}</span>
        </p>
      )}
    </div>
  );
}
