# Shared data formats

TypeScript source: `src/lib/types.ts`. If you change a format, change both files in the same commit and tell the team.

Times are `"mm:ss"` since the session started. Money is a plain number plus an ISO currency code.

## The work app: Ledgerline

`public/ledgerline.html` is the team's fake expense tool, embedded unchanged by `src/features/erp/LedgerlineFrame.tsx`.
The frame turns Ledgerline events into ScreenEvents, feeds typing/pointer activity to pause detection, and in Teach installs the Save guard.
`?user=sabine` (expert) or `?user=lena` (new hire). Hidden demo controls inside it: Alt+Shift+D.

### ExpenseSnapshot

What Ledgerline sends with form and save events (see `src/lib/types.ts`): amounts (`spent`, `meal_amount`, `drink_amount`, `tip_amount`),
`type_of_meal` ("Eat In" | "Take Away"), `guests[]`, `guest_count`, `amount_per_person`, `projects[]`, and `attachments[]` whose `facts`
say what each document is (`invoice` with `consumption` "im Haus"/"außer Haus", `order_confirmation` = not a tax invoice, `approval_email`, ...).

## ScreenEvent

```ts
{ time, invoiceId, type, field?, from?, to?, description, source: "dom" | "vision" }
```

- `type`: the Ledgerline event type, e.g. `report_created`, `expense_form_opened`, `field_changed`, `guest_added`, `attachment_added`, `document_opened`, `expense_saved`, `save_blocked` (guardrail), `validation_failed`.
- `invoiceId`: id of the record on screen (expense id or report number).
- `data`: raw ExpenseSnapshot when the event carries one.
- `field`, `from`, `to`: set for `field_changed` and `status_changed`.
- `description`: one human-readable sentence; this is what the voice agent reads.
- `source`: `"dom"` from the mock ERP, `"vision"` from the screen-capture model.

Example:

```json
{ "time": "02:40", "invoiceId": "exp_k2j9x1", "type": "field_changed", "field": "type_of_meal",
  "from": "Take Away", "to": "Eat In",
  "description": "Type of Meal changed from \"Take Away\" to \"Eat In\"", "source": "dom" }
```

All events go through the bus in `src/lib/events.ts`:
`emit(event)`, `subscribe(fn) → unsubscribe`, `getHistory()`, `resetSession()`, React hook `useScreenEvents()`.

## TranscriptLine

```ts
{ time, speaker: "expert" | "agent", text }
```

## WorkMapStep

```ts
{ id, order, title, time, screenshot?, decision, reason, expertQuote, guardrails: string[] }
```

- `time`: the screen moment this step links to.
- `decision`: empty string for routine steps; non-empty = judgment call.
- `expertQuote`: the expert's own words (required by the brief).

## WorkMap

```ts
{ task, steps: WorkMapStep[], gaps: string[], confirmed: boolean }
```

- `gaps`: open questions the debrief still needs to ask.
- `confirmed`: true once the expert accepted the teach-back.

## GuardrailResult (Teach)

```ts
{ ok: boolean, violations: { stepId, rule, explanation, fields }[] }
```

Returned by `checkGuardrails(expense, workMap)`; `ok: false` blocks Save in Ledgerline and highlights `fields`.

## Fake data (`src/data/`)

- `fakeSession.ts`: `fakeEvents` + `fakeTranscript` of Sabine filing four team meals.
- `sampleWorkMap.ts`: 7 steps, 4 judgment calls, 4 guardrails (Eat In vs Take Away, €30 per person, order confirmation is not an invoice, over €250 needs the company address).
