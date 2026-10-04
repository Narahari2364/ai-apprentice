"use client";
// Always-on-top floating window (Chrome/Edge Document Picture-in-Picture). React renders
// into it through a portal, so the Apprentice floats over any tab or app the user works in.

import { useCallback, useState } from "react";

interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export const pipSupported = () => typeof window !== "undefined" && "documentPictureInPicture" in window;

export function usePip() {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [failed, setFailed] = useState(false); // browser refused (e.g. embedded browsers): float in the page instead

  /** Must be called from a click. */
  const open = useCallback(async (width = 380, height = 600) => {
    if (!window.documentPictureInPicture) {
      setFailed(true);
      return false;
    }
    let pip: Window;
    try {
      pip = await window.documentPictureInPicture.requestWindow({ width, height });
    } catch {
      setFailed(true);
      return false;
    }
    // Same styles and fonts as the app.
    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((n) => pip.document.head.appendChild(n.cloneNode(true)));
    pip.document.documentElement.className = document.documentElement.className;
    pip.document.body.className = "font-sans bg-white m-0";
    pip.document.title = "Apprentice";
    const root = pip.document.createElement("div");
    root.style.height = "100vh";
    pip.document.body.appendChild(root);
    pip.addEventListener("pagehide", () => {
      setContainer(null);
      setPipWindow(null);
    });
    setPipWindow(pip);
    setContainer(root);
    return true;
  }, []);

  const close = useCallback(() => pipWindow?.close(), [pipWindow]);

  return { container, open, close, failed, isOpen: container !== null };
}
