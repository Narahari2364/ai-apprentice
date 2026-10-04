"use client";
// Look of the Apprentice popup in Learning / Review mode (design: docs/design/1-learning-mode).
// Pure UI: VoiceAgentPanel owns all state and logic and passes it in; /capture/preview renders it with mock data.

import type { ReactNode } from "react";
import Popup, { ListeningBars } from "./Popup";

export interface LearningPopupProps {
  expert: string;
  /** Debrief / building: the popup becomes Review mode. */
  review: boolean;
  /** Learning-mode task phase (Off the record + End task are offered). */
  taskPhase: boolean;
  connected: boolean;
  offRecord: boolean;
  /** Plain status under the question, e.g. "Listening…". */
  status: string;
  listening: boolean;
  /** The agent's latest line, shown as the question. */
  question?: { time: string; text: string };
  /** Shown before the first question. */
  idleText: string;
  autoFold: boolean;
  showBuild: boolean;
  buildError?: string | null;
  agentError?: string | null;
  /** Optional transcript / pause-detector panel, only rendered when given. */
  details?: ReactNode;
  onToggleOffRecord: () => void;
  onEndTask: () => void;
  onBuildMap: () => void;
  onLoadPreparedMap: () => void;
}

const btnOutline = "h-9 rounded-sm border border-indigo bg-white px-3 text-[14px] text-indigo hover:bg-indigo-soft disabled:opacity-50";
const btnPrimary = "h-9 rounded-sm bg-indigo px-3 text-[14px] text-white hover:bg-indigo-dark disabled:opacity-50";

export default function LearningPopup(p: LearningPopupProps) {
  const subtitle = p.offRecord ? `Paused by ${p.expert}` : p.review ? `Checking what it learned from ${p.expert}` : `Learning from ${p.expert}`;

  return (
    <Popup
      title="Apprentice"
      subtitle={subtitle}
      modeLabel={p.review ? "REVIEW MODE" : "LEARNING MODE"}
      initial={{ left: 24, bottom: 120 }}
      width={440}
      foldable
      autoFold={p.autoFold}
      foldedBar={
        // Folded while the expert works: no timer or counter, just that it is waiting, plus Off the record.
        <span className="flex items-center gap-2 text-[14px]">
          <span className="flex min-w-0 flex-1 items-center gap-2 text-indigo">
            {p.listening && <ListeningBars active />}
            <span className="truncate">Waits for a pause</span>
          </span>
          {p.taskPhase && (
            <button onClick={p.onToggleOffRecord} disabled={!p.connected} className={`${btnOutline} h-8 text-[13px]`}>
              Off the record
            </button>
          )}
        </span>
      }
    >
      {p.offRecord ? (
        <div className="px-5 py-6 text-center">
          <div className="text-[12px] font-bold tracking-[.12em] text-[#666]">OFF THE RECORD</div>
          <div className="my-1.5 text-[21px]">Nothing is being saved</div>
          <p className="text-[14px] leading-relaxed text-[#555]">No screen, no voice, no questions. The Work Map will show a gap here.</p>
        </div>
      ) : (
        <div className="px-5 pb-3 pt-3.5">
          {p.question ? (
            <div>
              <div className="text-[13px] text-[#444]">
                <b className="text-ink">Apprentice</b> <span className="ml-1 text-muted">{p.question.time}</span>
              </div>
              <p className="mt-1 text-[17px] leading-snug">{p.question.text}</p>
            </div>
          ) : (
            <p className="text-[14.5px] text-[#444]">{p.idleText}</p>
          )}
        </div>
      )}

      {p.buildError && (
        <div className="mx-5 mb-3 border-l-4 border-warn bg-warn-soft px-3 py-2 text-[13px]">
          <b>Couldn&apos;t build the Work Map.</b> {p.buildError}
          <div className="mt-2 flex gap-2">
            <button className={`${btnOutline} h-8 text-[13px]`} onClick={p.onBuildMap}>Try again</button>
            <button className={`${btnPrimary} h-8 text-[13px]`} onClick={p.onLoadPreparedMap}>Use prepared Work Map</button>
          </div>
        </div>
      )}
      {p.agentError && <p className="mx-5 mb-3 border-l-4 border-err bg-err-soft px-3 py-1.5 text-[13px] text-[#8E1B1B]">{p.agentError}</p>}

      <div className="flex items-center gap-2 border-t border-line px-5 py-3">
        {p.offRecord ? (
          <>
            <span className="flex-1 text-[13px] text-[#666]">or say “back on the record”</span>
            <button onClick={p.onToggleOffRecord} className={btnPrimary}>Back on the record</button>
          </>
        ) : (
          <>
            <span className="flex min-w-0 flex-1 items-center gap-2 text-[14px] text-indigo">
              {p.listening && <ListeningBars active />}
              <span className="truncate">{p.status}</span>
            </span>
            {p.taskPhase && (
              <>
                <button onClick={p.onToggleOffRecord} disabled={!p.connected} className={btnOutline}>Off the record</button>
                <button onClick={p.onEndTask} disabled={!p.connected} className={btnPrimary}>End task</button>
              </>
            )}
            {p.showBuild && <button onClick={p.onBuildMap} className={btnPrimary}>Build Work Map</button>}
          </>
        )}
      </div>
      {p.details}
    </Popup>
  );
}
