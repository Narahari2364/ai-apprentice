# Pitch: The AI Apprentice

## One line

Experts like Paul know rules that live only in their heads. Our AI Apprentice watches him work, asks *why* at the right moments, turns his answers into a Work Map, and coaches the next new hire in his own words.

## Problem (30 s)

- 11,200 Americans turn 65 every day; in Germany 12.9 M workers (~30 %) retire by 2036.
- What makes them good was never written down. Screen recordings show **what** happened, not **why**.
- Guardrails (limits, exceptions, when to stop and ask) are invisible. New hires learn them by breaking them.

Our case: **meal expenses** at Nordhaven Consulting, in the Ledgerline expense tool (based on Paul's real process, see the team's demo script). Paul never gets one rejected by finance; a new hire does. The rules that matter are in nobody's handbook:
over 30 per person needs a screenshot of the supervisor's written approval (date, amount, who was there); delivery apps (Bitebox in the demo, like Uber Eats) need both the receipt and the separately downloaded tax invoice, while sit-down restaurant receipts are enough on their own.

## Solution (30 s)

Three modules, one product:

1. **Capture.** Paul files expenses as usual. A voice apprentice (ElevenLabs) sees every screen action and stays quiet. At natural pauses it asks one short question: *"You switched it to Eat In. What made you do that?"*
2. **Map.** When she is done it runs a debrief, closes the gaps, explains the process back until she says *"yes, that's how it works"*, and builds a clickable **Work Map**: steps, decisions, reasons in her words, guardrails, each linked to the screen moment and the document.
3. **Teach.** Lena files a case Paul never showed. A voice tutor coaches her and **checks every Save against Paul's guardrails**. If she reaches for Take Away, Save is blocked: *"Paul would stop here. Why do you think?"* It replays Paul's moment, Lena fixes it herself, and she ends with a mastery report.

## Demo script (≈ 4 min)

Full wording: `AI apprentice demo script.pdf`. In the app:

| Time | Who | What happens |
|---|---|---|
| 0:00 | Narrator | Problem in 3 sentences. |
| 0:30 | Judge as **Paul**, `/capture` | Clicks **Apprentice** in Ledgerline's top bar → "What to expect" → **Start learning**, shares this tab. Files the 25 lunch (receipt only) and the 40 dinner (receipt + approval screenshot). Pause → *"You added a screenshot on this one that wasn't on the first one. What's that for?"* (attachments outlined in indigo). |
| 1:40 | Paul | Delivery order: attaches Bitebox receipt **and** invoice → *"Why isn't one enough?"* → follow-up *"Why didn't you need to do this for the other two meals?"* |
| 2:20 | Paul | **Off the record** once. **End task** → debrief: *"Does the 30 threshold ever change?"* → teach-back → *"Yep, that's it."* → **Build Work Map**. |
| 2:50 | `/map` | Steps, judgment calls, guardrails, each with Paul's words; click a step → Ledgerline opens the exact document. **Export for agents.** |
| 3:10 | Judge as **Lena**, `/teach` | **Apprentice → Start coaching**: *"First step: what do you upload?"* Attaches the receipt, saves → **blocked** (invoice missing). Adds the invoice, reaches for Save → **blocked**: *"Not yet. This one's 35. What does that number remind you of?"* → **▶ Replay** Paul's moment → attaches the approval → saved. |
| 3:45 | Lena | **Finish** → mastery report: delivery-invoice rule down cold; practise spotting the 30 threshold herself. |
| 3:55 | Narrator | Moonshot slide. |

Backup: a recorded full run, and the prepared Work Map (works without a live capture).

## The Apprentice Test: our answers

1. **When to ask.** We do not trust default turn-taking. The app sends the agent a `[PAUSE]` signal only when **all** hold: a judgment-relevant action just happened (an attachment, a guest, a key field, a save); no typing, mouse or screen event for 3.5 s; Paul is not talking; he has no document open (he is reading); and a question budget of one per 20 s. The panel shows the detector live: *Listening / Quiet / Asking*, and the field the question is about gets an indigo outline. While he narrates, the agent uses ElevenLabs' `skip_turn` and stays silent.
2. **What to ask.** Only judgment events trigger a question; typed amounts never do, because the screen already answers them. The agent gets the exact screen event plus the earlier expenses he saved, and is told to ask when **similar expenses were handled with different steps** ("You added a screenshot on this one that wasn't on the first one"), or about the reason, the limit, or when to stop and ask; never about what is visible. Over a session at least one question is about a guardrail.
3. **When it has understood.** In the debrief it asks at least three follow-ups that were not answered live, then explains the whole process back step by step. It is done only when Paul confirms; corrections are repeated back. The Work Map records `confirmed` and lists remaining **gaps** ("Who can approve when the supervisor is away?").
4. **Whether the new hire learned.** Lena processes a case Paul never showed (a 35 delivery dinner). Every Save is checked against the guardrails before it is saved (Ledgerline's save guard). The tutor explains using Paul's quote, Lena fixes it herself, and the mastery report shows what was respected first time, what was fixed after the tutor stepped in, and which steps were skipped.
5. **Trust.** **Off the record** mutes the mic, pauses screen vision and drops everything in that window from the Work Map. Personal data (emails, phone numbers, IBAN/card numbers, tax IDs) is **redacted before** anything reaches the agent, the vision model or the stored Work Map, and the vision model is instructed never to transcribe it. Screen frames are only sent when pixels change, downscaled, and never stored except as step thumbnails.

## Stretch goals

- ✅ **Agent-ready guardrails.** "Export for agents" turns the Work Map into instructions an AI agent can load: STOP conditions, decision rules with the expert's words, open questions.
- Any language: ElevenLabs agents speak the user's language; Paul can explain in German, Lena learns in English.

## Tech

Next.js on Vercel · ElevenLabs Agents (Interviewer + Tutor, Gemini as the LLM, `skip_turn`, contextual updates) · Gemini vision on screen frames (only when pixels change) · Gemini builds the Work Map JSON · Ledgerline mock with an events-out / commands-in API (postMessage) · no database.

## Moonshot slide

**People first, then agents.** The same Work Map that teaches Lena lets an agent do the routine steps safely and hand back exactly where Paul would have stopped. Every expert, every workflow, one living company memory: when the work changes, the apprentice asks only about what is new.

Path from today's MVP:
1. Today: one expert, one workflow, one new hire → Work Map + tutor + agent export.
2. Next: the always-on apprentice: no sessions, it notices a case it has never seen during everyday work and asks one question.
3. Then: Work Maps across teams; agents run the routine steps, people keep the judgment calls, and every guardrail traces back to a person's words.
