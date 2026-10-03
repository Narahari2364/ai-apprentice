# Shared data formats

TypeScript source: `src/lib/types.ts`. If you change a format, change both files in the same commit and tell the team.

Times are `"mm:ss"` since the session started. Money is a plain number plus an ISO currency code.

## Invoice

```ts
{ id, supplier, amount, currency, description, costCenter, assetNumber, status }
```

| Field | Type | Notes |
|---|---|---|
| id | string | e.g. `"4471"` |
| supplier | string | |
| amount | number | `8450` |
| currency | string | `"EUR"` |
| description | string | |
| costCenter | `"4711"` \| `"0400"` | 4711 = opex, 0400 = capex |
| assetNumber | string | `""` when none |
| status | `"open"` \| `"approved"` \| `"on_hold"` \| `"pending_2nd_approval"` | |

## ScreenEvent

```ts
{ time, invoiceId, type, field?, from?, to?, description, source: "dom" | "vision" }
```

- `type`: `"invoice_opened"` \| `"field_changed"` \| `"status_changed"` \| `"saved"` \| `"save_blocked"`
- `field`, `from`, `to`: set for `field_changed` and `status_changed`.
- `description`: one human-readable sentence; this is what the voice agent reads.
- `source`: `"dom"` from the mock ERP, `"vision"` from the screen-capture model.

Example:

```json
{ "time": "03:12", "invoiceId": "4471", "type": "field_changed", "field": "costCenter",
  "from": "4711", "to": "0400",
  "description": "Invoice 4471: cost center changed from 4711 (opex) to 0400 (capex)", "source": "dom" }
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
{ ok: boolean, violations: { stepId, rule, explanation }[] }
```

Returned by `checkGuardrails(invoice, workMap)`; `ok: false` blocks Save in the ERP.

## Fake data (`src/data/`)

- `invoices.ts` — `expertInvoices` (4471 capex re-code, 4472 Brandt December hold, 4473 Czech 2nd approval) and `teachInvoice` (5120, €7,200 equipment, never shown to the expert).
- `fakeSession.ts` — `fakeEvents` + `fakeTranscript` of a full expert session.
- `sampleWorkMap.ts` — 7 steps, 3 judgment calls, 4 guardrails.
