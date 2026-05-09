/**
 * @file lockInProfitStop.ts
 * @description Template factory for "lock-in profit" stop rules.
 * Moves the stop loss to guarantee a minimum profit when a higher profit is reached.
 *
 * Variant of breakeven, but guarantees actual profit instead of just entry price.
 *
 * Both `trigger` and `lockIn` are `Measurement` values that must share the same unit.
 *
 * The new stop price is pre-computed by the adapter (testkit harness or production
 * context builder) and exposed under `lockInStopPrice_<value><unitSuffix>`:
 *   - R       → suffix `R`     (e.g. `lockInStopPrice_1R`)
 *   - percent → suffix `pct`   (e.g. `lockInStopPrice_1pct`)
 *   - price   → suffix `price` (e.g. `lockInStopPrice_0_5price`)
 *
 * Numeric values use `_` instead of `.` to keep the key a valid identifier-like token.
 *
 * Example: At +3R → move stop to guarantee +1R minimum.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { type Measurement } from '../domain/Measurement.js';
/**
 * Parameters for lock-in profit stop template.
 */
export interface LockInProfitStopTemplateParams {
    /**
     * Profit threshold (in any supported unit) that triggers the stop move.
     * Example: `{ value: 3, unit: 'R' }` means "when profit reaches 3R".
     */
    trigger: Measurement;
    /**
     * Profit level to lock in (the new guaranteed minimum profit).
     * Must share the same unit as `trigger` and be strictly less than it.
     * Example: `{ value: 1, unit: 'R' }` guarantees at least 1R profit.
     */
    lockIn: Measurement;
    /** Unique identifier for multiple lock-in rules */
    ruleId?: string;
}
/**
 * WeakMap that stores the LockInProfitStopTemplateParams for each created
 * RuleTemplate. The testkit harness (or production context builder) walks
 * this map to know which `lockInStopPrice_<value><unitSuffix>` keys to
 * pre-fill in the execution context.
 *
 * @internal Internal convention between this factory and the adapter.
 */
export declare const lockInProfitStopParamsMap: WeakMap<RuleTemplate, LockInProfitStopTemplateParams>;
/**
 * Builds the canonical `lockInStopPrice_*` context key for a `lockIn`
 * measurement. Replaces `.` with `_` so the key reads cleanly.
 *
 * Example: `{ value: 0.5, unit: 'R' }` → `lockInStopPrice_0_5R`.
 *
 * @internal Exported for adapter use only.
 */
export declare function lockInStopPriceKey(lockIn: Measurement): string;
/**
 * Creates a rule template for lock-in profit stop.
 *
 * The rule:
 * - Triggers when the profit-from-entry (in `trigger.unit`) ≥ `trigger.value`
 *   AND the lock-in has not already been executed.
 * - Moves stop loss to the pre-computed `lockInStopPrice_*` value.
 * - Records a fact to prevent re-execution.
 *
 * Throws synchronously when:
 * - Either measurement is malformed.
 * - `trigger.unit !== lockIn.unit`.
 * - `lockIn.value >= trigger.value`.
 *
 * Context requirements (populated by adapter):
 * - One of `currentR | currentPctFromEntry | currentPriceMove` for the chosen unit.
 * - `lockInStopPrice_<value><unitSuffix>` for the chosen `lockIn`.
 *
 * @example
 * ```typescript
 * const template = createLockInProfitStopTemplate({
 *   trigger: { value: 3, unit: 'R' },
 *   lockIn: { value: 1, unit: 'R' },
 * });
 * ```
 */
export declare function createLockInProfitStopTemplate(params: LockInProfitStopTemplateParams): RuleTemplate;
/**
 * Predefined: At +3R, lock in +1R profit.
 */
export declare const LOCK_IN_3R_TO_1R: RuleTemplate;
/**
 * Predefined: At +2R, lock in +0.5R profit.
 */
export declare const LOCK_IN_2R_TO_05R: RuleTemplate;
/**
 * Predefined: At +4R, lock in +2R profit.
 */
export declare const LOCK_IN_4R_TO_2R: RuleTemplate;
/**
 * Predefined: At +5R, lock in +3R profit.
 */
export declare const LOCK_IN_5R_TO_3R: RuleTemplate;
//# sourceMappingURL=lockInProfitStop.d.ts.map