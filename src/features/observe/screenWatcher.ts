"use client";
// Screen watcher for the floating Apprentice: the user shares any screen, window or tab;
// every FRAME_MS we grab a frame and report whether it changed (cheap 32x18 thumbnail diff),
// so only changed screens go to the LLM and "no change for a while" can mean "paused".

const FRAME_MS = 2000;

export interface Frame {
  dataUrl: string;
  changed: boolean;
  at: number;
}

export class ScreenWatcher {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private prevThumb: Uint8ClampedArray | null = null;
  paused = false;
  lastChange = 0;

  /** Must be called from a click (the browser asks the user what to share). */
  async start(onFrame: (f: Frame) => void, onEnded: () => void) {
    // Suggest the whole screen so the bot sees any browser tab or app the user works in.
    this.stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 5, displaySurface: "monitor" },
      audio: false,
      selfBrowserSurface: "exclude",
      surfaceSwitching: "include",
      monitorTypeSurfaces: "include",
    } as DisplayMediaStreamOptions);
    this.video = document.createElement("video");
    this.video.srcObject = this.stream;
    this.video.muted = true;
    await this.video.play();
    this.stream.getVideoTracks()[0].addEventListener("ended", () => {
      this.stop();
      onEnded();
    });
    this.lastChange = Date.now();
    this.timer = setInterval(() => {
      if (this.paused) return;
      const thumb = this.thumbnail();
      if (!thumb) return;
      const changed = !this.prevThumb || diff(this.prevThumb, thumb) > 3;
      if (changed) {
        this.prevThumb = thumb;
        this.lastChange = Date.now();
      }
      const dataUrl = this.grab(1024);
      if (dataUrl) onFrame({ dataUrl, changed, at: Date.now() });
    }, FRAME_MS);
  }

  stop() {
    clearInterval(this.timer);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video = null;
    this.prevThumb = null;
  }

  get active() {
    return this.stream !== null;
  }

  /** Current screen as a JPEG data URL (also used for step screenshots). */
  grab(width: number): string | null {
    const v = this.video;
    if (!v || !v.videoWidth) return null;
    const c = document.createElement("canvas");
    c.width = width;
    c.height = Math.round((v.videoHeight / v.videoWidth) * width);
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.6);
  }

  private thumbnail(): Uint8ClampedArray | null {
    const v = this.video;
    if (!v || !v.videoWidth) return null;
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 18;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(v, 0, 0, 32, 18);
    return ctx.getImageData(0, 0, 32, 18).data;
  }
}

function diff(a: Uint8ClampedArray, b: Uint8ClampedArray) {
  let d = 0;
  for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]);
  return d / (a.length / 4);
}
