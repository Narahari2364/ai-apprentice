"use client";
// The Apprentice in learning mode (/capture): start card → floating popup over Ledgerline.
// When to ask: after a judgment-relevant action (an attachment, a guest, a key field,
// a save) we wait until there has been no typing/pointer activity, no screen event
// and no expert speech for PAUSE_MS, the agent is silent, no document is open
// (he is reading), and MIN_GAP_MS has passed since the last question.
// Then the agent may ask one question, and the field it is about gets an indigo outline.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider } from "@elevenlabs/react";
import { getHistory, onActivity, resetSession, subscribe, useScreenEvents } from "@/lib/events";
import { fieldFor, sendCommand } from "@/lib/ledgerline";
import { attachDocs, attachScreenshots, saveSession, saveWorkMap } from "@/lib/session";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import type { ScreenEvent } from "@/lib/types";
import Popup, { ListeningBars } from "@/features/apprentice/Popup";
import StartCard from "@/features/apprentice/StartCard";
import { registerAgent, sendToAgent, STATE_LABEL, type AgentUiState } from "./agent";
import { setCapturePaused, snapshot, startScreenCapture, stopScreenCapture } from "./screenCapture";
import EventLog from "./EventLog";

const PAUSE_MS = 3500;
const MIN_GAP_MS = 20000;
const EXPERT = "Paul Adler";

// Actions worth a "why" question. Plain amount typing is not: the screen already answers it.
const JUDGMENT_FIELDS = new Set(["type_of_meal", "location", "business_purpose"]);
const JUDGMENT_TYPES = new Set(["guest_added", "guest_removed", "attachment_added", "attachment_removed", "project_selected", "expense_saved", "validation_failed"]);
const isNotable = (e: ScreenEvent) =>
  e.source === "dom" && (JUDGMENT_TYPES.has(e.type) || (e.type === "field_changed" && JUDGMENT_FIELDS.has(e.field ?? "")));

export type CaptureStage = "closed" | "intro" | "live";

interface Props {
  stage: CaptureStage;
  setStage: (s: CaptureStage) => void;
}

export default function VoiceAgentPanel(props: Props) {
  return (
    <ConversationProvider>
      <Interviewer {...props} />
    </ConversationProvider>
  );
}

