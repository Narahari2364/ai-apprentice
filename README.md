# The AI Apprentice

Built for Hack-Nation × ElevenLabs, 7th Global AI Hackathon (brief: [docs/challenge-brief.pdf](docs/challenge-brief.pdf)). An ElevenLabs voice agent watches an expert (Paul) submit meal expenses in Ledgerline, a fake expense tool, stays quiet while they type, and asks "why" at natural pauses. It then runs a debrief and builds a clickable **Work Map** of steps, decisions, reasons in the expert's own words, and guardrails. A voice tutor uses that map to coach a new hire on a case the expert never showed, and blocks wrong decisions at Save. There are three modules: **Capture**, **Map** and **Teach**.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in keys
npm run dev                  # http://localhost:3000
```

Stack: Next.js (App Router, TypeScript), Tailwind, `@elevenlabs/react` (coming next), Gemini through server routes. No database: client state plus localStorage. Deploys to Vercel.

Pages: `/` mode picker · `/capture` Ledgerline as Paul, Apprentice button in its top bar (learning mode) · `/map` Work Map (opens each step's document in Ledgerline) · `/teach` Ledgerline as Maya with the Save guard, Apprentice in teaching mode (progress, mastery report).

Data formats: [docs/formats.md](docs/formats.md). Fake data in `src/data/` means nobody waits on anyone.

## Folder ownership

Two people build the app. The split is **AI & voice** (logic, APIs, agents) vs **UI & experience** (everything you see).

| Track | Owns | What |
|---|---|---|
| AI & voice (branch `ai-voice`) | `src/app/api/`, `src/features/erp/LedgerlineFrame.tsx` (bridge), `src/features/capture/` logic, `src/features/teach/checkGuardrails.ts`, `src/features/workmap/buildWorkMap.ts`, `docs/agents.md` | ElevenLabs Interviewer + Tutor, pause detection, events → agent, debrief → Work Map (Gemini), guardrail rules |
| UI & experience (branch `ui`) | `src/app/**/page.tsx` layouts, `public/ledgerline/index.html` (the work app; only its story data is ours), `src/features/workmap/WorkMapView.tsx`, all `*Panel.tsx` visuals, `globals.css` | Design system, realistic ERP, Work Map timeline, agent/tutor panels, blocked-save alert, end-of-session scorecard |
| Pitch | `docs/pitch.md` | Pitch and demo script |
| shared | `src/lib/`, `src/data/` | Change only with a heads-up |

UI components take their data as **props** and render fake data until the AI track wires the real thing. That way neither side waits.

## Team rules

- Two branches: `ai-voice` and `ui`.
- Merge to `main` only when it runs (`npm run build` passes).
- `main` must always work.
- Stay in your own folder. Changes to `src/lib/types.ts` must also update `docs/formats.md`.
- Never commit `.env.local` or API keys.
