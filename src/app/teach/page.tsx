"use client";
// Module 3 · Teaching: the new hire starts recording, the Apprentice pops up over their
// screen and guides them with the expert's APPROVED mapping. Steps that look like Paul's
// get a "that's right, next…"; anything that might differ is never called wrong: it goes
// under review for the supervisor (/review).

import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ConversationProvider } from "@elevenlabs/react";
import CoachPanel from "@/features/observe/CoachPanel";
import { useCoach } from "@/features/observe/useCoach";
import { pipSupported, usePip } from "@/features/observe/usePip";
import { sampleWorkMap } from "@/data/sampleWorkMap";
import type { WorkMap } from "@/lib/types";

const KEY = "apprentice.workmap";
const readRaw = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export default function TeachPage() {
  return (
    <ConversationProvider>
      <Teach />
    </ConversationProvider>
  );
}

function Teach() {
  const raw = useSyncExternalStore(() => () => {}, readRaw, () => null);
  const captured: WorkMap | null = raw ? JSON.parse(raw) : null;
  // Only an APPROVED mapping trains the tutor. With no recording yet, the prepared example is used.
  const onHold = !!captured && !captured.published;
  const map: WorkMap = captured?.published ? captured : sampleWorkMap;
  const c = useCoach(map);
  const pip = usePip();
  const canPip = useSyncExternalStore(() => () => {}, pipSupported, () => true);

  return (
    <div className="min-h-full bg-[#f6f8fc]">
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#f3f2ff_0%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-indigo/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="rise">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm border border-indigo/30 bg-indigo-soft px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-indigo">Module 3 · Teaching</span>
              <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-medium ${onHold ? "bg-warn-soft text-[#7a5a00]" : "bg-ok-soft text-ok"}`}>
                {onHold ? "● Paul's mapping is on hold" : captured ? "● Trained on Paul's approved mapping" : "● Using the prepared example mapping"}
              </span>
            </div>
            <h1 className="mt-4 text-[38px] font-light leading-[1.1] tracking-tight text-[#1f2d3d] md:text-[44px]">
              Maya works, <span className="font-medium text-indigo">the AI guides her</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[16.5px] leading-relaxed text-[#475467]">
              Maya is new. She does a case Paul never showed. The Apprentice watches her screen and, when she pauses, tells her if a step
              looks like Paul&apos;s way. If something might be different, it never says &quot;wrong&quot;: it puts it under review for her supervisor.
            </p>

            {onHold ? (
              <div className="mt-6 rounded-md border border-[#F0D58A] bg-warn-soft p-4 text-[15px] text-[#7a5a00]">
                The AI isn&apos;t trained yet: Paul still has to check and approve what it observed.{" "}
                <Link href="/map" className="font-medium text-brand hover:underline">Open Mapping →</Link>
              </div>
            ) : (
              <ol className="mt-7 space-y-3">
                <Step n="1" title="Open the app Maya works in" done={false}>
                  For the demo: Ledgerline as Maya.{" "}
                  <a href="/ledgerline/index.html?user=maya" target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    Open Ledgerline in a new tab ↗
                  </a>
                </Step>
                <Step n="2" title="Start recording" done={c.sharing}>
                  Share the Ledgerline tab and allow the microphone.
                  <div className="mt-2">
                    <button onClick={c.start} disabled={c.sharing} className="inline-flex h-10 items-center rounded-sm bg-indigo px-4 text-[15px] text-white hover:bg-indigo-dark disabled:opacity-50">
                      {c.sharing ? "● Recording" : "● Start recording"}
                    </button>
                  </div>
                </Step>
                <Step n="3" title="Let the Apprentice pop up over the work" done={pip.isOpen}>
                  {canPip ? (
                    <div className="mt-2">
                      <button onClick={() => pip.open()} disabled={pip.isOpen} className="inline-flex h-10 items-center rounded-sm border border-indigo bg-white px-4 text-[15px] text-indigo hover:bg-indigo-soft disabled:opacity-50">
                        {pip.isOpen ? "✓ Floating window open" : "Open floating window"}
                      </button>
                    </div>
                  ) : (
                    <>Floating windows need Chrome or Edge. The Apprentice is shown on the right instead.</>
                  )}
                </Step>
                <Step n="4" title="Work, pause, listen. Stop recording when done" done={c.finished}>
                  Anything that might differ from Paul&apos;s way goes to the{" "}
                  <Link href="/review" className="text-brand hover:underline">supervisor review</Link>.
                </Step>
              </ol>
            )}
          </div>

          <div className="rise h-[640px] overflow-hidden rounded-sm border border-[#cfd2d8] shadow-[0_14px_36px_rgba(20,28,38,.14)]">
            {pip.isOpen ? (
              <div className="grid h-full place-items-center bg-white p-8 text-center text-[15px] text-[#475467]">
                <div>
                  <div className="text-[34px]">↗</div>
                  The Apprentice is floating on top of the screen.
                  <br />
                  Switch to Maya&apos;s work app.
                </div>
              </div>
            ) : (
              <CoachPanel c={c} map={map} blocked={onHold} />
            )}
          </div>
        </div>
      </section>
      {pip.container && createPortal(<CoachPanel c={c} map={map} blocked={onHold} />, pip.container)}
    </div>
  );
}

function Step({ n, title, done, children }: { n: string; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 rounded-md border border-line bg-white p-4">
      <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-[14px] font-bold ${done ? "bg-ok text-white" : "bg-indigo-soft text-indigo"}`}>{done ? "✓" : n}</span>
      <div className="text-[14.5px] leading-relaxed text-[#475467]">
        <div className="text-[16px] font-medium text-[#1f2d3d]">{title}</div>
        {children}
      </div>
    </li>
  );
}
