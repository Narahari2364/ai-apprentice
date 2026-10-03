"use client";
// Tutor agent for /teach. Gets the Work Map on connect, sees every screen event,
// and is told to intervene whenever a save is blocked by a guardrail.

import { useEffect, useRef, useState } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import { resetSession, subscribe } from "@/lib/events";
import { loadWorkMap } from "@/lib/session";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import type { GuardrailResult } from "@/lib/types";

interface Props {
  violations: GuardrailResult["violations"];
}

export default function TutorPanel({ violations }: Props) {
  return (
    <ConversationProvider>
      <Tutor violations={violations} />
    </ConversationProvider>
  );
}

function Tutor({ violations }: Props) {
  const agent = useVoiceAgent("tutor");
  const [showReplay, setShowReplay] = useState(false);
  const agentRef = useRef(agent);
  const map = loadWorkMap() ?? sampleWorkMap;
  const step = violations.length ? map.steps.find((s) => s.id === violations[0].stepId) : undefined;

  useEffect(() => {
    agentRef.current = agent;
  });

  useEffect(() => {
    if (!agent.connected) return;
    agentRef.current.sendContextualUpdate(`[WORKMAP] ${JSON.stringify(loadWorkMap() ?? sampleWorkMap)}`);
    return subscribe((e) => {
      if (e.type === "save_blocked") {
        setShowReplay(false);
        agentRef.current.sendUserMessage(
          `[BLOCKED] Lena tried to save but: ${e.description}. A replay of Sabine's screen moment is available on screen; offer it. Step in now.`,
        );
      } else {
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
      {violations.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border-2 border-red-400 bg-red-50 p-3 text-red-800">
          <div className="font-bold">✋ Sabine would stop here.</div>
          {violations.map((v) => (
            <div key={v.rule} className="text-sm">
              <b>{v.rule}</b> {v.explanation}
            </div>
          ))}
          {step && (
            <button
              onClick={() => setShowReplay((s) => !s)}
              className="self-start rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-red-800 border border-red-300"
            >
              {showReplay ? "Hide" : "▶ Replay"} Sabine&apos;s screen moment ({step.time})
            </button>
          )}
          {showReplay && step && (
            step.screenshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={step.screenshot} alt={`Sabine's screen at ${step.time}`} className="rounded border border-red-200" />
            ) : (
              <p className="text-sm italic">
                {step.time} · {step.decision || step.title} — “{step.expertQuote}” (no screenshot in this Work Map; capture a session with screen sharing to get one)
              </p>
            )
          )}
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
