"use client";
// Work Map: clickable step cards. Selecting a step opens its document inside
// Ledgerline (open_document command) next to the map.

import { useRef, useState, useSyncExternalStore } from "react";
import WorkMapView from "@/features/workmap/WorkMapView";
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
  const [selected, setSelected] = useState<WorkMapStep | null>(null);
  const ready = useRef(false);

  function select(step: WorkMapStep) {
    const next = selected?.id === step.id ? null : step;
    if (!next?.docId) ready.current = false; // the Ledgerline pane closes
    setSelected(next);
    if (!next) return;
    if (step.docId && ready.current) sendCommand({ cmd: "open_document", doc_id: step.docId });
  }

  return (
    <div className={`grid h-full ${selected?.docId ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-1"}`}>
      <div className="min-h-0 overflow-y-auto bg-panel">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 p-6">
          <div className="flex items-center text-[13px] text-[#444]">
            <span>{raw ? "Work Map from the last capture session" : "Sample Work Map (no session captured yet)"}</span>
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
          <WorkMapView map={map} selectedId={selected?.id ?? null} onSelect={select} />
        </div>
      </div>
      {selected?.docId && (
        <div className="flex min-h-0 flex-col border-l border-line">
          <div className="flex h-10 flex-none items-center gap-2 border-b border-line bg-panel-2 px-4 text-[13px]">
            <b>Step {selected.order}</b> · document in Ledgerline
            <button className="ml-auto text-brand hover:underline" onClick={() => {
                ready.current = false;
                setSelected(null);
              }}>Close</button>
          </div>
          <div className="min-h-0 flex-1">
            <LedgerlineFrame
              query="user=sabine"
              onReady={() => {
                ready.current = true;
                if (selected.docId) sendCommand({ cmd: "open_document", doc_id: selected.docId });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
