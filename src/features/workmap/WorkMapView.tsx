"use client";
// Work Map, following the Review-mode design: counts, a clickable timeline (◆ judgment
// call, ● routine step), the selected step (screen moment, decision, reason in Paul's
// words, typed guardrails), and a column with all guardrails and open questions.

import type { WorkMap, WorkMapStep } from "@/lib/types";

export type GuardrailType = "LIMIT" | "RULE" | "EXCEPTION" | "STOP";

/** Classify a guardrail sentence so the map shows more than the happy path. */
export function guardrailType(text: string): GuardrailType {
  if (/\bonly\b|except|don't need|not needed|restaurant/i.test(text)) return "EXCEPTION";
  if (/\bstop\b|don't submit|do not submit|before submitting/i.test(text)) return "STOP";
  if (/\bover\b|\bunder\b|limit|\d/i.test(text)) return "LIMIT";
  return "RULE";
}

const TYPE_STYLE: Record<GuardrailType, string> = {
  LIMIT: "border-[#E2A100] bg-warn-soft text-[#7a5a00]",
  RULE: "border-brand bg-brand-soft text-brand",
  EXCEPTION: "border-indigo bg-indigo-soft text-indigo",
  STOP: "border-err bg-err-soft text-err",
};

export function TypeChip({ type }: { type: GuardrailType }) {
  return <span className={`inline-block rounded-sm border px-1.5 py-px text-[11px] font-bold tracking-wide ${TYPE_STYLE[type]}`}>{type}</span>;
}

const shortLabel = (s: WorkMapStep) => s.short || s.title.split(/\s+/).slice(0, 4).join(" ");

interface Props {
  map: WorkMap;
  selected: WorkMapStep;
  onSelect: (step: WorkMapStep) => void;
  onReplay: (step: WorkMapStep) => void;
}

export default function WorkMapView({ map, selected, onSelect, onReplay }: Props) {
  const judgmentCalls = map.steps.filter((s) => s.decision).length;
  const allGuardrails = map.steps.flatMap((s) => s.guardrails.map((g) => ({ g, step: s, type: guardrailType(g) })));

  return (
    <div className="border border-line bg-white">
      {/* counts + legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line px-5 py-2.5 text-[15px]">
        <span><b className="font-medium">{map.steps.length}</b> steps</span>
        <span><b className="font-medium">{judgmentCalls}</b> judgment calls ◆</span>
        <span><b className="font-medium">{allGuardrails.length}</b> guardrails</span>
        <span className="ml-auto text-[13px] text-[#444]">● routine step &nbsp; ◆ judgment call</span>
      </div>

      {/* timeline */}
      <div className="overflow-x-auto border-b border-line px-5 pb-4 pt-6">
        <ol className="relative flex min-w-max justify-between gap-6">
          <span className="absolute left-6 right-6 top-[11px] h-[2px] bg-[#d5d9de]" aria-hidden="true" />
          {map.steps.map((s) => {
            const on = s.id === selected.id;
            return (
              <li key={s.id} className="relative flex w-36 flex-col items-center text-center">
                <button onClick={() => onSelect(s)} className="flex flex-col items-center gap-1.5" aria-current={on ? "step" : undefined}>
                  {s.decision ? (
                    <span className={`h-[18px] w-[18px] rotate-45 ${on ? "bg-indigo ring-4 ring-indigo/25" : "bg-indigo"}`} />
                  ) : (
                    <span className={`h-[22px] w-[22px] rounded-full border-[3px] bg-white ${on ? "border-indigo ring-4 ring-indigo/25" : "border-brand"}`} />
                  )}
                  <span className={`text-[14px] leading-tight ${on ? "font-medium text-indigo" : ""}`}>
                    {s.order} · {shortLabel(s)}
                  </span>
                  <span className="font-mono text-[12px] text-muted">{s.time}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* selected step */}
        <section className="min-w-0 p-5">
          <div className="text-[13px] font-bold uppercase tracking-wide text-[#444]">
            Step {selected.order} of {map.steps.length}
            {selected.decision ? " · judgment call ◆" : " · routine step"}
          </div>
          <h2 className="mt-1 text-[24px] leading-tight">{selected.title}</h2>

          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-[#444]">Screen moment · {selected.time}</div>
              <div className="border border-line">
                {selected.screenshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.screenshot} alt={`Paul's screen at ${selected.time}`} className="w-full" />
                ) : (
                  <div className="bg-brand px-3 py-1.5 text-[13px] text-white">Meals / Drinks · {selected.time}</div>
                )}
                <div className="flex justify-end bg-panel-2 p-2">
                  <button
                    onClick={() => onReplay(selected)}
                    disabled={!selected.docId && !selected.screenshot}
                    className="h-9 rounded-sm bg-indigo px-3 text-[14px] text-white hover:bg-indigo-dark disabled:opacity-40"
                  >
                    ▶ Replay {selected.time}
                  </button>
                </div>
              </div>
            </div>
            <div>
              {selected.decision && (
                <>
                  <div className="mb-1 text-[13px] font-bold uppercase tracking-wide text-[#444]">Decision</div>
                  <p className="mb-4 text-[16px] leading-snug">{selected.decision}</p>
                </>
              )}
              <div className="mb-1 text-[13px] font-bold uppercase tracking-wide text-[#444]">Reason, in Paul&apos;s words</div>
              <blockquote className="border-l-[3px] border-indigo pl-3 text-[16px] leading-snug">“{selected.expertQuote}”</blockquote>
              <p className="mt-1 text-[13px] text-muted">Paul · {selected.time}</p>
            </div>
          </div>

          {selected.guardrails.length > 0 && (
            <div className="mt-5">
              <div className="mb-1.5 text-[13px] font-bold uppercase tracking-wide text-[#444]">Guardrails on this step</div>
              <ul className="space-y-1.5">
                {selected.guardrails.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-[15.5px]">
                    <TypeChip type={guardrailType(g)} /> {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {map.confirmed && <p className="mt-4 text-[14px] text-ok">✓ Confirmed by Paul in the teach-back</p>}
        </section>

        {/* all guardrails + open questions */}
        <aside className="border-line bg-panel-2 p-5 lg:border-l">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#444]">All guardrails</div>
          <ul className="space-y-2">
            {allGuardrails.map(({ g, step, type }) => (
              <li key={g}>
                <button
                  onClick={() => onSelect(step)}
                  className={`w-full border bg-white px-3 py-2 text-left text-[14.5px] leading-snug hover:border-indigo ${step.id === selected.id ? "border-indigo" : "border-line"}`}
                >
                  <TypeChip type={type} /> {g}
                  <span className="mt-0.5 block text-[12.5px] text-muted">Step {step.order} · ▶ replay</span>
                </button>
              </li>
            ))}
          </ul>
          {(map.offRecord ?? []).length > 0 && (
            <>
              <div className="mb-1.5 mt-5 text-[13px] font-bold uppercase tracking-wide text-[#444]">Off the record</div>
              {(map.offRecord ?? []).map((r) => (
                <p key={r.from} className="border border-dashed border-[#b9bdc4] bg-white px-3 py-1.5 text-[13.5px] text-[#555]">
                  <span className="font-mono">{r.from}–{r.to}</span> · nothing saved, no questions asked
                </p>
              ))}
            </>
          )}
          <div className="mb-1 mt-5 text-[13px] font-bold uppercase tracking-wide text-[#444]">Open questions</div>
          {map.gaps.length ? (
            <ul className="list-disc space-y-0.5 pl-5 text-[14.5px]">{map.gaps.map((q) => <li key={q}>{q}</li>)}</ul>
          ) : (
            <p className="text-[14.5px] text-ok">None · all answered in the debrief</p>
          )}
        </aside>
      </div>
    </div>
  );
}
