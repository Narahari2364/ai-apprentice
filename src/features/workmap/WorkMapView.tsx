"use client";
// Owner: CS 2. Clickable Work Map.
// TODO(CS 2): timeline layout, show screenshot per step, highlight judgment
//   calls vs routine steps, link each guardrail to its screen moment.
// TODO(CS 2): load the generated map from localStorage, fall back to sample.

import { useState } from "react";
import type { WorkMap } from "@/lib/types";

export default function WorkMapView({ map }: { map: WorkMap }) {
  const [openId, setOpenId] = useState<string | null>(map.steps[0]?.id ?? null);
  const judgmentCalls = map.steps.filter((s) => s.decision).length;
  const guardrails = map.steps.reduce((n, s) => n + s.guardrails.length, 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">{map.task}</h1>
        <p className="text-slate-600">
          {map.steps.length} steps · {judgmentCalls} judgment calls · {guardrails} guardrails ·{" "}
          {map.confirmed ? "✅ confirmed by expert" : "⏳ awaiting teach-back"}
        </p>
      </div>
      <ol className="flex flex-col gap-3">
        {map.steps.map((step) => {
          const open = step.id === openId;
          return (
            <li key={step.id}>
              <button
                onClick={() => setOpenId(open ? null : step.id)}
                className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-sky-400 ${
                  step.decision ? "border-amber-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {step.order}
                  </span>
                  <span className="flex-1 text-lg font-semibold">{step.title}</span>
                  {step.decision && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      judgment call
                    </span>
                  )}
                  <span className="font-mono text-sm text-slate-500">{step.time}</span>
                </div>
                {open && (
                  <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-base">
                    {step.decision && (
                      <>
                        <dt className="font-medium text-slate-500">Decision</dt>
                        <dd>{step.decision}</dd>
                      </>
                    )}
                    <dt className="font-medium text-slate-500">Reason</dt>
                    <dd>{step.reason}</dd>
                    <dt className="font-medium text-slate-500">Expert said</dt>
                    <dd className="italic">“{step.expertQuote}”</dd>
                    {step.guardrails.length > 0 && (
                      <>
                        <dt className="font-medium text-slate-500">Guardrails</dt>
                        <dd>
                          <ul className="list-disc pl-5 text-red-700">
                            {step.guardrails.map((g) => (
                              <li key={g}>{g}</li>
                            ))}
                          </ul>
                        </dd>
                      </>
                    )}
                  </dl>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      {map.gaps.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Open questions for the debrief</h2>
          <ul className="mt-2 list-disc pl-5 text-slate-700">
            {map.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
