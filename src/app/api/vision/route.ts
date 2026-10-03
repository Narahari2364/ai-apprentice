// POST /api/vision { frame, previous? } (base64 JPEG data URLs) → { events } describing what changed.
import { NextResponse } from "next/server";
import { geminiJson, VISION_MODELS } from "@/lib/gemini";
import type { ScreenEvent } from "@/lib/types";

const INSTRUCTIONS = `You watch an accounts-payable clerk's screen. You get the PREVIOUS frame (if any) and the CURRENT frame.
Report only what CHANGED between them that matters for the work: an invoice opened, a field value changed (cost center, asset number, amount, supplier, description), a status button pressed (Approve, Hold, Send for 2nd approval), a save.
Return JSON: {"events":[{"invoiceId": string, "type": "invoice_opened"|"field_changed"|"status_changed"|"saved", "field"?: string, "from"?: string, "to"?: string, "description": string}]}
- description: one short sentence, e.g. "Invoice 4471: cost center changed from 4711 to 0400".
- Return {"events": []} if nothing meaningful changed (scrolling, mouse movement, typing in progress).
- Privacy: never include personal names, emails, IBANs or bank details; refer to invoices by their number.`;

const toPart = (dataUrl: string) => ({
  inlineData: { mimeType: "image/jpeg", data: dataUrl.replace(/^data:image\/\w+;base64,/, "") },
});

export async function POST(req: Request) {
  const { frame, previous } = (await req.json()) as { frame: string; previous?: string | null };
  const parts = previous
    ? [{ text: "PREVIOUS frame:" }, toPart(previous), { text: "CURRENT frame:" }, toPart(frame)]
    : [{ text: "CURRENT frame (no previous):" }, toPart(frame)];

  const result = await geminiJson<{ events?: Omit<ScreenEvent, "time" | "source">[] }>(INSTRUCTIONS, parts, VISION_MODELS);
  if (!result.ok) return NextResponse.json({ error: result.error, events: [] }, { status: 502 });
  return NextResponse.json({ events: result.data.events ?? [] });
}
