// Server-only Gemini helper: JSON output, falls through a model list on overload.

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

export const TEXT_MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
export const VISION_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest", "gemini-3.8-flash"];

export async function geminiJson<T>(
  system: string,
  parts: Part[],
  models = TEXT_MODELS,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, error: "GEMINI_API_KEY missing in .env.local" };

  let last = "";
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    });
    if (!res.ok) {
      last = `Gemini ${model} ${res.status}: ${await res.text()}`;
      if ([404, 429, 500, 503].includes(res.status)) continue;
      return { ok: false, error: last };
    }
    const json = await res.json();
    const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    try {
      return { ok: true, data: JSON.parse(text) as T };
    } catch {
      return { ok: false, error: `Gemini ${model} returned invalid JSON: ${text.slice(0, 200)}` };
    }
  }
  return { ok: false, error: last };
}
