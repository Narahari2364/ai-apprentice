"use client";
// Work Map (Review mode → Publish to tutor), following the Review-mode design.
// Replay opens the step's document inside Ledgerline (open_document command).

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import WorkMapView from "@/features/workmap/WorkMapView";
import ExportDialog from "@/features/workmap/ExportDialog";
import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import { sendCommand } from "@/lib/ledgerline";
import type { WorkMap, WorkMapStep } from "@/lib/types";

const KEY = "apprentice.workmap";
const readRaw = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export default function MapPage() {
  const raw = useSyncExternalStore(() => () => {}, readRaw, () => null);
  const map: WorkMap = raw ? JSON.parse(raw) : sampleWorkMap;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replay, setReplay] = useState<WorkMapStep | null>(null);
  const [exporting, setExporting] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const published = !raw || map.published || justPublished; // the prepared sample counts as published
  const selected = map.steps.find((s) => s.id === selectedId) ?? map.steps.find((s) => s.decision) ?? map.steps[0];

  function publish() {
    localStorage.setItem(KEY, JSON.stringify({ ...map, published: true }));
    setJustPublished(true);
  }

  const judgmentCalls = map.steps.filter((s) => s.decision).length;
  const guardrailCount = map.steps.reduce((n, s) => n + s.guardrails.length, 0);
  const tiles: [number, string, string][] = [
    [map.steps.length, "Steps", "text-[#1f2d3d]"],
    [judgmentCalls, "Judgment calls", "text-indigo"],
    [guardrailCount, "Guardrails", "text-err"],
    [map.gaps.length, "Open questions", "text-[#7a5a00]"],
  ];

  return (
    <div className="min-h-full bg-[#f6f8fc]">
      {/* hero band, same language as the home page */}
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#f3f2ff_0%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-indigo/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-10 h-[300px] w-[300px] rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-8">
          <div className="rise flex flex-wrap items-start gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-indigo/30 bg-indigo-soft px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-indigo">
                  Module 2 · Review mode
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-medium ${published ? "bg-ok-soft text-ok" : "bg-warn-soft text-[#7a5a00]"}`}>
                  {published ? "● Published to the tutor" : "● Waiting for Paul's approval"}
                </span>
              </div>
              <h1 className="mt-4 text-[38px] font-light leading-[1.1] tracking-tight text-[#1f2d3d] md:text-[44px]">
                What Paul taught <span className="font-medium text-indigo">the Apprentice</span>
              </h1>
              <p className="mt-2 max-w-2xl text-[16.5px] text-[#475467]">
                {map.task}. {map.confirmed ? "Confirmed by Paul in the teach-back." : "Teach-back not confirmed yet."}{" "}
                <span className="text-[#98a2b3]">{raw ? "Learned in the last capture session" : "Prepared Work Map"} · personal data redacted</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                className="inline-flex h-11 items-center gap-2 rounded-sm border border-indigo bg-white px-4 text-[15px] text-indigo transition hover:bg-indigo-soft"
                onClick={() => setExporting(true)}
              >
                Export for AI agents ↓
              </button>
              {published ? (
                <Link href="/teach" className="inline-flex h-11 items-center rounded-sm bg-indigo px-5 text-[15px] text-white shadow-sm transition hover:bg-indigo-dark">
                  Open Teaching mode →
                </Link>
              ) : (
                <button className="inline-flex h-11 items-center rounded-sm bg-indigo px-5 text-[15px] text-white shadow-sm transition hover:bg-indigo-dark" onClick={publish}>
                  Publish to tutor
                </button>
              )}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map(([n, label, tone], i) => (
              <div key={label} className="rise rounded-md border border-line bg-white/80 px-5 py-4 backdrop-blur" style={{ animationDelay: `${80 + i * 60}ms` }}>
                <div className={`text-[34px] font-light leading-none ${tone}`}>{n}</div>
                <div className="mt-1.5 text-[13.5px] text-[#475467]">{label}</div>
              </div>
            ))}
          </div>
          {raw && (
            <button
              className="mt-4 text-[13px] text-brand hover:underline"
              onClick={() => {
                localStorage.removeItem(KEY);
                location.reload();
              }}
            >
              Reset to the prepared sample
            </button>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {selected && <WorkMapView map={map} selected={selected} onSelect={(s) => setSelectedId(s.id)} onReplay={setReplay} />}
      </div>

      {exporting && <ExportDialog map={map} onClose={() => setExporting(false)} />}

      {replay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,28,38,.45)] p-6">
          <div className="rise flex h-[86vh] w-full max-w-6xl flex-col bg-white shadow-[0_10px_40px_rgba(0,0,0,.3)]">
            <div className="flex items-center gap-3 bg-indigo px-5 py-2.5 text-white">
              <span className="text-[17px] font-medium">Paul&apos;s screen moment · step {replay.order} · {replay.time}</span>
              <button className="ml-auto px-1 text-[24px] leading-none" aria-label="Close" onClick={() => setReplay(null)}>×</button>
            </div>
            <div className="min-h-0 flex-1">
              {replay.docId ? (
                <LedgerlineFrame
                  query="user=paul"
                  mode="view"
                  onReady={() => replay.docId && sendCommand({ cmd: "open_document", doc_id: replay.docId })}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={replay.screenshot} alt={`Paul's screen at ${replay.time}`} className="h-full w-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
