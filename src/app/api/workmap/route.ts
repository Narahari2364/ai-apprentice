// POST /api/workmap { events, transcript } → WorkMap JSON, built by Gemini.
import { NextResponse } from "next/server";
import type { ScreenEvent, TranscriptLine, WorkMap } from "@/lib/types";

// Tried in order; falls through on overload / unavailable so the demo doesn't stall.
const MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.1-flash-lite"];

const INSTRUCTIONS = `You turn a recorded expert work session into a Work Map that a new hire can learn from.
You get screen events (what happened on screen, with mm:ss times) and the voice transcript between the expert and an apprentice agent (questions, answers, debrief, teach-back).

Return JSON only, exactly this shape:
{
  "task": string,                       // one line, what the expert was doing
  "steps": [{
    "id": "s1", "order": 1,
    "title": string,                    // short imperative, e.g. "Code the invoice to a cost center"
    "time": "mm:ss",                    // the screen event time this step links to
    "decision": string,                 // "" for routine steps; for judgment calls what was decided, e.g. "Re-coded from opex (4711) to capex (0400)"
    "reason": string,                   // the reason, paraphrased
    "expertQuote": string,              // the expert's OWN words from the transcript, verbatim
    "guardrails": string[]              // limits, exceptions, when to stop and ask; short imperative sentences
  }],
  "gaps": string[],                     // questions still unanswered after the debrief
  "confirmed": boolean                  // true only if the expert confirmed the apprentice's teach-back
}
Rules: 5–9 steps in chronological order. Every judgment call and guardrail must come from the transcript or events, never invented. Prefer generalised steps ("Hold December invoices from Brandt") over one-off ones.`;

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY missing in .env.local" }, { status: 500 });

  const { events, transcript } = (await req.json()) as { events: ScreenEvent[]; transcript: TranscriptLine[] };
  const input =
    "SCREEN EVENTS:\n" +
    events.map((e) => `${e.time} ${e.description}`).join("\n") +
    "\n\nTRANSCRIPT:\n" +
    transcript.map((t) => `${t.time} ${t.speaker.toUpperCase()}: ${t.text}`).join("\n");

  let res: Response | null = null;
  for (const model of MODELS) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
        contents: [{ role: "user", parts: [{ text: input }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    });
    if (res.ok || ![404, 429, 500, 503].includes(res.status)) break;
  }
  if (!res?.ok) return NextResponse.json({ error: `Gemini ${res?.status}: ${await res?.text()}` }, { status: 502 });

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try {
    const map = JSON.parse(text) as WorkMap;
    map.steps = (map.steps ?? []).map((s, i) => ({ ...s, id: s.id || `s${i + 1}`, order: i + 1, guardrails: s.guardrails ?? [] }));
    map.gaps = map.gaps ?? [];
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: "Gemini returned invalid JSON", raw: text }, { status: 502 });
  }
}
