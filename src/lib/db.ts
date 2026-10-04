// Server-only database: a PRIVATE Vercel Blob store ("torchbearer-db", BLOB_READ_WRITE_TOKEN).
// Everything is a JSON document:
//   workflows/index.json            summaries of all trained workflows
//   workflows/<id>.json             a full workflow (steps, reasons, rules, screenshots)
//   progress/<workflow>/<learner>.json   learned / relearn per step
//   reviews/current.json            the supervisor's review batch
// Reads skip the CDN cache so a save is visible right away (e.g. a just-approved workflow).
import { del, get, put } from "@vercel/blob";

export async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    const r = await get(pathname, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return JSON.parse(await new Response(r.stream).text()) as T;
  } catch {
    return null; // not found yet
  }
}

export async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function remove(pathname: string): Promise<void> {
  try {
    await del(pathname);
  } catch {
    /* already gone */
  }
}

/** Only letters, digits, dash, underscore and space in path segments. */
export const safe = (s: string) => s.replace(/[^\w\- ]/g, "_").slice(0, 80);
