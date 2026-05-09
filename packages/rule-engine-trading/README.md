# @volatil/rule-engine-trading

Trading rule definitions — templates, actions, conditions, registry, and schemas for the rule-engine.

## Measurement

Several templates take their thresholds as a `Measurement` so the same rule
can be expressed in R-multiples, percent of price, or absolute price move:

```ts
export type Unit = 'R' | 'percent' | 'price';
export interface Measurement { readonly value: number; readonly unit: Unit; }
```

| Unit | Compares against context field | Example |
|---|---|---|
| `R` | `currentR` | `{ value: 2, unit: 'R' }` |
| `percent` | `currentPctFromEntry` | `{ value: 1.5, unit: 'percent' }` |
| `price` | `currentPriceMove` | `{ value: 0.5, unit: 'price' }` |

The mapping is fixed by `PROFIT_FIELD` in `domain/Measurement.ts`. The
`currentPctFromEntry` and `currentPriceMove` fields are populated **side-awarely
and profit-positive** by the adapter (testkit harness or production context
builder), so a rule does not need to know whether the trade is LONG or SHORT.

Coupled measurements (`trigger`/`lockIn`, `trigger`/`recover`) must share the
same unit; the factory throws synchronously otherwise.

The bundled validator `assertMeasurement(name, m, opts?)` enforces the shape
and a positive value (`opts.allowZero` lifts the floor to `>= 0`).

## Templates

### Trailing Stop

Continuous rule (first `isRecurring: true` template) that dynamically moves the
stop loss as price advances. Both `distance` (the geometric step the SL trails
the price by) and the optional `activation` threshold (profit-from-entry that
must be reached before trailing arms) are `Measurement` values and may use
**independent units** — `distance` is a geometric offset, `activation` is a
profit-from-entry gate.

```ts
import { createTrailingStopTemplate } from '@volatil/rule-engine-trading';

// Trailing 0.5R, activates immediately
const trailing = createTrailingStopTemplate({
  distance: { value: 0.5, unit: 'R' },
});

// Trailing 0.5R, activates only after 1R profit
const trailingAct = createTrailingStopTemplate({
  distance: { value: 0.5, unit: 'R' },
  activation: { value: 1, unit: 'R' },
});

// Trailing 0.5 % of price, no activation
const trailingPct = createTrailingStopTemplate({
  distance: { value: 0.5, unit: 'percent' },
});

// Trailing 0.3 in price, mixed-unit gate (arms once profit reaches 1R)
const trailingMixed = createTrailingStopTemplate({
  distance: { value: 0.3, unit: 'price' },
  activation: { value: 1, unit: 'R' },
});
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `distance` | `Measurement` (`R`, `percent`, `price`) | Yes | Trailing distance from the current price (`value > 0`). |
| `activation` | `Measurement` (`R`, `percent`, `price`) | No | Profit-from-entry threshold that must be reached before trailing arms. Omit to start immediately. Once armed, stays armed permanently (sticky). May use a different unit than `distance`. |

**Behavior:**
- Adapter computes the candidate SL per `distance.unit`:
  - `R`:       `entry + (currentR − distance.value) × riskPerUnit`
  - `percent`: `currentPrice × (1 − sign × distance.value / 100)`
  - `price`:   `currentPrice − sign × distance.value`
  where `sign = +1` for BUY, `−1` for SELL.
- Activation is dispatched on `activation.unit` against the matching `PROFIT_FIELD` (`currentR`, `currentPctFromEntry`, or `currentPriceMove`) and is sticky once met.
- Moves SL only when the candidate is more favorable than the current SL (BUY: higher, SELL: lower). Favorability is unit-agnostic — it depends on the trade direction, not on `distance.unit`.
- Stays `ACTIVE` after each execution (`isRecurring: true`) — re-evaluates on the next tick.
- The `trailingShouldExecute` context field gates execution (1 = fire, 0 = skip).

**Context helpers** (populated by the harness or production context builder):

| Field | Type | Description |
|---|---|---|
| `trailingNewSL` | `number` | Candidate new SL price |
| `trailingShouldExecute` | `0 \| 1` | 1 when activation is met AND candidate SL is favorable |

### Max Drawdown from Peak

Closes (or partially closes) the position when the drawdown from the
most-favorable-ever profit-from-entry exceeds a configurable threshold. All
three measurement parameters (`minPeak`, `maxDrawdown`, optional `minCurrent`)
**must share the same unit** — drawdown is a difference, mixing units would
be meaningless. The factory throws synchronously on a unit mismatch.

```ts
import { createMaxDrawdownFromPeakTemplate } from '@volatil/rule-engine-trading';

