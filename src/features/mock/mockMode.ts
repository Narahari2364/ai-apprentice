"use client";
// Mock mode: run the real app (Ledgerline, popups, Work Map, tutor) with a scripted fake
// voice agent and fake API answers, so the UI can be built and tested without keys, mic or credits.
// Turn on with ?mock in the URL (remembered for the tab), off with ?mock=0. Off by default.

import { sampleWorkMap } from "@/data/sampleWorkMap";

const KEY = "apprentice-mock";

export function isMockMode(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("mock");
  if (q !== null) {
    if (q === "0" || q === "false") sessionStorage.removeItem(KEY);
    else sessionStorage.setItem(KEY, "1");
  }
  return sessionStorage.getItem(KEY) === "1";
}

let installed = false;

/** Answers the app's own /api calls with fake data instead of calling Gemini / ElevenLabs. */
export function installMockFetch() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const realFetch = window.fetch.bind(window);
  const json = (data: unknown, delay = 0) =>
    new Promise<Response>((r) => setTimeout(() => r(new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })), delay));
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("/api/workmap")) return json(sampleWorkMap, 1500); // "building the Work Map…"
    if (url.includes("/api/vision")) return json({ events: [] }); // Ledgerline's own events drive the mock
    if (url.includes("/api/elevenlabs/token")) return json({ token: "mock" });
    return realFetch(input, init);
  };
}
