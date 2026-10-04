"use client";
// Module 3 · Teaching: one click launches the Apprentice bot into an always-on-top floating
// window. The new hire starts recording and works in any browser tab; the bot guides with the
// expert's APPROVED mapping. Matching steps get "that's right, next…"; anything that might
// differ is never called wrong: it goes under review for the supervisor (/review).

import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ConversationProvider } from "@elevenlabs/react";
import CoachPanel from "@/features/observe/CoachPanel";
import Launcher from "@/features/observe/Launcher";
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
  const bot = <CoachPanel c={c} map={map} blocked={onHold} />;

  return (
    <>
      <Launcher
        eyebrow="Module 3 · Teaching"
        title={<>The Apprentice <span className="font-medium text-indigo">guides the new hire</span></>}
        text="Launch it and it floats on Maya's screen. She starts recording and works as usual; it tells her when a step matches Paul's way, and anything that might differ goes to her supervisor, never called wrong."
        launched={pip.isOpen}
        canPip={canPip}
        failed={pip.failed}
        onLaunch={() => pip.open()}
        panel={bot}
        demo={{ href: "/ledgerline/index.html?user=maya", label: "Demo app: open Ledgerline as Maya" }}
        notice={
          onHold ? (
            <div className="rounded-md border border-[#F0D58A] bg-warn-soft p-4 text-[15px] text-[#7a5a00]">
              The AI isn&apos;t trained yet: Paul still has to check and approve what it observed.{" "}
              <Link href="/map" className="font-medium text-brand hover:underline">Open Mapping →</Link>
            </div>
          ) : undefined
        }
      />
      {pip.container && createPortal(bot, pip.container)}
    </>
  );
}
