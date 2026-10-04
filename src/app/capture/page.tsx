"use client";
// Module 1 · Capture: one click launches the Apprentice bot into an always-on-top floating
// window (Chrome/Edge Picture-in-Picture). In the bot: Start recording → choose Entire screen →
// it reads the screen every 2 s in any browser tab, writes the workflow live and asks by voice
// when the screenshots can't explain something. Stop recording → everything goes to Mapping.

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useState, useSyncExternalStore } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import ObserverPanel from "@/features/observe/ObserverPanel";
import Launcher from "@/features/observe/Launcher";
import { useObserver } from "@/features/observe/useObserver";
import { pipSupported, usePip } from "@/features/observe/usePip";
import { requestMic } from "@/lib/useVoiceAgent";

export default function CapturePage() {
  return (
    <ConversationProvider>
      <Capture />
    </ConversationProvider>
  );
}

function Capture() {
  const router = useRouter();
  const pip = usePip();
  const [micError, setMicError] = useState<string | null>(null);
  const o = useObserver(() => {
    pip.close();
    window.focus();
    router.push("/map");
  });
  const canPip = useSyncExternalStore(() => () => {}, pipSupported, () => true);
  const bot = <ObserverPanel o={o} onStart={o.start} />;

  return (
    <>
      <Launcher
        eyebrow="Module 1 · Capture"
        title={<>The Apprentice <span className="font-medium text-indigo">watches the expert work</span></>}
        text="Launch it and it floats on your screen. Start recording, work in any browser as usual, and answer when it asks why. Stop recording and it shows you everything it observed."
        launched={pip.isOpen}
        canPip={canPip}
        failed={pip.failed}
        onLaunch={() => {
          // Same click: open the bot (needs the click) and ask for the mic while this page is in front.
          pip.open();
          requestMic().then(setMicError);
        }}
        micError={micError}
        panel={bot}
        demo={{ href: "/ledgerline/index.html?user=paul", label: "Demo app: open Ledgerline as Paul" }}
      />
      {pip.container && createPortal(bot, pip.container)}
    </>
  );
}
