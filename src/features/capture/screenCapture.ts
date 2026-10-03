"use client";
// Screen capture → vision events + per-event screenshots ("screen moments").
// A frame is grabbed every FRAME_MS; it is only sent to /api/vision when the screen
// actually changed (cheap 32x18 thumbnail diff) and no request is in flight.

import { emit } from "@/lib/events";

const FRAME_MS = 2000;

let stream: MediaStream | null = null;
let video: HTMLVideoElement | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
let prevThumb: Uint8ClampedArray | null = null;
let prevSent: string | null = null;
let inFlight = false;
let paused = false;

function grab(width: number): string | null {
  if (!video || !video.videoWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round((video.videoHeight / video.videoWidth) * width);
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.6);
}

function thumbnail(): Uint8ClampedArray | null {
  if (!video || !video.videoWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 18;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(video, 0, 0, 32, 18);
  return ctx.getImageData(0, 0, 32, 18).data;
}

function changed(a: Uint8ClampedArray, b: Uint8ClampedArray) {
  let diff = 0;
  for (let i = 0; i < a.length; i += 4) diff += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]);
  return diff / (a.length / 4) > 3;
}

async function tick() {
  if (paused || inFlight) return;
  const thumb = thumbnail();
  if (!thumb || (prevThumb && !changed(prevThumb, thumb))) return;
  prevThumb = thumb;
  const frame = grab(1024);
  if (!frame) return;
  inFlight = true;
  try {
    const res = await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame, previous: prevSent }),
    });
    const { events } = await res.json();
    prevSent = frame;
    for (const e of events ?? []) emit({ ...e, invoiceId: e.invoiceId ?? "", source: "vision" });
  } catch {
    // vision is best-effort; DOM events still flow
  } finally {
    inFlight = false;
  }
}

export async function startScreenCapture(onEnded?: () => void): Promise<void> {
  // Chrome: offer "this tab" first so the expert can share the ERP in one click.
  stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 5 },
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
  } as DisplayMediaStreamOptions);
  video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  await video.play();
  stream.getVideoTracks()[0].addEventListener("ended", () => {
    stopScreenCapture();
    onEnded?.();
  });
  prevThumb = null;
  prevSent = null;
  timer = setInterval(tick, FRAME_MS);
}

export function stopScreenCapture(): void {
  clearInterval(timer);
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  video = null;
}

/** Off the record: stop sending frames to vision. */
export function setCapturePaused(p: boolean) {
  paused = p;
}

export const isCapturing = () => stream !== null;

/** Current screen as a small JPEG data URL, or null when not sharing. */
export function snapshot(): string | null {
  return grab(720);
}
