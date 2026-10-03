"use client";
// Shared ElevenLabs session logic for the Interviewer and the Tutor.
// Must be used inside <ConversationProvider>.

import { useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { elapsed } from "./events";
import type { TranscriptLine } from "./types";

export function useVoiceAgent(role: "interviewer" | "tutor") {
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastUserSpeech = useRef(0);

  const conv = useConversation({
    onMessage: ({ message, role: from }) => {
      if (message.startsWith("[")) return; // our own tagged control messages
      if (from === "user") lastUserSpeech.current = Date.now();
      setTranscript((t) => [...t, { time: elapsed(), speaker: from === "user" ? "expert" : "agent", text: message }]);
    },
    onError: (message) => setError(String(message)),
  });

  async function start() {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch(`/api/elevenlabs/token?role=${role}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      conv.startSession({ conversationToken: data.token, connectionType: "webrtc" });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return { ...conv, start, transcript, error, connected: conv.status === "connected", lastUserSpeech };
}
