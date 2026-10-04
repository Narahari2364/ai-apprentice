"use client";
// Module 2 · Mapping: everything the AI observed during Capture, step by step, with the
// screenshot it kept. The expert marks each observation correct or wrong (and says what
// really happened). The mapping stays ON HOLD until the expert approves it; then the AI is
// trained and Teaching uses it.

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ExportDialog from "@/features/workmap/ExportDialog";
import { TypeChip, guardrailType } from "@/features/workmap/WorkMapView";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import type { WorkMap, WorkMapStep } from "@/lib/types";

const KEY = "apprentice.workmap";
const readRaw = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export default function MappingPage() {
  const raw = useSyncExternalStore(() => () => {}, readRaw, () => null);
  const stored: WorkMap = raw ? JSON.parse(raw) : { ...sampleWorkMap, published: true };
  const [map, setMap] = useState<WorkMap | null>(null);
  const current = map ?? stored;
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState<WorkMapStep | null>(null);

  const approved = !!current.published;
  const checked = current.steps.filter((s) => s.review).length;
  const wrong = current.steps.filter((s) => s.review === "wrong").length;
  const allChecked = checked === current.steps.length && current.steps.length > 0;

  function update(next: WorkMap) {
    setMap(next);
    if (raw) localStorage.setItem(KEY, JSON.stringify(next));
  }
  function review(id: string, value: "ok" | "wrong") {
    update({ ...current, published: false, steps: current.steps.map((s) => (s.id === id ? { ...s, review: value } : s)) });
  }
  function correct(id: string, text: string) {
    update({ ...current, steps: current.steps.map((s) => (s.id === id ? { ...s, correction: text } : s)) });
  }
  function approve() {
    update({ ...current, published: true, confirmed: true });
  }

  const tiles: [number, string, string][] = [
    [current.steps.length, "Steps observed", "text-[#1f2d3d]"],
    [checked, "Checked by Paul", "text-ok"],
    [wrong, "Marked wrong", "text-err"],
    [current.steps.length - checked, "Still to check", "text-[#7a5a00]"],
  ];

  return (
    <div className="min-h-full bg-[#f6f8fc]">
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#f3f2ff_0%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-indigo/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-6">
          <Link href="/capture" className="mb-4 inline-block text-[13.5px] text-[#667085] hover:text-indigo">← Back to Capture</Link>
          <div className="rise flex flex-wrap items-start gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-indigo/30 bg-indigo-soft px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-indigo">Module 2 · Mapping</span>
                <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-medium ${approved ? "bg-ok-soft text-ok" : "bg-warn-soft text-[#7a5a00]"}`}>
                  {approved ? "● Approved · AI trained, all set" : "● On hold · waiting for Paul's approval"}
                </span>
              </div>
              <h1 className="mt-4 text-[38px] font-light leading-[1.1] tracking-tight text-[#1f2d3d] md:text-[44px]">
                Check what the AI <span className="font-medium text-indigo">observed</span>
              </h1>
              <p className="mt-2 max-w-2xl text-[16.5px] leading-relaxed text-[#475467]">
                Step by step, everything the Apprentice saw while Paul worked, with the screenshot it kept. Mark each step correct, or tell
                it what really happened. Nothing is taught to new hires until Paul approves.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button className="inline-flex h-11 items-center rounded-sm border border-indigo bg-white px-4 text-[15px] text-indigo hover:bg-indigo-soft" onClick={() => setExporting(true)}>
                Export for AI agents ↓
              </button>
              {approved ? (
                <Link href="/teach" className="inline-flex h-11 items-center rounded-sm bg-indigo px-5 text-[15px] text-white shadow-sm hover:bg-indigo-dark">
                  Go to Teaching →
                </Link>
              ) : (
                <button
                  className="inline-flex h-11 items-center rounded-sm bg-indigo px-5 text-[15px] text-white shadow-sm hover:bg-indigo-dark disabled:opacity-40"
                  onClick={approve}
                  disabled={!allChecked}
                  title={allChecked ? "" : "Check every step first"}
                >
                  ✓ Approve mapping
                </button>
              )}
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map(([n, label, tone]) => (
              <div key={label} className="rounded-md border border-line bg-white/80 px-5 py-4">
                <div className={`text-[34px] font-light leading-none ${tone}`}>{n}</div>
                <div className="mt-1.5 text-[13.5px] text-[#475467]">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-[#667085]">
            {raw ? "Recorded in the last Capture session · personal data redacted · " : "No recording yet: showing the prepared example (already approved) · "}
            {raw ? (
              <button className="text-brand hover:underline" onClick={() => { localStorage.removeItem(KEY); location.reload(); }}>
                discard and use the prepared example
              </button>
            ) : (
              <Link href="/capture" className="text-brand hover:underline">record one in Capture</Link>
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {!approved && !allChecked && (
          <p className="mb-4 rounded-md border border-[#F0D58A] bg-warn-soft px-4 py-2.5 text-[14px] text-[#7a5a00]">
            On hold: check each step below, then approve the mapping. The AI is trained only after that.
          </p>
        )}
        {approved && (
          <p className="mb-4 rounded-md border border-[#bfe3cc] bg-ok-soft px-4 py-2.5 text-[14px] text-ok">
            Approved. The AI is trained on Paul&apos;s way of working and will guide new hires in Teaching.
          </p>
        )}

        <ol className="flex flex-col gap-4">
          {current.steps.map((s) => (
            <li key={s.id} className="rise overflow-hidden rounded-md border border-line bg-white shadow-[0_1px_2px_rgba(16,24,40,.04),0_8px_24px_rgba(16,24,40,.05)]">
              <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
                <button className="relative block bg-[#eef2f6] md:border-r md:border-line" onClick={() => s.screenshot && setZoom(s)} disabled={!s.screenshot}>
                  {s.screenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.screenshot} alt={`Screen at ${s.time}`} className="h-full max-h-56 w-full object-cover object-top" />
                  ) : (
                    <div className="grid h-full min-h-32 place-items-center bg-[linear-gradient(135deg,#2F74D0,#5146d9)] p-4 text-center text-[13px] text-white">
                      Screen at {s.time}
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-sm bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-white">{s.time}</span>
                </button>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-brand text-[13px] font-bold text-white">{s.order}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[18px] leading-snug text-[#1f2d3d]">{s.title}</div>
                      {s.decision && <div className="mt-0.5 text-[14px] text-[#667085]">AI saw: {s.decision}</div>}
                    </div>
                  </div>
                  {s.expertQuote && (
                    <div className="mt-3 rounded-md bg-indigo-soft/60 px-3 py-2 text-[14.5px]">
                      <b className="text-indigo">Why (Paul):</b> “{s.expertQuote}”
                    </div>
                  )}
                  {s.guardrails.map((g) => (
                    <div key={g} className="mt-2 flex items-start gap-2 text-[14px]"><TypeChip type={guardrailType(g)} /> {g}</div>
                  ))}

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                    <span className="mr-1 text-[13px] text-[#667085]">Is this observation right?</span>
                    <button
                      onClick={() => review(s.id, "ok")}
                      className={`h-9 rounded-sm border px-3 text-[14px] ${s.review === "ok" ? "border-ok bg-ok text-white" : "border-ok bg-white text-ok hover:bg-ok-soft"}`}
                    >
                      ✓ Correct
                    </button>
                    <button
                      onClick={() => review(s.id, "wrong")}
                      className={`h-9 rounded-sm border px-3 text-[14px] ${s.review === "wrong" ? "border-err bg-err text-white" : "border-err bg-white text-err hover:bg-err-soft"}`}
                    >
                      ✗ Wrong
                    </button>
                  </div>
                  {s.review === "wrong" && (
                    <textarea
                      value={s.correction ?? ""}
                      onChange={(e) => correct(s.id, e.target.value)}
                      placeholder="What really happened here? The AI will learn your version."
                      className="mt-2 h-20 w-full rounded-sm border border-[#9aa0a6] p-2 text-[14.5px] focus:border-indigo focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {(current.offRecord ?? []).map((r) => (
          <p key={r.from} className="mt-4 rounded-md border border-dashed border-[#b9bdc4] bg-white px-4 py-2.5 text-[14px] text-[#555]">
            <b>Off the record</b> {r.from}–{r.to}: Paul paused the recording here. Nothing was saved.
          </p>
        ))}

        {!approved && (
          <div className="mt-6 flex items-center justify-end gap-3">
            <span className="text-[14px] text-[#667085]">{allChecked ? "All steps checked." : `${current.steps.length - checked} step(s) left to check.`}</span>
            <button className="h-11 rounded-sm bg-indigo px-5 text-[15px] text-white hover:bg-indigo-dark disabled:opacity-40" onClick={approve} disabled={!allChecked}>
              ✓ Approve mapping
            </button>
          </div>
        )}
      </div>

      {exporting && <ExportDialog map={current} onClose={() => setExporting(false)} />}
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,28,38,.6)] p-6" onClick={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom.screenshot} alt={`Screen at ${zoom.time}`} className="rise max-h-full max-w-full rounded-sm shadow-2xl" />
        </div>
      )}
    </div>
  );
}
