import type { WorkMap } from "@/lib/types";
import content from "@/content/workmap.json";

// The prepared Work Map. Its text lives in src/content/workmap.json (edit there, not here);
// /map, Teaching mode, the AI-agent export and mock mode all read it through this export.
// docId = Ledgerline DOCS id that /map (and Teach's replay) opens for the step.
export const sampleWorkMap: WorkMap = content.workMap as WorkMap;

/** Show the map from the last live capture session instead (src/content/workmap.json → source). */
export const capturedSessionEnabled: boolean = content.source.useCapturedSession;

/** Page wording for the Work Map, from the same file. */
export const workMapPage = content.page;
