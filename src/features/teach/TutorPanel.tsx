"use client";
// The Apprentice in teaching mode (/teach): start card → floating popup over Ledgerline.
// The tutor gets Paul's Work Map on connect, sees every screen event, and is told to
// step in whenever a save is blocked by a guardrail. Shows progress and the mastery report.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ConversationProvider } from "@elevenlabs/react";
import { resetSession, subscribe } from "@/lib/events";
import { sendCommand } from "@/lib/ledgerline";
import { loadWorkMap } from "@/lib/session";
import { useVoiceAgent } from "@/lib/useVoiceAgent";
import { redact } from "@/lib/redact";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import type { GuardrailResult, RuleKey } from "@/lib/types";
import Popup, { ListeningBars } from "@/features/apprentice/Popup";
import StartCard from "@/features/apprentice/StartCard";
import { masteryReport, RULE_LABEL, type RuleStatus, type TeachProgress } from "./progress";

export type TeachStage = "closed" | "intro" | "live";

interface Props {
  stage: TeachStage;
  setStage: (s: TeachStage) => void;
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

function Tutor({ stage, setStage, violations, progress, onReset }: Props) {
  const agent = useVoiceAgent("tutor");
  const [showReplay, setShowReplay] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
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
          redact(`[BLOCKED] Lena tried to save but: ${e.description}. A replay of Paul's screen moment is available; offer it. Step in now.`),
        );
      } else {
        agentRef.current.sendContextualUpdate(redact(`[SCREEN] ${e.time} ${e.description}`));
      }
    });
  }, [agent.connected]);

  function start() {
    setStage("live");
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
        `[DONE] Lena is finished. Mastered: ${r.mastered.join("; ") || "nothing yet"}. Practise next: ${r.practise.join("; ") || "nothing"}. Give her the short closing now.`,
      );
    }
  }

  function replay() {
    const next = !showReplay;
    setShowReplay(next);
    // Show the document Paul looked at in this step, inside Lena's Ledgerline.
    if (next && step?.docId) sendCommand({ cmd: "open_document", doc_id: step.docId });
    if (next && step && agent.connected) {
      agent.sendContextualUpdate(`[SCREEN] Replaying Paul's screen moment ${step.time}: ${step.decision || step.title}.`);
    }
  }

  if (stage === "closed") return null;

  if (stage === "intro") {
    return (
      <StartCard
        title="Apprentice"
        subtitle="Learn the task the way Paul does it."
        modeLabel="TEACHING MODE"
        taskLabel="Task you'll practise"
        tasks={["Meal expense report"]}
        expectations={[
          "Coaches you with <b>Paul's Work Map</b>: his steps, his reasons, his words.",
          "Asks you to predict each decision before you make it.",
          "Steps in <b>before</b> you save something Paul would never save.",
          "Can replay Paul's screen moment when it helps.",
          "Names and card numbers are hidden automatically.",
        ]}
        startLabel="Start coaching"
        onStart={start}
        onClose={() => setStage("closed")}
      />
    );
  }

  const lastTutor = [...agent.transcript].reverse().find((t) => t.speaker === "agent");
  const status = !agent.connected
    ? agent.status === "connecting" ? "Connecting…" : "Not started"
    : agent.isSpeaking ? (violations.length ? "Stepping in" : "Coaching") : "Listening…";
  const stepsDone = progress.steps.filter((s) => s.done).length;
  const ruleKeys = Object.keys(progress.rules) as RuleKey[];
  const respected = ruleKeys.filter((k) => progress.rules[k] === "respected" || progress.rules[k] === "fixed").length;

  return (
    <Popup
      title="Apprentice"
      subtitle="Coaching Lena with Paul's Work Map"
      modeLabel="TEACHING MODE"
      initial={{ left: 24, bottom: 110 }}
      width={430}
      foldable
    >
      {report ? (
        <div className="grid gap-3 px-4 py-3 text-[14px]">
          <div className="text-[16px] font-medium">Mastery report</div>
          <ReportList title="Mastered" tone="text-ok" items={report.mastered} empty="Nothing yet." />
          <ReportList title="Practise next" tone="text-err" items={report.practise} empty="Nothing. Ready for real cases." />
          {report.untested.length > 0 && <ReportList title="Not covered by this case" tone="text-muted" items={report.untested} empty="" />}
          <div className="flex gap-2 pt-1">
            <button className="h-9 rounded-sm border border-indigo bg-white px-3 text-[14px] text-indigo" onClick={() => setReport(null)}>Back</button>
            <Link href="/map" className="flex h-9 items-center rounded-sm bg-indigo px-3 text-[14px] text-white">Open Work Map</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="px-4 pb-3 pt-3">
            {lastTutor ? (
              <div>
                <div className="text-[13px] text-[#444]">
                  <b className="text-ink">Tutor</b> <span className="ml-1 font-mono text-muted">{lastTutor.time}</span>
                </div>
                <p className="mt-0.5 text-[16px] leading-snug">{lastTutor.text}</p>
              </div>
            ) : (
              <p className="text-[14.5px] text-[#444]">{agent.connected ? "Open the new expense when you're ready." : "Connecting…"}</p>
            )}
            {agent.error && <p className="mt-2 border-l-4 border-err bg-err-soft px-3 py-1.5 text-[13px] text-[#8E1B1B]">{agent.error}</p>}
          </div>

          {violations.length > 0 && (
            <div className="border-y border-[#F0D58A] border-l-[5px] border-l-warn bg-warn-soft px-4 py-2.5 text-[14px]">
              <div className="mb-1 font-bold">Paul would stop here.</div>
              {violations.map((v) => (
                <p key={v.key} className="mb-1.5 leading-snug">
                  <b>{v.rule}</b> {v.explanation}
                </p>
              ))}
              {step && (
                <button onClick={replay} className="mt-0.5 h-8 rounded-sm border border-indigo bg-white px-3 text-[13px] text-indigo">
                  {showReplay ? "Hide" : "▶ Replay"} Paul&apos;s screen moment ({step.time})
                </button>
              )}
              {showReplay && step && (
                <div className="mt-2 rounded-sm border border-line bg-white p-2">
                  <div className="mb-1 text-[12.5px] text-muted">
                    Paul at {step.time}: {step.decision || step.title}
                    {step.docId && " · his document is open in Ledgerline"}
                  </div>
                  {step.screenshot && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={step.screenshot} alt={`Paul's screen at ${step.time}`} className="mb-1 rounded-sm border border-line" />
                  )}
                  <p className="italic text-[#444]">“{step.expertQuote}”</p>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setShowProgress((p) => !p)} className="flex w-full items-center border-t border-line px-4 py-2 text-left text-[13px] text-[#444] hover:text-indigo">
            {showProgress ? "▾" : "▸"} Progress
            <span className="ml-auto">{stepsDone}/{progress.steps.length} steps · {respected}/{ruleKeys.length} rules</span>
          </button>
          {showProgress && (
            <div className="border-t border-line bg-panel px-4 py-2 text-[13.5px]">
              {progress.steps.map((s) => (
                <div key={s.label} className="flex items-center gap-2 py-0.5">
                  <span className={`grid h-4 w-4 place-items-center rounded-sm border text-[11px] ${s.done ? "border-ok bg-ok text-white" : "border-[#bbb] bg-white"}`}>{s.done ? "✓" : ""}</span>
                  <span className={s.done ? "" : "text-muted"}>{s.label}</span>
                </div>
              ))}
              <div className="mt-1 border-t border-line pt-1">
                {ruleKeys.map((k) => (
                  <div key={k} className="flex items-center gap-2 py-0.5">
                    <span className="flex-1">{RULE_LABEL[k]}</span>
                    <span className={`pill ${RULE_PILL[progress.rules[k]][1]}`}>{RULE_PILL[progress.rules[k]][0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
            <span className="flex min-w-0 flex-1 items-center gap-2 text-[14px] text-indigo">
              {status === "Listening…" && <ListeningBars active />}
              {status}
            </span>
            <button onClick={finish} className="h-9 rounded-sm bg-indigo px-3 text-[14px] text-white hover:bg-indigo-dark">
              Finish
            </button>
          </div>
        </>
      )}
    </Popup>
  );
}

function ReportList({ title, tone, items, empty }: { title: string; tone: string; items: string[]; empty: string }) {
  return (
    <div>
      <div className={`mb-1 text-[12.5px] font-bold uppercase tracking-wide ${tone}`}>{title}</div>
      {items.length ? <ul className="list-disc space-y-0.5 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="text-muted">{empty}</p>}
    </div>
  );
}
