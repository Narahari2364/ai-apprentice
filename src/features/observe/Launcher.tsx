"use client";
// One-click launcher: the page only exists to pop Torchbearer bot out into its own
// always-on-top window. Everything else (start/stop recording, questions, steps) happens
// in the floating bot, over whatever browser tab or app the user works in.

import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: ReactNode;
  text: string;
  launched: boolean;
  canPip: boolean;
  /** The floating window was refused: the bot floats in this page's corner instead. */
  failed?: boolean;
  /** Mic permission problem from the Launch click. */
  micError?: string | null;
  /** Start controls shown on this page once launched (Chrome only starts screen recording from a click here). */
  startArea?: ReactNode;
  onLaunch: () => void;
  /** The bot itself, shown inline only when floating windows aren't available. */
  panel: ReactNode;
  demo: { href: string; label: string };
  /** Small links to the other modules (there is no header bar). */
  links?: { href: string; label: string }[];
  notice?: ReactNode;
}

export default function Launcher({ eyebrow, title, text, launched, canPip, failed = false, micError, onLaunch, panel, demo, links, notice, startArea }: Props) {
  return (
    <section className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#f3f2ff_0%,#ffffff_70%)]">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full bg-indigo/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-[340px] w-[340px] rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
      <div className="rise relative mx-auto flex max-w-3xl flex-col items-center px-6 py-14 text-center">
        <span className="rounded-sm border border-indigo/30 bg-indigo-soft px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-indigo">{eyebrow}</span>
        <h1 className="mt-5 text-[38px] font-light leading-[1.1] tracking-tight text-[#1f2d3d] md:text-[46px]">{title}</h1>
        <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-[#475467]">{text}</p>

        {notice ? (
          <div className="mt-8 w-full max-w-xl">{notice}</div>
        ) : (
          <>
            <div className="floaty mt-10 grid h-28 w-28 place-items-center rounded-[28px] bg-indigo shadow-[0_18px_40px_rgba(81,70,217,.35)]">
              <BotFace />
            </div>

            {canPip && !launched && !failed && (
              <button
                onClick={onLaunch}
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-sm bg-indigo px-8 text-[18px] text-white shadow-md transition hover:bg-indigo-dark"
              >
                Launch Torchbearer
              </button>
            )}
            {(launched || failed || !canPip) && startArea && (
              <div className="mt-8 w-full max-w-md rounded-md border border-line bg-white p-5 text-left shadow-[0_8px_24px_rgba(16,24,40,.06)]">{startArea}</div>
            )}
            {launched && (
              <div className="mt-4 rounded-md border border-[#bfe3cc] bg-ok-soft px-5 py-3 text-[15px] text-ok">
                ✓ Torchbearer is floating on your screen. Start recording here (allow the microphone if Chrome asks), then switch to your work.
              </div>
            )}
            {micError && (
              <div className="mt-4 max-w-xl rounded-md border border-[#f3c2c2] bg-err-soft px-5 py-3 text-left text-[15px] text-[#8E1B1B]">🎤 {micError}</div>
            )}

            <ol className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
              {[
                ["1", "Launch", "The bot pops up and floats on top of your screen."],
                ["2", "Start recording", "Press it in the bot and choose Entire screen."],
                ["3", "Work as usual", "In any browser tab. It watches, and asks only at a pause."],
              ].map(([n, t, d]) => (
                <li key={n} className="rounded-md border border-line bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-[15px] font-medium text-[#1f2d3d]">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-soft text-[12px] font-bold text-indigo">{n}</span>
                    {t}
                  </div>
                  <p className="mt-1 text-[13.5px] leading-snug text-[#667085]">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[14px]">
              <a href={demo.href} target="_blank" rel="noreferrer" className="text-brand hover:underline">{demo.label} ↗</a>
              {links?.map((l) => (
                <a key={l.href} href={l.href} className="text-[#667085] hover:text-indigo">{l.label}</a>
              ))}
            </div>

            {(!canPip || failed) && (
              <p className="mt-6 max-w-md text-[13.5px] text-[#7a5a00]">
                This browser can&apos;t open a floating window (desktop Chrome or Edge can), so Torchbearer floats in the corner of this page.
              </p>
            )}
          </>
        )}
      </div>
      {(!canPip || failed) && !notice && (
        <div className="rise fixed bottom-5 right-5 z-40 h-[600px] max-h-[calc(100vh-90px)] w-[380px] overflow-hidden rounded-md border border-[#cfd2d8] shadow-[0_18px_48px_rgba(20,28,38,.28)]">
          {panel}
        </div>
      )}
    </section>
  );
}

export function BotFace({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="16" width="44" height="34" rx="12" fill="#fff" />
      <circle cx="24" cy="33" r="5" fill="#5146d9" />
      <circle cx="40" cy="33" r="5" fill="#5146d9" />
      <path d="M25 43c4 3 10 3 14 0" stroke="#5146d9" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M32 16V9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="7" r="3.5" fill="#a5f3c4" />
    </svg>
  );
}