// R: close once a +3R peak gives back 1.5R.
const ddR = createMaxDrawdownFromPeakTemplate({
  minPeak: { value: 3, unit: 'R' },
  maxDrawdown: { value: 1.5, unit: 'R' },
});

// Percent: close once a +2% peak gives back 1%.
const ddPct = createMaxDrawdownFromPeakTemplate({
  minPeak: { value: 2, unit: 'percent' },
  maxDrawdown: { value: 1, unit: 'percent' },
});

// Price: close once a +0.0050 peak gives back 0.0020, but only while still up at least 0.0010.
const ddPrice = createMaxDrawdownFromPeakTemplate({
  minPeak: { value: 0.0050, unit: 'price' },
  maxDrawdown: { value: 0.0020, unit: 'price' },
  minCurrent: { value: 0.0010, unit: 'price' },
});
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `minPeak` | `Measurement` (`R`, `percent`, `price`) | Yes | Minimum peak required before the rule activates. `value > 0`. |
| `maxDrawdown` | `Measurement` (same unit as `minPeak`) | Yes | Drawdown from the peak that triggers the close. `value > 0`. |
| `minCurrent` | `Measurement` (same unit) | No | Optional: still requires the current profit-from-entry to be ≥ this value. `value >= 0`. |
| `closePercentage` | `number` (0, 100] | No | Defaults to 100 (full close). |
| `ruleId` | `string` | No | Disambiguates the auto-generated fact key. |

**Behavior:** the adapter tracks `peakPrice` side-awarely (most favorable seen)
and exposes the matching context fields per unit:

| Unit | Peak field | Drawdown field |
|---|---|---|
| `R` | `peakR` | `drawdownFromPeakR` |
| `percent` | `peakPctFromEntry` | `drawdownFromPeakPct` |
| `price` | `peakPriceMove` | `drawdownFromPeakPrice` |

All peak/drawdown quantities are profit-positive by construction, so the
condition `peakX ≥ minPeak.value` reads naturally for both LONG and SHORT.

Predefined R-only constants keep their identifiers — `MAX_DD_4R_PEAK_25R_DD`,
`MAX_DD_3R_PEAK_15R_DD`, `MAX_DD_2R_PEAK_1R_DD`, `MAX_DD_5R_PEAK_2R_DD_MIN_1R` —
and were rewritten in terms of `{ value: X, unit: 'R' }`.

### Multi-unit templates (Phase A)

The following six templates accept `Measurement` parameters:

| Template | Parameters |
|---|---|
| `take-profit` | `threshold: Measurement` |
| `take-partial` | `threshold: Measurement`, `closePercentage: number`, `partialId?: string` |
| `move-sl-to-breakeven` | `threshold: Measurement` |
| `lock-in-profit-stop` | `trigger: Measurement`, `lockIn: Measurement` (same unit; `lockIn.value < trigger.value`), `ruleId?: string` |
| `free-trade` | `trigger: Measurement`, `recover: Measurement` (same unit; `trigger.value >= recover.value`), `ruleId?: string` |
| `pattern-based-exit` | `positionDirection`, `minProfit?: Measurement`, `closePercentage?`, `patternNames?`, `timeframe?`, `ruleId?` |

Predefined named instances (`TAKE_PARTIAL_*`, `LOCK_IN_*`, `FREE_TRADE_*`,
`PATTERN_EXIT_*`) keep their identifiers; their literals were rewritten as
`{ value: X, unit: 'R' }`.

### All templates

| ID | Category | Maturity | isRecurring |
|---|---|---|---|
| `move-sl-to-breakeven` | `stop-loss` | `stable` | false |
| `take-partial` | `take-profit` | `stable` | false |
| `take-profit` | `take-profit` | `stable` | false |
| `free-trade` | `risk-management` | `stable` | false |
| `partial-close-at-price` | `take-profit` | `stable` | false |
| `max-drawdown-from-peak` | `risk-management` | `stable` | false |
| `lock-in-profit-stop` | `stop-loss` | `stable` | false |
| `pattern-based-exit` | `exit` | `stable` | false |
| `time-based-stop` | `exit` | `stable` | false |
| `cancel-pending-on-price-level` | `risk-management` | `stable` | false |
| `trailing-stop` | `stop-loss` | `lab` | **true** |

## Build

```bash
pnpm --filter @volatil/rule-engine-trading build   # tsc → dist/
pnpm --filter @volatil/rule-engine-trading bundle  # tsup → bundle/
```
