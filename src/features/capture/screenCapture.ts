// Owner: CS 1. Screen capture + vision → ScreenEvents.
// TODO(CS 1): getDisplayMedia(), grab a frame every 1–2 s onto a canvas.
// TODO(CS 1): POST frame (+ previous frame) to /api/vision (Gemini, server-side
//   with GEMINI_API_KEY) and emit() the returned events with source: "vision".
// TODO(CS 1): redact personal data before sending frames (Trust requirement).

export async function startScreenCapture(): Promise<void> {
  throw new Error("startScreenCapture: not implemented yet");
}

export function stopScreenCapture(): void {}