function Interviewer({ stage, setStage }: Props) {
  const router = useRouter();
  const agent = useVoiceAgent("interviewer");
  const [offRecord, setOffRecord] = useState(false);
  const [phase, setPhase] = useState<"task" | "debrief" | "building">("task");
  const [waiting, setWaiting] = useState<string | null>(null); // why the agent is holding a question
  const [sharing, setSharing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const [task, setTask] = useState("Meal expense report");
  const seenEvents = useScreenEvents();

  const agentRef = useRef(agent);
  const offRef = useRef(false);
  const pending = useRef<ScreenEvent | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastActivity = useRef(0);
  const lastQuestion = useRef(0);
  const reading = useRef(false);
  const highlighted = useRef(false);
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

  // The question's highlight goes away once the expert answers.
  const lastLine = agent.transcript[agent.transcript.length - 1];
  useEffect(() => {
    if (lastLine?.speaker === "expert" && highlighted.current) {
      sendCommand({ cmd: "clear_highlight" });
      highlighted.current = false;
    }
  }, [lastLine]);

  useEffect(() => {
    if (!agent.connected || phase !== "task") return;

    function tryAsk() {
      const a = agentRef.current;
      const now = Date.now();
      const e = pending.current;
      if (!e || offRef.current) return setWaiting(null);
      if (a.isSpeaking || reading.current || now - a.lastUserSpeech.current < 2500 || now - lastActivity.current < PAUSE_MS) {
        setWaiting(reading.current ? "he is reading a document" : a.isSpeaking ? "agent is speaking" : "he is working or talking");
        timer.current = setTimeout(tryAsk, 1000);
        return;
      }
      const wait = MIN_GAP_MS - (now - lastQuestion.current);
      if (wait > 0) {
        setWaiting(`question budget: next in ${Math.ceil(wait / 1000)}s`);
        timer.current = setTimeout(tryAsk, Math.min(wait, 1000));
        return;
      }
      // Earlier saved expenses let the agent spot "same kind of expense, different steps".
      const earlier = getHistory()
        .filter((h) => h.type === "expense_saved" && h !== e)
        .slice(-3)
        .map((h) => `- ${h.description}`)
        .join("\n");
      sendToAgent(
        `[PAUSE] Paul paused right after: ${e.description}.${earlier ? `\nEarlier expenses he saved:\n${earlier}` : ""}\nIf he handled this one differently from a similar earlier one, ask what the difference is. Otherwise ask one short question about why, a limit, or when he would stop and ask.`,
        { respond: true },
      );
      const field = fieldFor(e);
      if (field) {
        sendCommand({ cmd: "highlight", fields: [field] });
        highlighted.current = true;
      }
      lastQuestion.current = now;
      pending.current = null;
      setWaiting(null);
    }

    const unsubscribe = subscribe((e) => {
      if (offRef.current) {
        offRecordEvents.current.add(e);
        return;
      }
      sendToAgent(`[SCREEN] ${e.time} ${e.description}`);
      // A screen change is activity too (vision lags 2–3 s behind, so only Ledgerline's own events count).
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

  async function start(chosenTask: string) {
    setTask(chosenTask);
    setStage("live");
    setStarting(true);
    resetSession();
    shots.current = {};
    try {
      await startScreenCapture(() => setSharing(false));
      setSharing(true);
    } catch {
      // Sharing declined: the agent still gets Ledgerline's events, just no vision/screenshots.
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
    sendToAgent(next ? "[SCREEN] Paul went off the record." : "[SCREEN] Paul is back on the record.");
  }

  function endTask() {
    setPhase("debrief");
    sendCommand({ cmd: "clear_highlight" });
    sendToAgent(
      `[DEBRIEF] Paul is done with the task (${task}). Everything that happened on screen:\n${recordedEvents()
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

  if (stage === "closed") return null;

  if (stage === "intro") {
    return (
      <StartCard
        title="Apprentice"
        subtitle="Show it how you do a task. It learns why."
        modeLabel="LEARNING MODE"
        taskLabel="Task you'll show"
        tasks={["Meal expense report", "Client-travel expense report"]}
        expectations={[
          "Watches <b>this Ledgerline window only</b>, nothing else on your screen.",
          "Stays quiet while you work and asks a few short questions out loud when you pause.",
          "You can go <b>off the record</b> any time.",
          "Names and card numbers are hidden automatically.",
          "You review everything it learned before anyone else sees it.",
        ]}
        startLabel="Start learning"
        onStart={start}
        onClose={() => setStage("closed")}
      />
    );
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

  const lastAgent = [...agent.transcript].reverse().find((t) => t.speaker === "agent");
  const review = phase !== "task";

  return (
    <Popup
      title="Apprentice"
      subtitle={review ? `Review mode · checking what it learned from ${EXPERT}` : `Learning from ${EXPERT}`}
      modeLabel={review ? "REVIEW" : "LEARNING MODE"}
      initial={{ left: 24, bottom: 120 }}
      width={420}
      foldable
    >
      <div className="px-4 pb-3 pt-3">
        {lastAgent ? (
          <div>
            <div className="text-[13px] text-[#444]">
              <b className="text-ink">Apprentice</b> <span className="ml-1 font-mono text-muted">{lastAgent.time}</span>
            </div>
            <p className="mt-0.5 text-[16px] leading-snug">{lastAgent.text}</p>
          </div>
        ) : (
          <p className="text-[14.5px] text-[#444]">
            {ui === "connecting" ? "Connecting…" : "Work as usual. I'll stay quiet and only ask when you pause."}
          </p>
        )}
        {offRecord && (
          <p className="mt-2 border-l-4 border-err bg-err-soft px-3 py-1.5 text-[13px] text-[#8E1B1B]">
            Off the record. Nothing is saved and no questions are asked until you resume.
          </p>
        )}
        {buildError && (
          <div className="mt-2 border-l-4 border-warn bg-warn-soft px-3 py-2 text-[13px]">
            <b>Couldn&apos;t build the Work Map.</b> {buildError}
            <div className="mt-2 flex gap-2">
              <button className="btn h-8 bg-white text-[13px]" onClick={buildMap}>Try again</button>
              <button className="btn-pri h-8 text-[13px]" onClick={loadPreparedMap}>Use prepared Work Map</button>
            </div>
          </div>
        )}
        {agent.error && <p className="mt-2 border-l-4 border-err bg-err-soft px-3 py-1.5 text-[13px] text-[#8E1B1B]">{agent.error}</p>}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
        <span className="flex min-w-0 flex-1 items-center gap-2 text-[14px] text-indigo">
          {(ui === "listening" || ui === "debrief") && <ListeningBars active />}
          <span className="truncate">{ui === "listening" || ui === "debrief" ? "Listening…" : STATE_LABEL[ui]}</span>
        </span>
        {phase === "task" && (
          <>
            <button
              onClick={toggleOffRecord}
              disabled={!agent.connected}
              className={`h-9 rounded-sm border px-3 text-[14px] disabled:opacity-50 ${offRecord ? "border-err bg-err text-white" : "border-indigo bg-white text-indigo hover:bg-indigo-soft"}`}
            >
              {offRecord ? "Back on record" : "Off the record"}
            </button>
            <button onClick={endTask} disabled={!agent.connected} className="h-9 rounded-sm bg-indigo px-3 text-[14px] text-white hover:bg-indigo-dark disabled:opacity-50">
              End task
            </button>
          </>
        )}
        {(phase === "debrief" || (!agent.connected && phase === "task" && seenEvents.length > 0 && !starting)) && (
          // Also offered without a live agent (e.g. voice credits ran out): events alone still build a map.
          <button onClick={buildMap} className="h-9 rounded-sm bg-indigo px-3 text-[14px] text-white hover:bg-indigo-dark">
            Build Work Map
          </button>
        )}
      </div>

      <button onClick={() => setDetails((d) => !d)} className="w-full border-t border-line bg-panel-2 px-4 py-1.5 text-left text-[12.5px] text-muted hover:text-indigo">
        {details ? "▾ Hide details" : "▸ Details: transcript, screen events, pause detector"}
      </button>
      {details && (
        <div className="flex h-72 flex-col gap-2 border-t border-line bg-panel p-2">
          <div className="text-[12px] text-[#444]">
            Pause detector: <b>{waiting ?? "idle"}</b> · Screen: <b>{sharing ? (offRecord ? "paused" : "shared, vision on") : "app events only"}</b>
          </div>
          <ol className="max-h-28 min-h-0 space-y-1 overflow-y-auto rounded-sm border border-line bg-white p-2 text-[12.5px]">
            {agent.transcript.length === 0 && <li className="text-muted">No conversation yet.</li>}
            {agent.transcript.map((t, i) => (
              <li key={i}>
                <b className={t.speaker === "agent" ? "text-indigo" : ""}>{t.speaker === "agent" ? "Apprentice" : "Paul"}:</b> {t.text}
              </li>
            ))}
          </ol>
          <EventLog />
        </div>
      )}
    </Popup>
  );
}
