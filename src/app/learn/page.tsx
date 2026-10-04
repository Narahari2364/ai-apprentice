"use client";
// Learning mode, screenshot-only: the Apprentice floats in an always-on-top window
// (Chrome/Edge Picture-in-Picture) over whatever the expert works in, reads the screen
// every 2 s, writes the workflow live and asks by voice when the screenshots can't explain something.

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import ObserverPanel from "@/features/observe/ObserverPanel";
import { useObserver } from "@/features/observe/useObserver";
import { pipSupported, usePip } from "@/features/observe/usePip";

export default function LearnPage() {
  return (
    <ConversationProvider>
      <Learn />
    </ConversationProvider>
  );
}

function Learn() {
  const router = useRouter();
  const pip = usePip();
  const o = useObserver(() => {
    pip.close();
    window.focus();
    router.push("/map");
  });
  const canPip = useSyncExternalStore(() => () => {}, pipSupported, () => true);

  return (
    <div className="min-h-full bg-[#f6f8fc]">
      <section className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#f3f2ff_0%,#ffffff_100%)]">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-indigo/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="rise">
            <span className="rounded-sm border border-indigo/30 bg-indigo-soft px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-indigo">
              Module 1 · Learning mode
            </span>
            <h1 className="mt-4 text-[38px] font-light leading-[1.1] tracking-tight text-[#1f2d3d] md:text-[44px]">
              Show the Apprentice <span className="font-medium text-indigo">any task, on any screen</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[16.5px] leading-relaxed text-[#475467]">
              It floats on top of your work, reads your screen every two seconds, and writes the workflow as you go. When the
              screenshots can&apos;t explain something, it asks you out loud, and your answer goes straight into the workflow.
            </p>

            <ol className="mt-7 space-y-3">
              <Step n="1" title="Open the app you'll work in" done={false}>
                For the demo: Ledgerline as Paul.{" "}
                <a href="/ledgerline/index.html?user=paul" target="_blank" rel="noreferrer" className="text-brand hover:underline">
                  Open Ledgerline in a new tab ↗
                </a>
              </Step>
              <Step n="2" title="Share that tab or window, and start" done={o.sharing}>
                Pick the Ledgerline tab (or a whole window). Then allow the microphone so you can answer by talking.
                <div className="mt-2">
                  <button
                    onClick={o.start}
                    disabled={o.sharing}
                    className="inline-flex h-10 items-center rounded-sm bg-indigo px-4 text-[15px] text-white transition hover:bg-indigo-dark disabled:opacity-50"
                  >
                    {o.sharing ? "✓ Screen shared, Apprentice listening" : "Share screen & start"}
                  </button>
                </div>
              </Step>
              <Step n="3" title="Float the Apprentice over your work" done={pip.isOpen}>
                {canPip ? (
                  <>
                    A small always-on-top window stays on the right while you switch to your app.
                    <div className="mt-2">
                      <button
                        onClick={() => pip.open()}
                        disabled={pip.isOpen}
                        className="inline-flex h-10 items-center rounded-sm border border-indigo bg-white px-4 text-[15px] text-indigo transition hover:bg-indigo-soft disabled:opacity-50"
                      >
                        {pip.isOpen ? "✓ Floating window open" : "Open floating window"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>Floating windows need Chrome or Edge. The Apprentice is shown on the right of this page instead.</>
                )}
              </Step>
              <Step n="4" title="Work as usual, answer when it asks, then End task" done={false}>
                It stays quiet while you work and asks only at a pause. End task runs a short debrief, then builds the Work Map.
              </Step>
            </ol>
          </div>

          {/* Apprentice panel: here, unless it's floating in its own window */}
          <div className="rise h-[640px] overflow-hidden rounded-sm border border-[#cfd2d8] shadow-[0_14px_36px_rgba(20,28,38,.14)]">
            {pip.isOpen ? (
              <div className="grid h-full place-items-center bg-white p-8 text-center text-[15px] text-[#475467]">
                <div>
                  <div className="text-[34px]">↗</div>
                  The Apprentice is floating on top of your screen.
                  <br />
                  Switch to your work app.
                </div>
              </div>
            ) : (
              <ObserverPanel o={o} onStart={o.start} />
            )}
          </div>
        </div>
      </section>
      {pip.container && createPortal(<ObserverPanel o={o} onStart={o.start} />, pip.container)}
    </div>
  );
}

function Step({ n, title, done, children }: { n: string; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 rounded-md border border-line bg-white p-4">
      <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-[14px] font-bold ${done ? "bg-ok text-white" : "bg-indigo-soft text-indigo"}`}>
        {done ? "✓" : n}
      </span>
      <div className="text-[14.5px] leading-relaxed text-[#475467]">
        <div className="text-[16px] font-medium text-[#1f2d3d]">{title}</div>
        {children}
      </div>
    </li>
  );
}
