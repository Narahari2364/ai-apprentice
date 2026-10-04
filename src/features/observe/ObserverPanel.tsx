"use client";
// The floating Apprentice's face: status, the current question, the workflow it is
// writing live from the screenshots (with the expert's answers merged in), and controls.

import { ListeningBars } from "@/features/apprentice/Popup";
import { TypeChip, guardrailType } from "@/features/workmap/WorkMapView";
import type { Observer, ObserverStatus } from "./useObserver";

const STATUS: Record<ObserverStatus, string> = {
  idle: "Not watching yet",
  connecting: "Connecting…",
  watching: "Watching · asks when you pause",
  reading: "Reading the screen…",
  asking: "Asking…",
  off_record: "Off the record",
  debrief: "Debrief · listening",
  building: "Writing the Work Map…",
};

const btnOutline = "h-9 rounded-sm border border-indigo bg-white px-3 text-[14px] text-indigo hover:bg-indigo-soft disabled:opacity-50";
const btnPrimary = "h-9 rounded-sm bg-indigo px-3 text-[14px] text-white hover:bg-indigo-dark disabled:opacity-50";

export default function ObserverPanel({ o, onStart }: { o: Observer; onStart?: () => void }) {
  const lastAgent = [...o.transcript].reverse().find((t) => t.speaker === "agent");
  const tail = o.transcript.slice(-4);

  return (
    <div className="flex h-full flex-col bg-white text-ink">
      <div className="flex items-center gap-3 bg-indigo px-4 py-3 text-white">
        <svg width="22" height="20" viewBox="0 0 18 16" aria-hidden="true">
          <path d="M1.5 1.5h15v10H6L1.5 15z" fill="#fff" />
          <path d="M5 5h8M5 8h5" stroke="#5146d9" strokeWidth="1.4" />
        </svg>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[17px] font-medium">Apprentice</div>
          <div className="truncate text-[12.5px] opacity-90">{o.offRecord ? "Paused by the expert" : "Learning from your screen"}</div>
        </div>
        <span className="rounded-sm border border-white/70 px-2 py-0.5 text-[11px] font-bold tracking-wide">
          {o.phase === "task" ? "LEARNING MODE" : "REVIEW MODE"}
        </span>
      </div>

      <div className="flex items-center gap-2 border-b border-line bg-panel-2 px-4 py-2 text-[13px] text-indigo">
        {(o.status === "watching" || o.status === "debrief") && <ListeningBars active />}
        {o.status === "reading" && <span className="h-2 w-2 animate-pulse rounded-full bg-indigo" />}
        <span className="flex-1 truncate">{STATUS[o.status]}</span>
        {o.sharing && <span className="text-[12px] text-ok">● screen shared</span>}
      </div>

      {o.offRecord ? (
        <div className="px-5 py-8 text-center">
          <div className="text-[12px] font-bold tracking-[.12em] text-[#666]">OFF THE RECORD</div>
          <div className="my-1.5 text-[20px]">Nothing is being saved</div>
          <p className="text-[14px] leading-relaxed text-[#555]">No screenshots, no voice, no questions. The Work Map will show a gap here.</p>
        </div>
      ) : (
        lastAgent && (
          <div className="border-b border-line bg-indigo-soft/60 px-4 py-3">
            <div className="text-[12px] text-[#555]">
              <b className="text-indigo">Apprentice</b> <span className="text-muted">{lastAgent.time}</span>
            </div>
            <p className="mt-0.5 text-[16px] leading-snug">{lastAgent.text}</p>
          </div>
        )
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {o.phase === "task" ? (
          <>
            <div className="mb-2 flex items-center text-[12px] font-bold uppercase tracking-[.12em] text-[#667085]">
              Workflow, written live <span className="ml-auto font-normal normal-case tracking-normal">{o.workflow.length} steps</span>
            </div>
            {o.workflow.length === 0 && (
              <p className="text-[14px] leading-relaxed text-[#555]">
                {o.sharing
                  ? "Work as usual. I write down each step from your screen and only ask when something isn't clear from the screenshots."
                  : "Share your screen to start."}
              </p>
            )}
            <ol className="space-y-2.5">
              {o.workflow.map((s, i) => (
                <li key={s.id} className="rise rounded-md border border-line px-3 py-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand text-[11px] font-bold text-white">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14.5px] font-medium leading-snug">{s.title}</div>
                      {s.detail && <div className="text-[12.5px] leading-snug text-[#667085]">{s.detail}</div>}
                      {s.why && <div className="mt-1 border-l-2 border-indigo pl-2 text-[13px] italic text-[#1f2d3d]">“{s.why}”</div>}
                      {s.rule && (
                        <div className="mt-1 flex items-start gap-1.5 text-[13px]">
                          <TypeChip type={guardrailType(s.rule)} /> {s.rule}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-muted">{s.time}</span>
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <div className="mb-2 text-[12px] font-bold uppercase tracking-[.12em] text-[#667085]">Debrief</div>
            <ol className="space-y-1.5 text-[14px] leading-snug">
              {tail.map((t, i) => (
                <li key={i}>
                  <b className={t.speaker === "agent" ? "text-indigo" : "text-[#0f766e]"}>{t.speaker === "agent" ? "Apprentice" : "You"}:</b> {t.text}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[12.5px] text-muted">{o.workflow.length} workflow steps · {o.qa.length} answers so far</p>
          </>
        )}
        {o.error && <p className="mt-3 border-l-4 border-warn bg-warn-soft px-3 py-2 text-[12.5px]">{o.error}</p>}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        {!o.sharing && o.phase === "task" ? (
          onStart && <button className={`${btnPrimary} flex-1`} onClick={onStart}>Share screen &amp; start</button>
        ) : o.phase === "task" ? (
          <>
            <button className={`${btnOutline} flex-1`} onClick={o.toggleOffRecord}>{o.offRecord ? "Back on the record" : "Off the record"}</button>
            <button className={`${btnPrimary} flex-1`} onClick={o.endTask}>End task</button>
          </>
        ) : (
          <button className={`${btnPrimary} flex-1`} onClick={o.buildWorkMap} disabled={o.phase === "building"}>
            {o.phase === "building" ? "Writing the Work Map…" : "Looks right → Build Work Map"}
          </button>
        )}
      </div>
    </div>
  );
}
