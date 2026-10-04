"use client";
// The floating tutor in Teaching mode: Paul's steps as a checklist (✓ like Paul, ⚑ under
// review, upcoming), the latest gentle guidance, and Start / Stop.

import Link from "next/link";
import { ListeningBars } from "@/features/apprentice/Popup";
import { BotFace } from "./Launcher";
import type { WorkMap } from "@/lib/types";
import type { Coach, CoachStatus } from "./useCoach";

const STATUS: Record<CoachStatus, string> = {
  idle: "Not recording",
  connecting: "Connecting…",
  watching: "Watching · guides when you pause",
  reading: "Looking at your screen…",
  speaking: "Speaking…",
  done: "Practice finished",
};

const btnPrimary = "h-9 rounded-sm bg-indigo px-3 text-[14px] text-white hover:bg-indigo-dark disabled:opacity-50";

export default function CoachPanel({ c, map, blocked }: { c: Coach; map: WorkMap; blocked?: boolean }) {
  return (
    <div className="flex h-full flex-col bg-white text-ink">
      <div className="flex items-center gap-3 bg-indigo px-4 py-3 text-white">
        <BotFace size={34} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[17px] font-medium">Apprentice</div>
          <div className="truncate text-[12.5px] opacity-90">Guiding Maya with Paul&apos;s approved steps</div>
        </div>
        <span className="rounded-sm border border-white/70 px-2 py-0.5 text-[11px] font-bold tracking-wide">TEACHING MODE</span>
      </div>

      <div className="flex items-center gap-2 border-b border-line bg-panel-2 px-4 py-2 text-[13px] text-indigo">
        {c.status === "watching" && <ListeningBars active />}
        {c.status === "reading" && <span className="h-2 w-2 animate-pulse rounded-full bg-indigo" />}
        <span className="flex-1 truncate">{STATUS[c.status]}</span>
        {c.sharing && <span className="text-[12px] text-err">● REC</span>}
      </div>

      {c.message && (
        <div className={`border-b px-4 py-3 ${c.message.verdict === "match" ? "border-[#bfe3cc] bg-ok-soft" : "border-[#F0D58A] bg-warn-soft"}`}>
          <div className="text-[12px] font-medium text-[#555]">{c.message.verdict === "match" ? "✓ Looks right" : "⚑ Might be different · under review"} · {c.message.time}</div>
          <p className="mt-0.5 text-[15.5px] leading-snug">{c.message.text}</p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-2 text-[12px] font-bold uppercase tracking-[.12em] text-[#667085]">Paul&apos;s steps</div>
        <ol className="space-y-2">
          {map.steps.map((s, i) => {
            const isDone = c.done.includes(s.id);
            const isFlagged = c.flagged.includes(s.id);
            return (
              <li key={s.id} className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${isFlagged ? "border-[#F0D58A] bg-warn-soft/60" : isDone ? "border-[#bfe3cc] bg-ok-soft/60" : "border-line"}`}>
                <span className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] font-bold text-white ${isFlagged ? "bg-warn" : isDone ? "bg-ok" : "bg-[#c7ccd1]"}`}>
                  {isFlagged ? "⚑" : isDone ? "✓" : i + 1}
                </span>
                <div className="min-w-0 flex-1 text-[14px] leading-snug">
                  {s.correction || s.title}
                  {isFlagged && <div className="text-[12px] text-[#7a5a00]">Under review by your supervisor</div>}
                </div>
              </li>
            );
          })}
        </ol>
        {c.finished && (
          <div className="mt-4 rounded-md border border-line p-3 text-[14px]">
            <b>Practice finished.</b> {c.done.length} step(s) just like Paul · {c.reviews.length} sent to your supervisor for review.
            {c.reviews.length > 0 && (
              <div className="mt-2">
                <Link href="/review" target="_blank" className="text-brand hover:underline">Open the supervisor review ↗</Link>
              </div>
            )}
          </div>
        )}
        {c.error && <p className="mt-3 border-l-4 border-warn bg-warn-soft px-3 py-2 text-[12.5px]">{c.error}</p>}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        {blocked ? (
          <Link href="/map" className={`${btnPrimary} flex flex-1 items-center justify-center`}>Mapping is on hold → approve it first</Link>
        ) : !c.sharing ? (
          <button className={`${btnPrimary} flex-1`} onClick={c.start}>{c.finished ? "● Practise again" : "● Start recording"}</button>
        ) : (
          <button className={`${btnPrimary} flex-1`} onClick={c.stop}>Stop recording</button>
        )}
      </div>
    </div>
  );
}
