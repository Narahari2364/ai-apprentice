"use client";
// Interviewer agent for /capture.
// When to ask: after a notable screen action (field or status change) we wait for
// PAUSE_MS with no keystrokes, no expert speech and the agent silent, and at least
// MIN_GAP_MS since the last question. Only then is the agent allowed one question.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider } from "@elevenlabs/react";
import { getHistory, resetSession, subscribe } from "@/lib/events";
import { saveSession, saveWorkMap } from "@/lib/session";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import type { ScreenEvent } from "@/lib/types";

const PAUSE_MS = 3500;
const MIN_GAP_MS = 20000;

export default function VoiceAgentPanel() {
  return (
    <ConversationProvider>
      <Interviewer />
    </ConversationProvider>
  );
}

function Interviewer() {
  const router = useRouter();
  const agent = useVoiceAgent("interviewer");
  const [offRecord, setOffRecord] = useState(false);
  const [phase, setPhase] = useState<"task" | "debrief" | "building">("task");
  const [detector, setDetector] = useState("idle");
  const [questions, setQuestions] = useState(0);

  const agentRef = useRef(agent);
  const offRef = useRef(false);
  const pending = useRef<ScreenEvent | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastActivity = useRef(0);
  const lastQuestion = useRef(0);
  const offRecordEvents = useRef(new Set<ScreenEvent>());

  useEffect(() => {
    agentRef.current = agent;
    offRef.current = offRecord;
  });

  useEffect(() => {
    if (!agent.connected || phase !== "task") return;

    function tryAsk() {
      const a = agentRef.current;
      const now = Date.now();
      if (!pending.current || offRef.current) return setDetector("idle");
      const busy =
        a.isSpeaking || now - a.lastUserSpeech.current < 2500 || now - lastActivity.current < PAUSE_MS;
      if (busy) {
        setDetector("expert busy, staying quiet");
        timer.current = setTimeout(tryAsk, 1000);
        return;
      }
      const wait = MIN_GAP_MS - (now - lastQuestion.current);
      if (wait > 0) {
        setDetector(`saving question (rate limit ${Math.ceil(wait / 1000)}s)`);
        timer.current = setTimeout(tryAsk, Math.min(wait, 1000));
        return;
      }
      a.sendUserMessage(
        `[PAUSE] Sabine paused right after: ${pending.current.description}. Ask one short question about why, or about a limit or when she would stop and ask.`,
      );
      lastQuestion.current = now;
      pending.current = null;
      setQuestions((q) => q + 1);
      setDetector("asked at pause");
    }

    const unsubscribe = subscribe((e) => {
      if (offRef.current) {
        offRecordEvents.current.add(e);
        return;
      }
      agentRef.current.sendContextualUpdate(`[SCREEN] ${e.time} ${e.description}`);
      if (e.type === "field_changed" || e.type === "status_changed") {
        pending.current = e;
        setDetector("waiting for a pause");
        clearTimeout(timer.current);
        timer.current = setTimeout(tryAsk, PAUSE_MS);
      }
    });

    function onKey() {
      lastActivity.current = Date.now();
      agentRef.current.sendUserActivity();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer.current);
    };
  }, [agent.connected, phase]);

  useEffect(() => {
    saveSession({ events: recordedEvents(), transcript: agent.transcript });
  });

  function recordedEvents() {
    return getHistory().filter((e) => !offRecordEvents.current.has(e));
  }

  function start() {
    resetSession();
    agent.start();
  }

  function toggleOffRecord() {
    const next = !offRecord;
    setOffRecord(next);
    agent.setMuted(next);
    agent.sendContextualUpdate(next ? "[SCREEN] Sabine went off the record." : "[SCREEN] Sabine is back on the record.");
  }

  function finishTask() {
    setPhase("debrief");
    agent.sendUserMessage(
      `[DEBRIEF] Sabine is done with the task. Everything that happened on screen:\n${recordedEvents()
        .map((e) => `${e.time} ${e.description}`)
        .join("\n")}\nStart the debrief now.`,
    );
  }

  async function buildMap() {
    setPhase("building");
    agent.endSession();
    const res = await fetch("/api/workmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: recordedEvents(), transcript: agent.transcript }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPhase("debrief");
      alert(data.error);
      return;
    }
    saveWorkMap(data);
    router.push("/map");
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-sky-900">Apprentice (Interviewer)</h3>
        <span className="text-sm text-sky-700">
          {agent.connected ? (agent.isSpeaking ? "🔊 speaking" : "👂 listening") : agent.status}
        </span>
      </div>

      {!agent.connected && phase === "task" && (
        <button onClick={start} className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white">
          Start session
        </button>
      )}

      {agent.connected && (
        <>
          <div className="text-sm text-sky-800">
            Pause detector: <b>{detector}</b> · questions asked: <b>{questions}</b>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleOffRecord}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${offRecord ? "bg-red-600 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
            >
              {offRecord ? "● Off the record (tap to resume)" : "Go off the record"}
            </button>
            {phase === "task" && (
              <button onClick={finishTask} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
                I&apos;m done → debrief
              </button>
            )}
            {phase === "debrief" && (
              <button onClick={buildMap} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">
                Build Work Map
              </button>
            )}
          </div>
        </>
      )}
      {phase === "building" && <p className="text-sky-800">Building the Work Map…</p>}
      {agent.error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{agent.error}</p>}

      {agent.transcript.length > 0 && (
        <ol className="max-h-56 space-y-1 overflow-y-auto text-sm">
          {agent.transcript.map((t, i) => (
            <li key={i} className={t.speaker === "agent" ? "text-sky-900" : "text-slate-700"}>
              <span className="font-mono text-xs text-slate-400">{t.time}</span>{" "}
              <b>{t.speaker === "agent" ? "Apprentice" : "Expert"}:</b> {t.text}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
