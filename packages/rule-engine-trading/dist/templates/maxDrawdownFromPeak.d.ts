/**
 * @file maxDrawdownFromPeak.ts
 * @description Template factory for "max profit given back to market" rules.
 * Closes (or partially closes) the position when the drawdown from peak
 * exceeds a configurable threshold.
 *
 * All three measurement parameters (`minPeak`, `maxDrawdown`, `minCurrent`)
 * are `Measurement` values that **must share the same unit** — drawdown is a
 * difference, mixing units would be meaningless.
 *
 * Supported units (`R`, `percent`, `price`) dispatch to the matching context
 * fields via `PEAK_FIELD`, `DRAWDOWN_FROM_PEAK_FIELD` and `PROFIT_FIELD`. All
 * unit-aware arithmetic lives in the adapter (the testkit harness or the
 * production context builder); this template stays pure.
 *
 * Example: peak +4R → drawdown +1.5R → close (gave back 2.5R from peak).
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { type Measurement } from '../domain/Measurement.js';
/**
 * Parameters for the max-drawdown-from-peak template.
 *
 * Same-unit constraint: `minPeak.unit`, `maxDrawdown.unit` and (when present)
 * `minCurrent.unit` must all be equal. The factory throws synchronously when
 * any pair mismatches.
 */
export interface MaxDrawdownFromPeakTemplateParams {
    /**
     * Minimum peak (in any supported unit) required before the rule activates.
     * Prevents premature exits on trades that haven't run yet.
     * Example: `{ value: 2, unit: 'R' }` → "only activate after peak ≥ +2R".
     */
    minPeak: Measurement;
    /**
     * Maximum drawdown from peak (in the same unit as `minPeak`) before closing.
     * Example: `{ value: 2.5, unit: 'R' }` → "if trade drops 2.5R from peak, close".
     */
    maxDrawdown: Measurement;
    /**
     * Optional: minimum current profit-from-entry (in the same unit) to still
     * trigger the close. If omitted, the rule fires on drawdown alone.
     * Example: `{ value: 0.5, unit: 'R' }` → "don't trigger if already < +0.5R".
     */
    minCurrent?: Measurement;
    /** Percentage to close (100 = full close, <100 = partial). Defaults to 100. */
    closePercentage?: number;
    /** Unique identifier (used to disambiguate the fact key). */
    ruleId?: string;
}
/**
 * Creates a rule template for max drawdown from peak.
 *
 * The rule:
 * - Activates only after the peak (in the chosen unit) ≥ `minPeak.value`.
 * - Triggers when the drawdown-from-peak (same unit) ≥ `maxDrawdown.value`.
 * - Optionally requires the current profit-from-entry ≥ `minCurrent.value`.
 * - Records a fact to prevent re-execution.
 *
 * Throws synchronously when:
 * - Any measurement is malformed (`assertMeasurement` rules).
 * - `minPeak`, `maxDrawdown`, and (if present) `minCurrent` do not share the
 *   same unit.
 * - `closePercentage` is outside `(0, 100]`.
 *
 * Context requirements (populated by adapter), per chosen unit:
 * - `PEAK_FIELD[unit]`               — peak profit-from-entry seen so far.
 * - `DRAWDOWN_FROM_PEAK_FIELD[unit]` — `peak − current`, floored at 0.
 * - `PROFIT_FIELD[unit]`             — current profit-from-entry (only when
 *                                       `minCurrent` is set).
 *
 * @example
 * ```typescript
 * // Close if trade gives back 2.5R after reaching +3R peak.
 * const template = createMaxDrawdownFromPeakTemplate({
 *   minPeak: { value: 3, unit: 'R' },
 *   maxDrawdown: { value: 2.5, unit: 'R' },
 * });
 *
 * // Close if a +2% peak gives back 1%, but only if still above +0.5%.
 * const conservative = createMaxDrawdownFromPeakTemplate({
 *   minPeak: { value: 2, unit: 'percent' },
 *   maxDrawdown: { value: 1, unit: 'percent' },
 *   minCurrent: { value: 0.5, unit: 'percent' },
 * });
 * ```
 */
export declare function createMaxDrawdownFromPeakTemplate(params: MaxDrawdownFromPeakTemplateParams): RuleTemplate;
/**
 * Predefined: Close if +4R peak drops to +1.5R (gave back 2.5R).
 */
export declare const MAX_DD_4R_PEAK_25R_DD: RuleTemplate;
/**
 * Predefined: Close if +3R peak drops by 1.5R (to +1.5R or below).
 */
export declare const MAX_DD_3R_PEAK_15R_DD: RuleTemplate;
/**
 * Predefined: Close if +2R peak drops by 1R (to +1R or below).
 */
export declare const MAX_DD_2R_PEAK_1R_DD: RuleTemplate;
/**
 * Predefined: Close if +5R peak drops by 2R, but only if still above +1R.
 */
export declare const MAX_DD_5R_PEAK_2R_DD_MIN_1R: RuleTemplate;
//# sourceMappingURL=maxDrawdownFromPeak.d.ts.map