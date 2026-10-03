# The AI Apprentice

Built for Hack-Nation × ElevenLabs, 7th Global AI Hackathon (brief: [docs/challenge-brief.pdf](docs/challenge-brief.pdf)). An ElevenLabs voice agent watches an accounts-payable expert work invoices in a mock ERP, stays quiet while they type, and asks "why" at natural pauses. It then runs a debrief and builds a clickable **Work Map** of steps, decisions, reasons in the expert's own words, and guardrails. A voice tutor uses that map to coach a new hire on a case the expert never showed, and blocks wrong decisions at Save. There are three modules: **Capture**, **Map** and **Teach**.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in keys
npm run dev                  # http://localhost:3000
```

Stack: Next.js (App Router, TypeScript), Tailwind, `@elevenlabs/react` (coming next), Gemini through server routes. No database: client state plus localStorage. Deploys to Vercel.

Pages: `/` mode picker · `/capture` ERP, voice agent and live event log · `/map` Work Map · `/teach` ERP with teach invoice and tutor.

Data formats: [docs/formats.md](docs/formats.md). Fake data in `src/data/` means nobody waits on anyone.

## Folder ownership

| Path | Owner | What |
|---|---|---|
| `src/features/capture/` | CS 1 | Screen capture, vision, voice agent, pause detection |
| `src/features/erp/`, `src/features/workmap/`, `src/features/teach/` | CS 2 | Mock ERP, Work Map, tutor and guardrail check |
| `docs/agents.md` | MBA 1 | Interviewer and Tutor system prompts |
| `docs/pitch.md` | MBA 2 | Pitch and demo script |
| `src/lib/`, `src/data/`, `src/app/` | shared | Change only with a heads-up in the team chat |

## Team rules

- One branch per person: `capture`, `erp-map-teach`, `agents`, `pitch`.
- Merge to `main` only when it runs (`npm run build` passes).
- `main` must always work.
- Stay in your own folder. Changes to `src/lib/types.ts` must also update `docs/formats.md`.
- Never commit `.env.local` or API keys.
