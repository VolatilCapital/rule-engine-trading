---
title: 'Multi-unit parameters — Phase C: max-drawdown-from-peak'
type: 'feature'
created: '2026-05-09'
status: 'in-progress'
baseline_commit: '6de4745'
context:
  - '{project-root}/packages/rule-engine-trading/src/templates/maxDrawdownFromPeak.ts'
  - '{project-root}/packages/rule-engine-trading/src/conditions/tradingConditions.ts'
  - '{project-root}/packages/rule-engine-trading/src/domain/Measurement.ts'
  - '{project-root}/packages/rule-engine-trading-testkit/src/harness/RuleScenarioHarness.ts'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-multi-unit-rule-parameters.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-multi-unit-rule-parameters-b-trailing.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `max-drawdown-from-peak` is the last R-only template. It tracks the peak profit reached during a trade and triggers when the drawdown from that peak exceeds a threshold. Today, peak and drawdown are only available in R via `peakR` and `drawdownFromPeakR`. Strategies that prefer to think in `%` of price or absolute price move cannot use this template.

**Approach:** Convert `minPeak`, `maxDrawdown`, and `minCurrent` to `Measurement`. All three must share the same unit (drawdown is a difference, mixing units is meaningless). Refactor the two peak-related conditions (`createPeakRReachedCondition` → `createPeakReachedCondition`, `createDrawdownFromPeakCondition`) to consume `Measurement` and look up the field via `PEAK_FIELD` / `DRAWDOWN_FROM_PEAK_FIELD` (both already defined in Phase A's `Measurement.ts`). The hexagonal adapter (testkit harness) gains a tracked `peakPrice` and emits four new context fields side-awarely: `peakPctFromEntry`, `peakPriceMove`, `drawdownFromPeakPct`, `drawdownFromPeakPrice`.

## Boundaries & Constraints

**Always:**
- Reuse Phase A primitives: `Measurement`, `assertMeasurement`, `Unit`, `PEAK_FIELD`, `DRAWDOWN_FROM_PEAK_FIELD`. Do not redefine.
- All three measurements (`minPeak`, `maxDrawdown`, `minCurrent`) of a single template instance must share the **same unit**. Validate at factory and throw on mismatch.
- For `percent` and `price`, peak and drawdown values are **side-aware, profit-positive** (peak is the most-favorable-ever value; drawdown is `peak − current`, floored at 0).
- The harness tracks `peakPrice` as the most favorable price reached during the trade lifetime (alongside the existing `#peakR`).
- Predefined `MAX_DD_*` constants keep their identifiers; their literals are rewritten as `{ value: X, unit: 'R' }`.
- `MAX_DRAWDOWN_FROM_PEAK_TEMPLATE.parameters` UI metadata splits each measurement into `<name>Value` + `<name>Unit` flat fields, mirroring Phases A and B.
- Existing R-only behaviour is preserved bit-for-bit when all three measurements use `unit: 'R'`.
- `createPeakRReachedCondition` is renamed to `createPeakReachedCondition` (drop the `R` suffix). Update all call sites and the public-api re-export.

**Ask First:**
- Adding a fourth unit (`pips`, `ATR`...) — out of scope.
- Renaming `peakR` / `drawdownFromPeakR` — these stay as the canonical R-unit fields.

**Never:**
- Computing percent or price formulas in `maxDrawdownFromPeak.ts` or `tradingConditions.ts`.
- Touching Phase A files beyond what the spec lists (no edits to `Measurement.ts`, `tradingConditions.ts` profit helpers, or any of the static templates).
- Touching `trailingStop.ts` (Phase B).
- Introducing backward-compat aliases for the old `minPeakR` / `maxDrawdownR` / `minCurrentR` shape, nor for the renamed condition factory.
- Changing how the harness's `currentPctFromEntry` / `currentPriceMove` / `#sideSign` are computed (Phase A).

## I/O & Edge-Case Matrix

Conventions: `entry = E`, `currentPrice = P`, `initialSL = SL`, `riskPerUnit = E − SL`. `sign = +1` LONG, `−1` SHORT. All formulas live in the harness adapter.

| Scenario | Input / State | Adapter computes | Outcome |
|----------|---------------|------------------|---------|
| LONG peakPrice tracking | `E=100, SL=99, side=BUY`, ticks 100 → 102 → 101 → 103 → 100.5 | `peakPrice = 103` (most favorable seen) | `peakPriceMove = 3`, `peakPctFromEntry = 3` |
| SHORT peakPrice tracking | `E=100, SL=101, side=SELL`, ticks 100 → 98 → 99 → 97 → 99.5 | `peakPrice = 97` (most favorable for SHORT) | `peakPriceMove = 3`, `peakPctFromEntry = 3` |
| Drawdown LONG, percent | After above LONG, current=101 | `drawdownFromPeakPct = peakPctFromEntry − currentPctFromEntry = 3 − 1 = 2` | Triggers `maxDrawdown: {2,'percent'}` |
| Drawdown floor | currentPctFromEntry > peakPctFromEntry (transient ordering) | `drawdownFromPeakPct = max(0, peak − current)` | Always ≥ 0 |
| Max-DD all in R | `{ minPeak: {3,'R'}, maxDrawdown: {1.5,'R'} }` | Conditions on `peakR ≥ 3` AND `drawdownFromPeakR ≥ 1.5` | Existing behaviour preserved |
| Max-DD all in % | `{ minPeak: {2,'percent'}, maxDrawdown: {1,'percent'} }` | Conditions on `peakPctFromEntry ≥ 2` AND `drawdownFromPeakPct ≥ 1` | New |
| Max-DD all in price | `{ minPeak: {2,'price'}, maxDrawdown: {1,'price'} }` | Conditions on `peakPriceMove ≥ 2` AND `drawdownFromPeakPrice ≥ 1` | New |
| Mismatched units | `{ minPeak: {3,'R'}, maxDrawdown: {1,'percent'} }` | Factory throws | `Error("minPeak, maxDrawdown, and minCurrent must share the same unit")` |
| Mismatched minCurrent | `{ minPeak: {3,'R'}, maxDrawdown: {1.5,'R'}, minCurrent: {0.5,'percent'} }` | Factory throws | Same message |
| Optional minCurrent | `minCurrent` omitted | Factory accepts; condition list excludes the `min_current_*` check | Existing behaviour |
| Negative `minPeak` | `{ minPeak: {0,'R'}, ... }` | Factory throws | `Error("minPeak.value must be > 0")` |
| Invalid unit | `{ minPeak: { value: 2, unit: 'pips' }, ... }` | Factory throws | `Error("minPeak.unit must be one of R | percent | price")` |
| Reset on new position | `openPosition()` called twice | `peakPrice` resets to `entryPrice` for the new trade | Mirrors `#peakR = 0` reset |

</frozen-after-approval>

## Code Map

- `packages/rule-engine-trading/src/conditions/tradingConditions.ts` -- Rename `createPeakRReachedCondition` → `createPeakReachedCondition`. Both it and `createDrawdownFromPeakCondition` now take a `Measurement` and look up the field via `PEAK_FIELD[unit]` and `DRAWDOWN_FROM_PEAK_FIELD[unit]`. Drop the old R-numeric signatures (no shim).
- `packages/rule-engine-trading/src/templates/maxDrawdownFromPeak.ts` -- `minPeakR`, `maxDrawdownR`, `minCurrentR` → `minPeak`, `maxDrawdown`, `minCurrent`. Validate via `assertMeasurement`. Same-unit validation across the three measurements (use the unit of the first defined measurement as reference). Predefined `MAX_DD_*` rewrite literals to `{ value: X, unit: 'R' }`. Update `MaxDrawdownFromPeakTemplateParams` and JSDoc. The conditions emitted now use the renamed `createPeakReachedCondition` and the unit-aware drawdown helper.
- `packages/rule-engine-trading/src/templates/predefinedTemplates.ts` -- `MAX_DRAWDOWN_FROM_PEAK_TEMPLATE.parameters` becomes flat fields: `minPeakValue` (number, default 3, min 1, max 20), `minPeakUnit` (string, default `'R'`, options `['R','percent','price']`), `maxDrawdownValue` (number, default 1.5, min 0.5, max 10), `maxDrawdownUnit` (same options), `minCurrentValue` (number, default 0, min 0, max 10 — `0` means "omit"), `minCurrentUnit` (same options), `closePercentage` unchanged. The `create` wrapper reassembles `Measurement` and omits `minCurrent` when `minCurrentValue <= 0`.
- `packages/rule-engine-trading/src/public-api.ts` -- Re-export `createPeakReachedCondition` (replace `createPeakRReachedCondition`); the `createDrawdownFromPeakCondition` re-export stays (signature changed but name unchanged).
- `packages/rule-engine-trading-testkit/src/harness/TestActionExecutor.ts` -- Extend `TradingExecutionContext` with four new optional numeric fields: `peakPctFromEntry`, `peakPriceMove`, `drawdownFromPeakPct`, `drawdownFromPeakPrice`.
- `packages/rule-engine-trading-testkit/src/harness/RuleScenarioHarness.ts` --
  - In `TradingContextFacts`: add the four new fields.
  - Add a private `#peakPrice: number | null = null` (initialized to `entryPrice` when a position opens; reset alongside `#peakR = 0`).
  - In `#buildContext`: update `#peakPrice` using the side-aware "most-favorable seen" rule:
    - LONG (sign=+1): `if (currentPrice > #peakPrice) #peakPrice = currentPrice`
    - SHORT (sign=−1): `if (currentPrice < #peakPrice) #peakPrice = currentPrice`
  - Compute and inject:
    - `peakPriceMove = sign × (#peakPrice − entryPrice)` (always ≥ 0 by construction)
    - `peakPctFromEntry = (peakPriceMove / entryPrice) × 100` if `entryPrice !== 0`, else 0
    - `drawdownFromPeakPct = max(0, peakPctFromEntry − currentPctFromEntry)`
    - `drawdownFromPeakPrice = max(0, peakPriceMove − currentPriceMove)`
  - Existing `peakR` and `drawdownFromPeakR` computation stays unchanged.
- `packages/rule-engine-trading/__tests__/templates/maxDrawdownFromPeak.test.ts` -- **NEW.** Unit tests asserting:
  - `assertMeasurement` errors for malformed measurements.
  - Same-unit validation throws when units mismatch (across each pair).
  - Emitted condition list uses `peakR` for R, `peakPctFromEntry` for percent, `peakPriceMove` for price (and same for drawdown).
  - `MAX_DD_*` predefined constants compile and emit conditions on R fields.
- `packages/rule-engine-trading/__tests__/conditions/tradingConditions.test.ts` -- Update existing R-numeric tests to use `Measurement` for the renamed `createPeakReachedCondition` and `createDrawdownFromPeakCondition`. Add unit-dispatch coverage.
- `packages/rule-engine-trading-testkit/__tests__/multiUnit.peakDrawdown.scenarios.test.ts` -- **NEW.** Integration scenarios covering:
  - LONG `peakPrice` tracking through up/down ticks.
  - SHORT `peakPrice` tracking through down/up ticks.
  - Max-DD trigger in `percent` (LONG and SHORT).
  - Max-DD trigger in `price` (LONG and SHORT).
  - `drawdownFromPeakPct` floor at 0 when current transiently exceeds peak.
  - `peakPrice` reset on new position open.
  - R-only baseline regression: a single existing-style scenario expressed via the new `Measurement` API still produces identical condition firings.
- `packages/rule-engine-trading/README.md` -- Update the `Max Drawdown from Peak` section: parameter table to `Measurement`, three short examples (R, percent, price), one-liner that the three measurements must share the same unit.

## Tasks & Acceptance

**Execution:**
- [ ] `packages/rule-engine-trading/src/conditions/tradingConditions.ts` -- rename `createPeakRReachedCondition` → `createPeakReachedCondition`, refactor both peak/drawdown helpers to consume `Measurement` -- conditions become unit-aware
- [ ] `packages/rule-engine-trading/src/templates/maxDrawdownFromPeak.ts` -- rewrite `MaxDrawdownFromPeakTemplateParams` using `Measurement`, add same-unit validation, rewrite predefined `MAX_DD_*` literals -- enables % and price drawdown triggers
- [ ] `packages/rule-engine-trading/src/templates/predefinedTemplates.ts` -- split `MAX_DRAWDOWN_FROM_PEAK_TEMPLATE.parameters` into flat value+unit fields, add reassembling `create` wrapper -- preserves UI rendering
- [ ] `packages/rule-engine-trading/src/public-api.ts` -- swap `createPeakRReachedCondition` re-export for `createPeakReachedCondition` -- consumers see the new name
- [ ] `packages/rule-engine-trading-testkit/src/harness/TestActionExecutor.ts` -- add four new optional context fields -- type contract matches runtime
- [ ] `packages/rule-engine-trading-testkit/src/harness/RuleScenarioHarness.ts` -- add `#peakPrice` tracking, compute and inject the four new context fields, reset on position open -- adapter does all conversion
- [ ] `packages/rule-engine-trading/__tests__/templates/maxDrawdownFromPeak.test.ts` -- new unit tests asserting validation errors and per-unit condition emission -- locks the contract
- [ ] `packages/rule-engine-trading/__tests__/conditions/tradingConditions.test.ts` -- update existing tests for the renamed/refactored helpers; add per-unit coverage -- locks the condition contract
- [ ] `packages/rule-engine-trading-testkit/__tests__/multiUnit.peakDrawdown.scenarios.test.ts` -- new LONG+SHORT × percent+price scenarios, peak reset, drawdown floor, R-only regression -- proves the adapter pipeline
- [ ] `packages/rule-engine-trading/README.md` -- update Max Drawdown section -- public docs

**Acceptance Criteria:**
- Given any `unit ∈ {R, percent, price}` and any combination of `minPeak` / `maxDrawdown` / `minCurrent`, no source file under `packages/rule-engine-trading/src/templates/` or `.../src/conditions/` performs `*`, `/`, `+`, or `-` against `currentPrice`, `entryPrice`, `peakPrice`, or any percent value.
- Given the testkit harness on a LONG with `entry=100, SL=99` and ticks `100, 102, 101, 103, 100.5`, then on the last tick: `peakPrice=103`, `peakPriceMove=3`, `peakPctFromEntry=3`, `drawdownFromPeakPrice=2.5`, `drawdownFromPeakPct=2.5`. Same-shape SHORT scenario (`entry=100, SL=101, ticks 100, 98, 99, 97, 99.5`): identical positive values (`peakPriceMove=3`, etc.).
- Given a `max-drawdown-from-peak` template with mismatched units across `minPeak` / `maxDrawdown` / `minCurrent`, the factory throws synchronously with a message naming all three parameter names.
- Given the existing R-only `MAX_DD_*` predefined constants, all pre-Phase-C testkit scenarios that exercise them pass with byte-identical condition firings.
- Given `pnpm --filter @volatil/rule-engine-trading test && pnpm --filter @volatil/rule-engine-trading-testkit test`, all tests pass.
- Given `pnpm --filter @volatil/rule-engine-trading build && pnpm --filter @volatil/rule-engine-trading bundle`, both succeed.
- After this phase, the original full-scope intent is satisfied: every R-based template (`take-profit`, `take-partial`, `move-sl-to-breakeven`, `lock-in-profit-stop`, `free-trade`, `pattern-based-exit`, `trailing-stop`, `max-drawdown-from-peak`) accepts `Measurement` parameters in any of the three units.

## Spec Change Log

## Design Notes

**peakPrice tracking (illustration, in adapter):**
```ts
// At openPosition():
this.#peakPrice = opts.entry;
this.#peakR = 0;

// In #buildContext(), before computing peakPctFromEntry / peakPriceMove:
if (this.#peakPrice === null) this.#peakPrice = entryPrice;
if (sign === 1 ? currentPrice > this.#peakPrice : currentPrice < this.#peakPrice) {
  this.#peakPrice = currentPrice;
}
const peakPriceMove = sign * (this.#peakPrice - entryPrice);
const peakPctFromEntry = entryPrice !== 0 ? (peakPriceMove / entryPrice) * 100 : 0;
const drawdownFromPeakPct = Math.max(0, peakPctFromEntry - currentPctFromEntry);
const drawdownFromPeakPrice = Math.max(0, peakPriceMove - currentPriceMove);
```

**Same-unit validation (illustration, in factory):**
```ts
const units = [minPeak.unit, maxDrawdown.unit, minCurrent?.unit]
  .filter((u): u is Unit => u !== undefined);
const allSame = units.every(u => u === units[0]);
if (!allSame) throw new Error(
  'minPeak, maxDrawdown, and minCurrent must share the same unit'
);
```

**Why `peakPctFromEntry`/`peakPriceMove` are profit-positive:**
By construction of `#peakPrice` (most favorable seen) and the `sign` factor, the peak quantities mirror the convention already in place for `currentR`/`currentPctFromEntry`/`currentPriceMove`. This keeps the conditions trivial: `peakX ≥ minPeak.value` reads naturally for both LONG and SHORT.

## Verification

**Commands:**
- `pnpm --filter @volatil/rule-engine-trading build` -- expected: tsc exits 0; `dist/public-api.d.ts` exports `createPeakReachedCondition` (and no longer `createPeakRReachedCondition`)
- `pnpm --filter @volatil/rule-engine-trading bundle` -- expected: tsup exits 0
- `pnpm --filter @volatil/rule-engine-trading test` -- expected: all unit tests pass, including new maxDrawdownFromPeak tests and updated tradingConditions tests
- `pnpm --filter @volatil/rule-engine-trading-testkit test` -- expected: all integration scenarios pass, including new multiUnit.peakDrawdown scenarios
- `grep -nrE '(currentPrice|entryPrice|peakPrice).*[+\-*/]' packages/rule-engine-trading/src/templates/ packages/rule-engine-trading/src/conditions/` -- expected: no match
