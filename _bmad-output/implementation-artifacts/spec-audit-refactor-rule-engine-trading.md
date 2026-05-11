---
title: 'Audit & Refactor — @volatil/rule-engine-trading'
type: 'refactor'
created: '2026-05-11'
status: 'draft'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The `@volatil/rule-engine-trading` package has several TypeScript strict-mode violations (`any` types, unsafe generics, missing literal unions), inconsistent language in comments (French mixed with English), and a deprecated schema still exported from the public API. These erode type safety and maintainability.

**Approach:** Targeted, incremental fixes — no architectural restructuring. Fix type holes, standardize language to English, remove dead public API surface, and split the oversized `predefinedTemplates.ts` without changing behavior.

## Boundaries & Constraints

**Always:**
- Preserve all existing behavior — zero functional change
- All 122 existing tests must remain green
- TypeScript strict mode must have zero new violations
- No `any` without explicit documented justification
- No breaking changes to the public API (no exported symbol removal, no parameter shape change)

**Ask First:**
- Any change that would require updating consumers of this package
- Removing or renaming any exported symbol

**Never:**
- Restructure directories (no hexagonal layer split in this round)
- Rewrite entire files — only targeted edits
- Introduce new dependencies
- Change the `RuleTemplate` / `Condition` / `ActionDefinition` contract shapes
- Add speculative abstractions, frameworks, or patterns

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| createMoveStopLossAction with typed params | `{ newStopPrice: { var: "entryPrice" } }` | Returns ActionDefinition with typed params | N/A |
| createPlaceOrderAction with valid type | `{ type: "market" }` | Returns ActionDefinition | N/A |
| createPlaceOrderAction with invalid type | `{ type: "invalid" }` | TypeScript compile error | Compile-time; no runtime change needed |
| TemplateDefinition without generic | `TemplateDefinition` (no type arg) | Defaults to `Record<string, unknown>` | Compile-time safety |
| Import startTrailingStopSchema | `import { startTrailingStopSchema }` | Import works; schema still usable but `@deprecated` JSDoc visible | N/A |

</frozen-after-approval>

## Code Map

- `src/actions/moveStopLoss.ts` -- Action factory with `any` type hole (`newStopPrice`)
- `src/actions/placeOrder.ts` -- `PlaceOrderParams.type: string` should be union literal
- `src/domain/TradingEnums.ts` -- French comments to convert to English
- `src/templates/predefinedTemplates.ts` -- 632-line file to split; `TemplateDefinition<T = any>`
- `src/schemas/actionSchemas.ts` -- `startTrailingStopSchema` deprecated but still exported
- `src/public-api.ts` -- Barrel; needs update if exports change
- `src/actions/partialClose.ts` -- `PartialCloseDynamicParams` could tighten `quantity`/`percentage` typing
- `__tests__/` -- 14 test files covering all templates, conditions, schemas, registry, and measurement

## Tasks & Acceptance

**Execution:**
- [ ] `src/actions/moveStopLoss.ts` -- Replace `any` with `{ var: string } | Record<string, unknown> | number` union type for `newStopPrice` -- Eliminates the only `any` in the codebase
- [ ] `src/actions/placeOrder.ts` -- Change `type: string` to `type: 'market' | 'limit' | 'stop' | 'close_position'` literal union -- Type-safe action type matching the schema options
- [ ] `src/actions/partialClose.ts` -- Tighten `PartialCloseDynamicParams.quantity` and `.percentage` from `Record<string, unknown>` to `{ var: string }` -- Matches actual usage pattern with JSON Logic var references
- [ ] `src/templates/predefinedTemplates.ts` -- Replace `TemplateDefinition<T = any>` with `TemplateDefinition<T = Record<string, unknown>>` -- Removes unsafe default generic
- [ ] `src/domain/TradingEnums.ts` -- Convert French comments to English -- Consistent language across codebase
- [ ] `src/schemas/actionSchemas.ts` -- Add `@deprecated` JSDoc to `startTrailingStopSchema` export (already has inline comment but needs JSDoc for IDE visibility) -- Clearly signals dead code
- [ ] `src/templates/predefinedTemplates.ts` -- Extract `TemplateDefinition`, `TemplateCategory`, `TemplateMaturity` types into `src/templates/types.ts` -- Reduce file size, improve modularity
- [ ] `src/public-api.ts` -- Update import source for extracted types -- Keep public API identical
- [ ] `__tests__/actions/actions.test.ts` -- Add test for type-safe `PlaceOrderParams.type` (verify valid types pass, invalid types would be caught at compile time; test that runtime validation is consistent) -- Cover the typed API
- [ ] `__tests__/templates/predefinedTemplates.test.ts` -- Verify all template definitions still instantiate correctly after refactor -- Regression safety

**Acceptance Criteria:**
- Given the refactored package, when `pnpm typecheck` runs, then zero new TypeScript errors appear
- Given the refactored package, when `pnpm test:run` runs, then all 122 existing tests pass
- Given the public API, when imported by a consumer, then all previously exported symbols are still available with identical signatures
- Given `moveStopLoss.ts`, when grep for `any`, then `any` only appears in externally-controlled interface contracts (if at all)
- Given the codebase, when `grep -r "Enums pour\|Type de déclencheur\|Évaluation" src/`, then zero French comments remain

## Verification

**Commands:**
- `cd packages/rule-engine-trading && pnpm type-check` -- expected: exit 0, no new errors
- `cd packages/rule-engine-trading && pnpm test:run` -- expected: 14 test files, 122 tests passed
- `cd packages/rule-engine-trading-testkit && pnpm test:run` -- expected: 17 test files, 76 tests passed
- `grep -rn "any" packages/rule-engine-trading/src/` -- expected: only minimal justified uses

**Manual checks (if no CLI):**
- None
</frozen-after-approval>
