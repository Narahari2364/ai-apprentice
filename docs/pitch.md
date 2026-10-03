# Pitch: The AI Apprentice

## One line

Sabine retires in 18 months. Our AI Apprentice watches her work, asks *why* at the right moments, turns her answers into a Work Map, and coaches the next new hire in her own words.

## Problem (30 s)

- 11,200 Americans turn 65 every day; in Germany 12.9 M workers (~30 %) retire by 2036.
- What makes them good was never written down. Screen recordings show **what** happened, not **why**.
- Guardrails (limits, exceptions, when to stop and ask) are invisible. New hires learn them by breaking them.

Our case: **team meal expenses** at Nordhaven Consulting, in the Ledgerline expense tool. Sabine never gets a line returned by Global Audit. Lena, in her first week, gets half of hers returned. The rules that matter are in nobody's handbook:
Eat In vs Take Away from the receipt's "im Haus" line (VAT), €30 per person unless the PL approved, a delivery confirmation is not a tax invoice, over €250 the invoice must name the company.

## Solution (30 s)

Three modules, one product:

1. **Capture.** Sabine files expenses as usual. A voice apprentice (ElevenLabs) sees every screen action and stays quiet. At natural pauses it asks one short question: *"You switched it to Eat In. What made you do that?"*
2. **Map.** When she is done it runs a debrief, closes the gaps, explains the process back until she says *"yes, that's how it works"*, and builds a clickable **Work Map**: steps, decisions, reasons in her words, guardrails, each linked to the screen moment and the document.
3. **Teach.** Lena files a case Sabine never showed. A voice tutor coaches her and **checks every Save against Sabine's guardrails**. If she reaches for Take Away, Save is blocked: *"Sabine would stop here. Why do you think?"* It replays Sabine's moment, Lena fixes it herself, and she ends with a mastery report.

## Demo script (≈ 4 min)

| Time | Who | What happens |
|---|---|---|
| 0:00 | Narrator | Problem in 3 sentences. |
| 0:30 | Judge as **Sabine**, `/capture` | Start → share this tab. Files Trattoria da Lupo: opens the receipt, sets **Eat In**. Pause → apprentice asks why. She answers. |
| 1:30 | Sabine | Bitebox dinner: attaches the **invoice, not the confirmation**. Apprentice asks about the per-person limit (the guardrail question). |
| 2:00 | Sabine | **Off the record** toggle: "Jonas approves everything anyway." Not recorded. Back on. **I'm done → debrief**: 3 follow-ups, teach-back, Sabine corrects one detail, confirms. |
| 2:40 | `/map` | Work Map: 7 steps, judgment calls, 4 guardrails. Click a step → Ledgerline opens the exact receipt. **Export for agents.** |
| 3:10 | Judge as **Lena**, `/teach` | New receipt (Café Nordlicht). Picks **Take Away**, Save → **blocked**, tutor quotes Sabine, Replay opens her receipt. Lena switches to Eat In, adds guests, saves. |
| 3:40 | Lena | **Finish → mastery report**: mastered vs practise next. |
| 3:50 | Narrator | Moonshot slide. |

Backup: a recorded full run, and the sample Work Map (works without a live capture).

## The Apprentice Test: our answers

1. **When to ask.** We do not trust default turn-taking. The app sends the agent a `[PAUSE]` signal only when **all** hold: a judgment-relevant action just happened (Type of Meal, guests, attachments, save); no typing, mouse or screen event for 3.5 s; Sabine is not talking; she has no document open (she is reading); and a question budget of one per 20 s. The panel shows the detector live: *Listening / Quiet (she is reading) / Asking*. While she narrates, the agent uses ElevenLabs' `skip_turn` and stays silent.
2. **What to ask.** Only judgment events trigger a question; typed amounts never do, because the screen already answers them. The agent gets the exact screen event ("Type of Meal changed from Take Away to Eat In") and is told to ask about the **reason, the limit, or when to stop and ask**, never about what is visible. Over a session at least one question is about a guardrail.
3. **When it has understood.** In the debrief it asks at least three follow-ups that were not answered live, then explains the whole process back step by step. It is done only when Sabine confirms; corrections are repeated back. The Work Map records `confirmed` and lists remaining **gaps** ("Who approves when the PL is on holiday?").
4. **Whether the new hire learned.** Lena processes receipts Sabine never showed. Every Save is checked against the guardrails before it is saved (Ledgerline's save guard). The tutor explains using Sabine's quote, Lena fixes it herself, and the mastery report shows what was respected first time, what was fixed after the tutor stepped in, and which steps were skipped.
5. **Trust.** **Off the record** mutes the mic, pauses screen vision and drops everything in that window from the Work Map. Personal data (emails, phone numbers, IBAN/card numbers, tax IDs) is **redacted before** anything reaches the agent, the vision model or the stored Work Map, and the vision model is instructed never to transcribe it. Screen frames are only sent when pixels change, downscaled, and never stored except as step thumbnails.

## Stretch goals

- ✅ **Agent-ready guardrails.** "Export for agents" turns the Work Map into instructions an AI agent can load: STOP conditions, decision rules with the expert's words, open questions.
- Any language: ElevenLabs agents speak the user's language; Sabine can explain in German, Lena learns in English.

## Tech

Next.js on Vercel · ElevenLabs Agents (Interviewer + Tutor, Gemini as the LLM, `skip_turn`, contextual updates) · Gemini vision on screen frames (only when pixels change) · Gemini builds the Work Map JSON · Ledgerline mock with an events-out / commands-in API (postMessage) · no database.

## Moonshot slide

**People first, then agents.** The same Work Map that teaches Lena lets an agent do the routine steps safely and hand back exactly where Sabine would have stopped. Every expert, every workflow, one living company memory: when the work changes, the apprentice asks only about what is new.

Path from today's MVP:
1. Today: one expert, one workflow, one new hire → Work Map + tutor + agent export.
2. Next: the always-on apprentice: no sessions, it notices a case it has never seen during everyday work and asks one question.
3. Then: Work Maps across teams; agents run the routine steps, people keep the judgment calls, and every guardrail traces back to a person's words.
