"use client";
// Work Map: clickable step cards. Selecting a step opens its document inside
// Ledgerline (open_document command) next to the map.

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import WorkMapView from "@/features/workmap/WorkMapView";
import LedgerlineFrame from "@/features/erp/LedgerlineFrame";
import { downloadText, toAgentMarkdown } from "@/features/workmap/exportAgent";
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
  const [justPublished, setJustPublished] = useState(false);
  const published = !raw || map.published || justPublished; // the prepared sample counts as published

  function publish() {
    localStorage.setItem(KEY, JSON.stringify({ ...map, published: true }));
    setJustPublished(true);
  }
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
            <span className="ml-3 text-muted">· personal data redacted</span>
            <button
              className="btn ml-auto h-8 text-[13px]"
              onClick={() => downloadText("work-map-agent.md", toAgentMarkdown(map))}
              title="Instructions an AI agent can load: same steps, stops where Paul would"
            >
              Export for agents
            </button>
            <button
              className="btn ml-2 h-8 text-[13px]"
              onClick={() => downloadText("work-map.json", JSON.stringify({ ...map, steps: map.steps.map((s) => ({ ...s, screenshot: undefined })) }, null, 2), "application/json")}
            >
              JSON
            </button>
            {raw && (
              <button
                className="ml-4 text-brand hover:underline"
                onClick={() => {
                  localStorage.removeItem(KEY);
                  location.reload();
                }}
              >
                Reset to sample
              </button>
            )}
          </div>
          {raw && !published ? (
            <div className="flex items-center gap-4 border-l-[5px] border-indigo bg-white px-4 py-3 shadow-sm">
              <div className="flex-1 text-[14.5px]">
                <b>Review mode.</b> Check what the Apprentice learned from Paul. Nobody else sees it until he approves.
              </div>
              <button className="h-10 rounded-sm bg-indigo px-4 text-[15px] text-white hover:bg-indigo-dark" onClick={publish}>
                Approve &amp; publish
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l-[5px] border-ok bg-white px-4 py-3 shadow-sm">
              <div className="flex-1 text-[14.5px]">
                <b>{raw ? "Published." : "Prepared Work Map."}</b> Teaching mode coaches new hires with this map.
              </div>
              <Link href="/teach" className="flex h-10 items-center rounded-sm bg-brand px-4 text-[15px] text-white hover:bg-brand-dark">
                Open Teaching mode →
              </Link>
            </div>
          )}
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
              query="user=paul"
              mode="view"
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
