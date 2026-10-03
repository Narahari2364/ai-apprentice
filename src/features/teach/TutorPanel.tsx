"use client";
// Tutor agent for /teach. Gets the Work Map on connect, sees every screen event,
// and is told to intervene whenever a save is blocked by a guardrail.

import { useEffect, useRef, useState } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import { resetSession, subscribe } from "@/lib/events";
import { loadWorkMap } from "@/lib/session";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import { sampleWorkMap } from "@/data/sampleWorkMap";

export default function TutorPanel() {
  return (
    <ConversationProvider>
      <Tutor />
    </ConversationProvider>
  );
}

function Tutor() {
  const agent = useVoiceAgent("tutor");
  const [blocked, setBlocked] = useState<string | null>(null);
  const agentRef = useRef(agent);

  useEffect(() => {
    agentRef.current = agent;
  });

  useEffect(() => {
    if (!agent.connected) return;
    agentRef.current.sendContextualUpdate(`[WORKMAP] ${JSON.stringify(loadWorkMap() ?? sampleWorkMap)}`);
    return subscribe((e) => {
      if (e.type === "save_blocked") {
        setBlocked(e.description);
        agentRef.current.sendUserMessage(`[BLOCKED] Lena tried to save but: ${e.description}. Step in now.`);
      } else {
        if (e.type === "saved") setBlocked(null);
        agentRef.current.sendContextualUpdate(`[SCREEN] ${e.time} ${e.description}`);
      }
    });
  }, [agent.connected]);

  function start() {
    resetSession();
    agent.start();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-emerald-900">Tutor</h3>
        <span className="text-sm text-emerald-700">
          {agent.connected ? (agent.isSpeaking ? "🔊 speaking" : "👂 listening") : agent.status}
        </span>
      </div>
      {!agent.connected ? (
        <button onClick={start} className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">
          Start tutor
        </button>
      ) : (
        <button onClick={() => agent.endSession()} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm">
          End session
        </button>
      )}
      {blocked && (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 p-3 text-red-800">
          <div className="font-bold">✋ Sabine would stop here.</div>
          <div className="text-sm">{blocked}</div>
        </div>
      )}
      {agent.error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{agent.error}</p>}
      {agent.transcript.length > 0 && (
        <ol className="max-h-72 space-y-1 overflow-y-auto text-sm">
          {agent.transcript.map((t, i) => (
            <li key={i} className={t.speaker === "agent" ? "text-emerald-900" : "text-slate-700"}>
              <b>{t.speaker === "agent" ? "Tutor" : "You"}:</b> {t.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
