"use client";
// Interviewer (ElevenLabs) side panel for /capture.
// When to ask: after a judgment-relevant action (Type of Meal, guests, attachments,
// save...) we wait until there has been no typing/pointer activity, no screen event
// and no expert speech for PAUSE_MS, the agent is silent, no document is open
// (she is reading), and MIN_GAP_MS has passed since the last question.
// Only then is the agent allowed one question.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider } from "@elevenlabs/react";
import { getHistory, onActivity, resetSession, subscribe, useScreenEvents } from "@/lib/events";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import { attachDocs, attachScreenshots, saveSession, saveWorkMap } from "@/lib/session";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import type { ScreenEvent } from "@/lib/types";
import { registerAgent, sendToAgent, STATE_LABEL, type AgentUiState } from "./agent";
import { setCapturePaused, snapshot, startScreenCapture, stopScreenCapture } from "./screenCapture";
import EventLog from "./EventLog";

const PAUSE_MS = 3500;
const MIN_GAP_MS = 20000;

// Actions worth a "why" question. Plain amount typing is not: the screen already answers it.
const JUDGMENT_FIELDS = new Set(["type_of_meal", "location", "business_purpose"]);
const JUDGMENT_TYPES = new Set(["guest_added", "guest_removed", "attachment_added", "attachment_removed", "project_selected", "expense_saved", "validation_failed"]);
const isNotable = (e: ScreenEvent) =>
  e.source === "dom" && (JUDGMENT_TYPES.has(e.type) || (e.type === "field_changed" && JUDGMENT_FIELDS.has(e.field ?? "")));

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
  const [waiting, setWaiting] = useState<string | null>(null); // why the agent is holding a question
  const [questions, setQuestions] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const seenEvents = useScreenEvents();

  const agentRef = useRef(agent);
  const offRef = useRef(false);
  const pending = useRef<ScreenEvent | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastActivity = useRef(0);
  const lastQuestion = useRef(0);
  const reading = useRef(false);
  const offRecordEvents = useRef(new Set<ScreenEvent>());
  const shots = useRef<Record<string, string>>({});

  useEffect(() => {
    agentRef.current = agent;
    offRef.current = offRecord;
  });

  useEffect(() => {
    if (!agent.connected) return;
    return registerAgent({
      context: (t) => agentRef.current.sendContextualUpdate(t),
      message: (t) => agentRef.current.sendUserMessage(t),
    });
  }, [agent.connected]);

  useEffect(() => {
    if (!agent.connected || phase !== "task") return;

    function tryAsk() {
      const a = agentRef.current;
      const now = Date.now();
      if (!pending.current || offRef.current) return setWaiting(null);
      if (a.isSpeaking || reading.current || now - a.lastUserSpeech.current < 2500 || now - lastActivity.current < PAUSE_MS) {
        setWaiting(reading.current ? "she is reading a document" : a.isSpeaking ? "agent is speaking" : "she is working or talking");
        timer.current = setTimeout(tryAsk, 1000);
        return;
      }
      const wait = MIN_GAP_MS - (now - lastQuestion.current);
      if (wait > 0) {
        setWaiting(`question budget: next in ${Math.ceil(wait / 1000)}s`);
        timer.current = setTimeout(tryAsk, Math.min(wait, 1000));
        return;
      }
      sendToAgent(
        `[PAUSE] Sabine paused right after: ${pending.current.description}. Ask one short question about why, or about a limit or when she would stop and ask.`,
        { respond: true },
      );
      lastQuestion.current = now;
      pending.current = null;
      setQuestions((q) => q + 1);
      setWaiting(null);
    }

    const unsubscribe = subscribe((e) => {
      if (offRef.current) {
        offRecordEvents.current.add(e);
        return;
      }
      sendToAgent(`[SCREEN] ${e.time} ${e.description}`);
      // A screen change is activity too (vision lags 2–3 s behind, so only the app's own events count).
      if (e.source === "dom") lastActivity.current = Date.now();
      if (e.type === "document_opened") reading.current = true;
      if (e.type === "document_closed") reading.current = false;
      // Screen moment: grab the frame a beat later so the change is visible on it.
      setTimeout(() => {
        const shot = snapshot();
        if (shot && !shots.current[e.time]) shots.current[e.time] = shot;
      }, 600);
      if (isNotable(e)) {
        pending.current = e;
        setWaiting("waiting for a pause");
        clearTimeout(timer.current);
        timer.current = setTimeout(tryAsk, PAUSE_MS);
      }
    });

    function onKey() {
      lastActivity.current = Date.now();
      agentRef.current.sendUserActivity();
    }
    window.addEventListener("keydown", onKey);
    const offActivity = onActivity(onKey); // typing / pointer / scroll inside Ledgerline
    return () => {
      unsubscribe();
      offActivity();
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

  async function start() {
    setStarting(true);
    resetSession();
    shots.current = {};
    try {
      await startScreenCapture(() => setSharing(false));
      setSharing(true);
    } catch {
      // Sharing declined: the agent still gets Ledgerline events, just no vision/screenshots.
    }
    await agent.start();
    setStarting(false);
  }

  function stop() {
    agent.endSession();
    stopScreenCapture();
    setSharing(false);
  }

  function toggleOffRecord() {
    const next = !offRecord;
    setOffRecord(next);
    agent.setMuted(next);
    setCapturePaused(next);
    sendToAgent(next ? "[SCREEN] Sabine went off the record." : "[SCREEN] Sabine is back on the record.");
  }

  function finishTask() {
    setPhase("debrief");
    sendToAgent(
      `[DEBRIEF] Sabine is done with the task. Everything that happened on screen:\n${recordedEvents()
        .map((e) => `${e.time} ${e.description}`)
        .join("\n")}\nStart the debrief now.`,
      { respond: true },
    );
  }

  async function buildMap() {
    setPhase("building");
    setBuildError(null);
    stop();
    const events = recordedEvents();
    try {
      const res = await fetch("/api/workmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events, transcript: agent.transcript }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json();
      if (!res.ok || !data.steps?.length) throw new Error(data.error || "The Work Map came back empty.");
      saveWorkMap(attachDocs(attachScreenshots(data, shots.current), events));
      router.push("/map");
    } catch (e) {
      // Safety net for the live demo: retry, or fall back to the prepared map.
      setBuildError(e instanceof Error && e.name === "TimeoutError" ? "Building the Work Map took too long." : String(e instanceof Error ? e.message : e).slice(0, 200));
      setPhase("debrief");
    }
  }

  function loadPreparedMap() {
    // Prepared map from the rehearsal (sample), with this session's screen moments where they fit.
    saveWorkMap(attachScreenshots(sampleWorkMap, shots.current));
    router.push("/map");
  }

  const ui: AgentUiState =
    phase === "building" ? "building"
    : starting || agent.status === "connecting" ? "connecting"
    : !agent.connected ? "not_started"
    : offRecord ? "off_record"
    : agent.isSpeaking ? "asking"
    : phase === "debrief" ? "debrief"
    : waiting && waiting !== "waiting for a pause" ? "quiet"
    : "listening";

  const pillClass: Record<AgentUiState, string> = {
    not_started: "bg-[#EEF1F4] text-[#444]",
    connecting: "bg-[#EEF1F4] text-[#444]",
    listening: "bg-ok-soft text-ok",
    quiet: "bg-warn-soft text-[#7a5a00]",
    asking: "bg-brand-soft text-brand",
    off_record: "bg-err-soft text-err",
    debrief: "bg-brand-soft text-brand",
    building: "bg-brand-soft text-brand",
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <section className="card flex-none">
        <div className="card-bar">
          <span>Apprentice</span>
          <span className={`pill ml-auto ${pillClass[ui]}`}>
            <Dot ui={ui} /> {STATE_LABEL[ui]}
          </span>
        </div>
        <div className="card-body flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => agent.setMuted(!agent.isMuted)}
              disabled={!agent.connected || offRecord}
              aria-label={agent.isMuted ? "Unmute microphone" : "Mute microphone"}
              className={`grid h-11 w-11 place-items-center rounded-full border ${agent.connected && !agent.isMuted ? "border-brand bg-brand text-white" : "border-line bg-panel text-muted"} disabled:opacity-50`}
            >
              <MicIcon muted={!agent.connected || agent.isMuted} />
            </button>
            <div className="min-w-0 flex-1 text-[13px] leading-snug text-[#444]">
              {ui === "not_started" && "Start, then share this tab. The apprentice stays quiet while Sabine works and asks at natural pauses."}
              {ui === "connecting" && "Connecting the voice agent…"}
              {ui === "listening" && (waiting ? "A question is ready. Waiting for a natural pause." : "Watching the screen and listening.")}
              {ui === "quiet" && `Holding the question: ${waiting}.`}
              {ui === "asking" && "Asking about what just happened on screen."}
              {ui === "off_record" && "Nothing is recorded or sent until you resume."}
              {ui === "debrief" && "Debrief: closing gaps, then the teach-back."}
              {ui === "building" && "Merging events, transcript and answers…"}
            </div>
            {!agent.connected ? (
              <button className="btn-pri" onClick={start} disabled={starting || phase === "building"}>Start</button>
            ) : (
              <button className="btn" onClick={stop}>Stop</button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[13px]">
            <Stat label="Questions asked" value={String(questions)} />
            <Stat label="Screen" value={sharing ? (offRecord ? "Paused" : "Shared · vision on") : "App events only"} />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex flex-1 cursor-pointer items-center gap-2 text-[14px]">
              <span
                role="switch"
                aria-checked={offRecord}
                tabIndex={0}
                onClick={() => agent.connected && toggleOffRecord()}
                onKeyDown={(e) => e.key === " " && agent.connected && toggleOffRecord()}
                className={`relative h-5 w-9 rounded-full transition ${offRecord ? "bg-err" : "bg-[#c7ccd1]"} ${agent.connected ? "" : "opacity-50"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${offRecord ? "left-[18px]" : "left-0.5"}`} />
              </span>
              Off the record
            </label>
            {agent.connected && phase === "task" && <button className="btn h-9 text-[14px]" onClick={finishTask}>I&apos;m done → debrief</button>}
            {(phase === "debrief" || (!agent.connected && phase === "task" && seenEvents.length > 0)) && (
              // Also offered without a live agent (e.g. voice credits ran out): events alone still build a map.
              <button className="btn-pri h-9 text-[14px]" onClick={buildMap}>Build Work Map</button>
            )}
          </div>
          {buildError && (
            <div className="border-l-4 border-warn bg-warn-soft px-3 py-2 text-[13px]">
              <b>Couldn&apos;t build the Work Map.</b> {buildError}
              <div className="mt-2 flex gap-2">
                <button className="btn h-8 bg-white text-[13px]" onClick={buildMap}>Try again</button>
                <button className="btn-pri h-8 text-[13px]" onClick={loadPreparedMap}>Use prepared Work Map</button>
              </div>
            </div>
          )}
          {agent.error && <p className="rounded-sm border-l-4 border-err bg-err-soft px-3 py-2 text-[13px] text-[#8E1B1B]">{agent.error}</p>}
        </div>
      </section>

      <section className="card flex min-h-0 flex-1 flex-col">
        <div className="section-title rounded-t-sm border-t-0">Transcript</div>
        <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 text-[14px]">
          {agent.transcript.length === 0 && <li className="text-muted">The conversation will appear here.</li>}
          {agent.transcript.map((t, i) => (
            <li key={i} className="leading-snug">
              <span className="mr-1.5 font-mono text-[11.5px] text-muted">{t.time}</span>
              <b className={t.speaker === "agent" ? "text-brand" : "text-ink"}>{t.speaker === "agent" ? "Apprentice" : "Sabine"}:</b> {t.text}
            </li>
          ))}
        </ol>
      </section>

      <EventLog />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-line bg-panel px-3 py-2">
      <div className="text-[11.5px] uppercase tracking-wide text-muted">{label}</div>
      <div className="text-[15px] font-medium">{value}</div>
    </div>
  );
}

function Dot({ ui }: { ui: AgentUiState }) {
  const live = ui === "listening" || ui === "asking";
  return <span className={`inline-block h-2 w-2 rounded-full bg-current ${live ? "animate-pulse" : ""}`} />;
}

function MicIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
      {muted && <path d="M4 4l16 16" strokeLinecap="round" />}
    </svg>
  );
}
