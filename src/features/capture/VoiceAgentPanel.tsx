"use client";
// Owner: CS 1. Placeholder for the ElevenLabs Interviewer agent.
// TODO(CS 1): connect @elevenlabs/react useConversation with
//   ELEVENLABS_INTERVIEWER_AGENT_ID (get a signed URL from a server route).
// TODO(CS 1): subscribe() to the event bus and push events to the agent via a
//   client tool / contextual update so it knows what is on screen.
// TODO(CS 1): pause detection — only allow questions after N seconds with no
//   ScreenEvent and no speech (Scribe v2 Realtime VAD).
// TODO(CS 1): "off the record" toggle that stops forwarding events + transcript.

export default function VoiceAgentPanel() {
  return (
    <div className="rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-6">
      <h3 className="text-lg font-semibold text-sky-900">Voice agent (Interviewer)</h3>
      <p className="mt-1 text-sky-800">Placeholder — ElevenLabs agent will live here.</p>
      <button disabled className="mt-4 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white opacity-50">
        Start session
      </button>
    </div>
  );
}
