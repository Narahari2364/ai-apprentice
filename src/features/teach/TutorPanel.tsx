"use client";
// Tutor (ElevenLabs) side panel for /teach: status, transcript, progress, mastery report.
// Gets the Work Map on connect, sees every screen event, and is told to step in
// whenever a save is blocked by a guardrail.

import { useEffect, useRef, useState } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import { resetSession, subscribe } from "@/lib/events";
import { loadWorkMap } from "@/lib/session";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import type { GuardrailResult, RuleKey } from "@/lib/types";
import { masteryReport, RULE_LABEL, type RuleStatus, type TeachProgress } from "./progress";

interface Props {
  violations: GuardrailResult["violations"];
  progress: TeachProgress;
  onReset: () => void;
}

export default function TutorPanel(props: Props) {
  return (
    <ConversationProvider>
      <Tutor {...props} />
    </ConversationProvider>
  );
}

const RULE_PILL: Record<RuleStatus, [string, string]> = {
  untested: ["Not met yet", "bg-[#EEF1F4] text-[#444]"],
  respected: ["Respected", "bg-ok-soft text-ok"],
  broken: ["Broken", "bg-err-soft text-err"],
  fixed: ["Fixed", "bg-warn-soft text-[#7a5a00]"],
};

function Tutor({ violations, progress, onReset }: Props) {
  const agent = useVoiceAgent("tutor");
  const [showReplay, setShowReplay] = useState(false);
  const [report, setReport] = useState<ReturnType<typeof masteryReport> | null>(null);
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
    onReset();
    setReport(null);
    agent.start();
  }

  function finish() {
    const r = masteryReport(progress);
    setReport(r);
    if (agent.connected) {
      agent.sendUserMessage(
        `[DONE] Lena is finished. Mastered: ${r.mastered.join("; ") || "nothing yet"}. Practise next: ${r.practise.join("; ") || "nothing"}. Give her the short summary now.`,
      );
    }
  }

  const status = !agent.connected
    ? agent.status === "connecting" ? "Connecting…" : "Not started"
    : agent.isSpeaking ? (violations.length ? "Stepping in" : "Coaching") : "Watching";
  const stepsDone = progress.steps.filter((s) => s.done).length;
  const ruleKeys = Object.keys(progress.rules) as RuleKey[];
  const respected = ruleKeys.filter((k) => progress.rules[k] === "respected" || progress.rules[k] === "fixed").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <section className="card flex-none">
        <div className="card-bar">
          <span>Tutor</span>
          <span className={`pill ml-auto ${agent.connected ? "bg-ok-soft text-ok" : "bg-[#EEF1F4] text-[#444]"}`}>
            <span className={`inline-block h-2 w-2 rounded-full bg-current ${agent.connected ? "animate-pulse" : ""}`} /> {status}
          </span>
        </div>
        <div className="card-body flex items-center gap-3">
          <p className="flex-1 text-[13px] leading-snug text-[#444]">
            {agent.connected
              ? "Coaching Lena in Sabine's words. Every Save is checked against Sabine's guardrails."
              : "Start the tutor, then file a new meal expense as Lena."}
          </p>
          {!agent.connected ? (
            <button className="btn-pri" onClick={start}>Start</button>
          ) : (
            <button className="btn" onClick={() => agent.endSession()}>Stop</button>
          )}
        </div>
        {agent.error && <p className="mx-4 mb-4 border-l-4 border-err bg-err-soft px-3 py-2 text-[13px] text-[#8E1B1B]">{agent.error}</p>}
      </section>

      {violations.length > 0 && (
        <section className="flex-none border-l-[5px] border-warn bg-warn-soft px-4 py-3 text-[14px]">
          <div className="mb-1 font-bold">Sabine would stop here.</div>
          {violations.map((v) => (
            <p key={v.key} className="mb-1.5 leading-snug">
              <b>{v.rule}</b> {v.explanation}
            </p>
          ))}
          {step && (
            <button onClick={() => setShowReplay((s) => !s)} className="btn mt-1 h-8 bg-white text-[13px]">
              {showReplay ? "Hide" : "▶ Replay"} Sabine&apos;s screen moment ({step.time})
            </button>
          )}
          {showReplay && step && (
            step.screenshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={step.screenshot} alt={`Sabine's screen at ${step.time}`} className="mt-2 rounded-sm border border-line" />
            ) : (
              <p className="mt-2 italic text-[#444]">
                {step.time} · {step.decision || step.title}: “{step.expertQuote}” (capture a session with screen sharing to get the screenshot)
              </p>
            )
          )}
        </section>
      )}

      <section className="card flex-none">
        <div className="section-title flex rounded-t-sm border-t-0">
          Progress <span className="ml-auto font-normal normal-case text-muted">{stepsDone}/{progress.steps.length} steps · {respected}/{ruleKeys.length} guardrails</span>
        </div>
        <ul className="px-4 py-2 text-[14px]">
          {progress.steps.map((s) => (
            <li key={s.label} className="flex items-center gap-2 py-1">
              <span className={`grid h-4 w-4 place-items-center rounded-sm border text-[11px] ${s.done ? "border-ok bg-ok text-white" : "border-[#bbb]"}`}>{s.done ? "✓" : ""}</span>
              <span className={s.done ? "" : "text-muted"}>{s.label}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line px-4 py-2">
          {ruleKeys.map((k) => (
            <div key={k} className="flex items-center gap-2 py-1 text-[13.5px]">
              <span className="flex-1">{RULE_LABEL[k]}</span>
              <span className={`pill ${RULE_PILL[progress.rules[k]][1]}`}>{RULE_PILL[progress.rules[k]][0]}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line p-3">
          <button className="btn-pri w-full" onClick={finish}>Finish session · mastery report</button>
        </div>
      </section>

      {report && (
        <section className="card flex-none">
          <div className="card-bar">Mastery report</div>
          <div className="card-body grid gap-3 text-[14px]">
            <ReportList title="Mastered" tone="text-ok" items={report.mastered} empty="Nothing yet." />
            <ReportList title="Practise next" tone="text-err" items={report.practise} empty="Nothing. Ready for real cases." />
            {report.untested.length > 0 && <ReportList title="Not covered by this case" tone="text-muted" items={report.untested} empty="" />}
          </div>
        </section>
      )}

      <section className="card flex min-h-48 flex-1 flex-col">
        <div className="section-title rounded-t-sm border-t-0">Transcript</div>
        <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 text-[14px]">
          {agent.transcript.length === 0 && <li className="text-muted">The conversation will appear here.</li>}
          {agent.transcript.map((t, i) => (
            <li key={i} className="leading-snug">
              <b className={t.speaker === "agent" ? "text-brand" : "text-ink"}>{t.speaker === "agent" ? "Tutor" : "Lena"}:</b> {t.text}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function ReportList({ title, tone, items, empty }: { title: string; tone: string; items: string[]; empty: string }) {
  return (
    <div>
      <div className={`mb-1 text-[12.5px] font-bold uppercase tracking-wide ${tone}`}>{title}</div>
      {items.length ? (
        <ul className="list-disc space-y-0.5 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      ) : (
        <p className="text-muted">{empty}</p>
      )}
    </div>
  );
}
