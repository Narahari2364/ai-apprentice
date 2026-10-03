// Stretch goal "agent-ready guardrails": the Work Map as instructions an AI agent
// can load, so it follows the same steps and stops where the expert would.

import type { WorkMap } from "@/lib/types";

export function toAgentMarkdown(map: WorkMap): string {
  const stops = map.steps.flatMap((s) => s.guardrails.map((g) => `- ${g} _(step ${s.order}, expert at ${s.time})_`));
  const lines = [
    `# Procedure: ${map.task}`,
    "",
    `Source: expert Work Map${map.confirmed ? ", confirmed by the expert after a teach-back" : " (not yet confirmed by the expert)"}.`,
    "Follow the steps in order. Routine steps you may do on your own. For judgment calls, apply the rule and give the reason. If any STOP condition is true, do not save: hand the case to a person and say which rule applies.",
    "",
    "## STOP conditions (hard guardrails)",
    ...(stops.length ? stops : ["- none recorded"]),
    "",
    "## Steps",
  ];
  for (const s of map.steps) {
    lines.push("", `### ${s.order}. ${s.title}${s.decision ? " (judgment call)" : ""}`);
    if (s.decision) lines.push(`- **Decision rule:** ${s.decision}`);
    lines.push(`- **Why:** ${s.reason}`);
    lines.push(`- **Expert's words:** "${s.expertQuote}"`);
    for (const g of s.guardrails) lines.push(`- **STOP if:** ${g}`);
  }
  if (map.gaps.length) {
    lines.push("", "## Not yet clear (ask a person)", ...map.gaps.map((g) => `- ${g}`));
  }
  return lines.join("\n") + "\n";
}

export function downloadText(filename: string, text: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
