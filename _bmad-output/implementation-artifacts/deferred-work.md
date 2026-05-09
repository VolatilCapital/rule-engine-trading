# Deferred Work

## From spec-tsup-root-export-bundle.md (review 2026-05-07)

### Build/bundle script ordering (DX)
**Issue:** `pnpm bundle` requires `pnpm build` to have run first (tsup reads `dist/public-api.js`). No prebuild hook chains them. Same constraint as reference monorepos (`simulated-platform-monorepo`, `position-management-monorepo`).
**Failure mode:** After `pnpm clean`, running only `pnpm bundle` fails with "entry not found". Editing `src/` and running only `pnpm build` leaves `bundle/` stale → consumers/testkit see old runtime.
**Mitigation today:** Bundles are committed; fresh clones don't hit this. Discipline: always `pnpm clean && pnpm build && pnpm bundle`.
**Possible future fix:** Add `prepare` script chaining build+bundle, or root `bundle: "pnpm -r build && pnpm -r bundle"`.
**Source:** Edge case hunter findings #1, #2, #3 (review of spec-tsup-root-export-bundle.md).

### Sourcemap fidelity through tsup→dist→src chain
**Issue:** Tsup now consumes `dist/public-api.js` instead of `src/public-api.ts`. Tsc-emitted `.js.map` files reference `src/` paths; tsup-emitted bundle sourcemaps may not chain back through correctly.
**Impact:** Minor DX in debuggers when stepping into bundled code from a consumer. No correctness impact.
**Source:** Blind hunter finding #5.

### MAGIC_POSITION consumer migration
**Issue:** `MAGIC_POSITION/app/packages/rule-engine` and `MAGIC_POSITION_mobile-auth0/app/packages/rule-engine` import as `rule-engine-trading` (bare). New root export is subpath: `rule-engine-trading-monorepo/rule-engine-trading`.
**Required action:** In each consumer, either:
1. Update `package.json` dep to alias: `"rule-engine-trading": "npm:rule-engine-trading-monorepo@github:VolatilCapital/rule-engine-trading"` and import as `'rule-engine-trading/rule-engine-trading'` — OR —
2. Migrate all imports `from 'rule-engine-trading'` → `from 'rule-engine-trading-monorepo/rule-engine-trading'`.
**Files to migrate (approx):** `MAGIC_POSITION/app/packages/rule-engine/src/**/*.ts` (4+ import sites identified), `MAGIC_POSITION_mobile-auth0/app/packages/rule-engine/src/**/*.ts`.
**Source:** Spec frontmatter "Ask First" + acceptance auditor AC5 soft-pass.

## From spec-multi-unit-rule-parameters.md (split decision 2026-05-09)

The original intent ("rendre toutes les règles R-based multi-unité") was split into three sequential phases to keep each implementation focused and below context-rot risk. **Phase A** is the active spec. Phases B and C are queued and will be promoted to their own specs once A is merged.

### Phase B — Trailing-stop multi-unit
**Scope:**
- `packages/rule-engine-trading/src/templates/trailingStop.ts`: `distance: number` → `distance: Measurement`; `activationR?: number` → `activation?: Measurement`. Update `TrailingStopParams` and `trailingStopParamsMap` accordingly.
- `packages/rule-engine-trading-testkit/src/harness/RuleScenarioHarness.ts`: in the trailing block of `#buildContext`, dispatch on `distance.unit` for `candidateSL`:
  - R: existing `entryPrice + (currentR − distance.value) × riskPerUnit`
  - percent: `currentPrice × (1 − sign × distance.value / 100)` (sign=+1 LONG, −1 SHORT)
  - price: `currentPrice − sign × distance.value`
  Activation gating: read from `PROFIT_FIELD[activation.unit]` instead of hardcoded `currentR`.
- `packages/rule-engine-trading/src/templates/predefinedTemplates.ts`: split `TRAILING_STOP_TEMPLATE.parameters` into `distanceValue`/`distanceUnit` + `activationValue`/`activationUnit` flat fields.
- Public-api: nothing new (relies on Phase A's `Measurement` exports).
- Tests: integration scenarios LONG+SHORT × percent+price for trailing-stop in the testkit; unit tests for the trailing-stop template.
- README: update Trailing Stop section in `packages/rule-engine-trading/README.md`.

**Special note:** trailing-stop is the only template where `distance` and `activation` may use **independent** units (distance is geometric, activation is profit-from-entry).

### Phase C — Max-drawdown-from-peak multi-unit
**Scope:**
- `packages/rule-engine-trading/src/templates/maxDrawdownFromPeak.ts`: `minPeakR`, `maxDrawdownR`, `minCurrentR` → `minPeak`, `maxDrawdown`, `minCurrent`. All three must share the same unit (validate at factory). Predefined `MAX_DD_*` rewrite literals.
- `packages/rule-engine-trading/src/conditions/tradingConditions.ts`: refactor `createPeakRReachedCondition` (rename `createPeakReachedCondition`) and `createDrawdownFromPeakCondition` to consume `Measurement` (use `PEAK_FIELD[unit]` and `DRAWDOWN_FROM_PEAK_FIELD[unit]`).
- `packages/rule-engine-trading-testkit/src/harness/RuleScenarioHarness.ts`: track a `peakPrice` alongside `peakR` (the most-favorable price reached). Compute and inject in `#buildContext`: `peakPctFromEntry`, `peakPriceMove`, `drawdownFromPeakPct`, `drawdownFromPeakPrice` (all side-aware, profit-positive; drawdown floored at 0).
- `TestActionExecutor.ts`/`RuleScenarioHarness.ts` `TradingContextFacts`: add the four new optional numeric fields.
- `packages/rule-engine-trading/src/templates/predefinedTemplates.ts`: split `MAX_DRAWDOWN_FROM_PEAK_TEMPLATE.parameters` into flat value+unit fields.
- Tests: integration scenarios LONG+SHORT × percent+price for max-drawdown-from-peak; unit tests for the template.
- README: update Max Drawdown section.

**Source:** Multi-goal split decision after CHECKPOINT 1 of spec-multi-unit-rule-parameters.md (≥2200 tokens originally; broken into 3 cohesive phases).

