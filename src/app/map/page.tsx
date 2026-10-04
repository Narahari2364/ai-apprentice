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

  return (
    <div className="min-h-full bg-panel">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 p-5">
        <div className="flex items-center text-[13px] text-[#444]">
          <span>{raw ? "Learned in the last capture session" : "Prepared Work Map (no session captured yet)"} · personal data redacted</span>
          {raw && (
            <button
              className="ml-auto text-brand hover:underline"
              onClick={() => {
                localStorage.removeItem(KEY);
                location.reload();
              }}
            >
              Reset to sample
            </button>
          )}
        </div>

        {/* header bar */}
        <div className="flex flex-wrap items-center gap-4 bg-indigo px-5 py-3 text-white">
          <svg width="26" height="24" viewBox="0 0 18 16" aria-hidden="true">
            <path d="M1.5 1.5h15v10H6L1.5 15z" fill="#fff" />
            <path d="M5 5h8M5 8h5" stroke="#5146d9" strokeWidth="1.4" />
          </svg>
          <div className="min-w-0 leading-tight">
            <div className="text-[21px] font-medium">Work Map · Meal expense report</div>
            <div className="text-[13.5px] opacity-90">
              Learned from Paul Adler · {map.confirmed ? "confirmed in the teach-back" : "teach-back not confirmed yet"}
            </div>
          </div>
          <span className="rounded-sm border border-white/70 px-2 py-0.5 text-[12px] font-bold tracking-wide">
            {published ? "PUBLISHED" : "REVIEW MODE"}
          </span>
          <div className="ml-auto flex gap-2">
            <button className="h-10 rounded-sm bg-white px-4 text-[15px] text-indigo hover:bg-indigo-soft" onClick={() => setExporting(true)}>
              Export for AI agents ↓
            </button>
            {published ? (
              <Link href="/teach" className="flex h-10 items-center rounded-sm bg-white px-4 text-[15px] text-indigo hover:bg-indigo-soft">
                Open Teaching mode →
              </Link>
            ) : (
              <button className="h-10 rounded-sm bg-white px-4 text-[15px] font-medium text-indigo hover:bg-indigo-soft" onClick={publish}>
                Publish to tutor
              </button>
            )}
          </div>
        </div>
        {raw && !published && (
          <p className="text-[13.5px] text-[#444]">Review mode: nobody else sees this until Paul publishes it to the tutor.</p>
        )}

        {selected && <WorkMapView map={map} selected={selected} onSelect={(s) => setSelectedId(s.id)} onReplay={setReplay} />}
      </div>

      {exporting && <ExportDialog map={map} onClose={() => setExporting(false)} />}

      {replay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,28,38,.45)] p-6">
          <div className="flex h-[86vh] w-full max-w-6xl flex-col bg-white shadow-[0_10px_40px_rgba(0,0,0,.3)]">
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
