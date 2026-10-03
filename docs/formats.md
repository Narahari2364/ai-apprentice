# Shared data formats

TypeScript source: `src/lib/types.ts`. If you change a format, change both files in the same commit and tell the team.

Times are `"mm:ss"` since the session started. Money is a plain number plus an ISO currency code.

## The work app: Ledgerline

`public/ledgerline/index.html` is the team's fake expense tool, copied **unchanged** (read its header comment for the full API).
Our app embeds it in an iframe (`src/features/erp/LedgerlineFrame.tsx`, scaled to fit its 1180px minimum) and talks to it only through
`src/lib/ledgerline.ts`:

| Function | What it does |
|---|---|
| `attachLedgerline(iframe)` | Listens for `{source: 'expense-demo', event}` postMessages from that iframe |
| `onLedgerlineEvent(fn)` | Raw Ledgerline events (Teach uses it to answer `save_requested`) |
| `sendCommand({cmd, ...})` | Posts `{target: 'expense-demo', cmd, ...}`: `save_decision`, `open_document`, `highlight`, `switch_user`, `reset`, `new_session`, ... |
| `toScreenEvent(e)` | Ledgerline event → ScreenEvent; every event is published on the shared bus, `user_activity` goes to `markActivity()` for pause detection |

URLs: `/ledgerline/index.html?user=sabine` (Capture, /map) and `?user=lena&guard=1` (Teach: every Save waits for our `save_decision`).
Hidden demo controls inside Ledgerline: Alt+Shift+D (reset data, switch user, test a blocked save).

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
- `docId`: Ledgerline document involved (receipt, invoice, approval email), used to link Work Map steps.
- `data`: raw ExpenseSnapshot when the event carries one.
- `field`, `from`, `to`: set for `field_changed`.
- `description`: one human-readable sentence; this is what the voice agent reads.
- `source`: `"dom"` from Ledgerline, `"vision"` from the screen-capture model.

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
{ id, order, title, time, screenshot?, docId?, decision, reason, expertQuote, guardrails: string[] }
```

- `time`: the screen moment this step links to.
- `decision`: empty string for routine steps; non-empty = judgment call.
- `expertQuote`: the expert's own words (required by the brief).
- `docId`: Ledgerline document for the step; clicking the step on /map opens it with `open_document`.

## WorkMap

```ts
{ task, steps: WorkMapStep[], gaps: string[], confirmed: boolean }
```

- `gaps`: open questions the debrief still needs to ask.
- `confirmed`: true once the expert accepted the teach-back.

## GuardrailResult (Teach)

```ts
{ ok: boolean, applicable: RuleKey[], violations: { key, stepId, rule, explanation, fields }[] }
```

Returned by `checkGuardrails(expense, workMap)`. Teach sends it back as `save_decision`: `allow: false` blocks the Save, shows the message in Sabine's words and highlights `fields`.
`RuleKey`: `type_of_meal` | `small_meals` | `tax_invoice` | `company_address`.

## Voice agent surface (`src/features/capture/agent.ts`)

`onLedgerlineEvent(fn)`, `sendToAgent(text, { respond? })` (silent context, or make the agent speak), and `AgentUiState`
(`not_started` | `connecting` | `listening` | `quiet` | `asking` | `off_record` | `debrief` | `building`).

## Fake data (`src/data/`)

- `fakeSession.ts`: `fakeEvents` + `fakeTranscript` of Sabine filing four team meals.
- `sampleWorkMap.ts`: 7 steps, 4 judgment calls, 4 guardrails (Eat In vs Take Away, €30 per person, order confirmation is not an invoice, over €250 needs the company address).
- `invoices.ts`: legacy data for the old invoice mock ERP (`src/features/erp/MockErp.tsx`), no longer used.
