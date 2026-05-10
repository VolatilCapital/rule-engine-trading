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

## Completed (was in deferred-work prior to 2026-05-10)

### Phase B — Trailing-stop multi-unit (DONE — commit 6de4745)
### Phase C — Max-drawdown-from-peak multi-unit (DONE — commit a93602c)

All three phases (A/B/C) are complete and merged on `main`. 198 tests pass.

