// Owner: CS 2. Turn a session (events + transcript) into a Work Map.
// TODO(CS 2): POST to /api/workmap (Gemini, server-side) with events +
//   transcript, return WorkMap JSON incl. gaps for the debrief.
// TODO(CS 2): save the result to localStorage key "workmap" so /map and /teach use it.

import type { ScreenEvent, TranscriptLine, WorkMap } from "@/lib/types";
import { sampleWorkMap } from "@/data/sampleWorkMap";

export async function buildWorkMap(
  events: ScreenEvent[],
  transcript: TranscriptLine[],
): Promise<WorkMap> {
  console.log("[buildWorkMap stub]", events.length, "events,", transcript.length, "lines");
  return sampleWorkMap;
}
