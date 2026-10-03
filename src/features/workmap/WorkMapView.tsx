"use client";
// Clickable Work Map: one card per step (time, decision, reason, quote, guardrails).

import type { WorkMap, WorkMapStep } from "@/lib/types";

interface Props {
  map: WorkMap;
  selectedId: string | null;
  onSelect: (step: WorkMapStep) => void;
}

export default function WorkMapView({ map, selectedId, onSelect }: Props) {
  const judgmentCalls = map.steps.filter((s) => s.decision).length;
  const guardrails = map.steps.reduce((n, s) => n + s.guardrails.length, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="card-bar">Work Map</div>
        <div className="card-body flex flex-wrap items-end gap-x-10 gap-y-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[23px] font-normal leading-tight">{map.task}</h1>
            <p className="mt-1 text-[14px] text-[#444]">
              {map.confirmed ? "Confirmed by Sabine after the teach-back" : "Awaiting Sabine's confirmation of the teach-back"}
            </p>
          </div>
          <Stat n={map.steps.length} label="Steps" />
          <Stat n={judgmentCalls} label="Judgment calls" />
          <Stat n={guardrails} label="Guardrails" tone="text-err" />
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {map.steps.map((step) => {
          const open = step.id === selectedId;
          return (
            <li key={step.id}>
              <button
                onClick={() => onSelect(step)}
                className={`w-full rounded-sm border bg-white text-left transition hover:border-brand ${open ? "border-brand shadow-[0_0_0_1px_#2F74D0]" : "border-line"}`}
              >
                <div className={`flex items-center gap-4 px-4 py-3 ${open ? "bg-brand-soft" : ""}`}>
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand text-[14px] font-bold text-white">{step.order}</span>
                  <span className="flex-1 text-[17px]">{step.title}</span>
                  {step.decision && <span className="pill bg-warn-soft text-[#7a5a00]">Judgment call</span>}
                  {step.guardrails.length > 0 && <span className="pill bg-err-soft text-err">{step.guardrails.length} guardrail{step.guardrails.length > 1 ? "s" : ""}</span>}
                  <span className="font-mono text-[13px] text-muted">{step.time}</span>
                </div>
                {open && (
                  <div className="border-t border-line">
                    <Row label="Screen moment">
                      {step.time}
                      {step.docId ? <span className="text-brand"> · opened in Ledgerline →</span> : <span className="text-muted"> · no document for this step</span>}
                    </Row>
                    {step.decision && <Row label="Decision">{step.decision}</Row>}
                    <Row label="Reason">{step.reason}</Row>
                    <Row label="Sabine said">
                      <i>“{step.expertQuote}”</i>
                    </Row>
                    {step.guardrails.length > 0 && (
                      <Row label="Guardrails">
                        <ul className="space-y-1">
                          {step.guardrails.map((g) => (
                            <li key={g} className="border-l-[3px] border-err bg-err-soft px-2 py-1 text-[#8E1B1B]">{g}</li>
                          ))}
                        </ul>
                      </Row>
                    )}
                    {step.screenshot && (
                      <Row label="Screen">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={step.screenshot} alt={`Screen at ${step.time}`} className="max-h-72 rounded-sm border border-line" />
                      </Row>
                    )}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {map.gaps.length > 0 && (
        <div className="card">
          <div className="section-title rounded-t-sm border-t-0">Still unclear after the debrief</div>
          <ul className="list-disc px-8 py-3 text-[15px]">
            {map.gaps.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ n, label, tone = "text-ink" }: { n: number; label: string; tone?: string }) {
  return (
    <div className="text-center">
      <div className={`text-[36px] font-light leading-none ${tone}`}>{n}</div>
      <div className="text-[13px] text-[#444]">{label}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 border-b border-[#EDEFF2] px-4 py-2.5 text-[15px] last:border-b-0">
      <span className="text-[#444]">{label}</span>
      <div>{children}</div>
    </div>
  );
}
