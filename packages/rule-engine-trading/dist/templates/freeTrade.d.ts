/**
 * @file freeTrade.ts
 * @description Template factory for "free trade" rules.
 * When profit reaches `trigger`, close enough of the position to recover
 * `recover` (typically the initial 1R risk). The remainder is then "free".
 *
 * `trigger` and `recover` are unit-aware `Measurement`s and must share the
 * same unit (R, percent, or price). The close percentage is the unit-agnostic
 * ratio `(recover.value / trigger.value) * 100`.
 *
 * Example: At +2R, close 50% to recover 1R → remaining 50% is pure profit.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { type Measurement } from '../domain/Measurement.js';
/**
 * Parameters for free trade template.
 */
export interface FreeTradeTemplateParams {
    /**
     * Profit threshold (in any supported unit) that triggers the free-trade action.
     * Must be ≥ `recover` (you need at least that much profit to recover the risk).
     */
    trigger: Measurement;
    /**
     * Amount to recover, in the same unit as `trigger`.
     * Typically `{ value: 1, unit: 'R' }` (recover the initial risk).
     */
    recover: Measurement;
    /** Unique identifier for multiple free trade rules */
    ruleId?: string;
}
/**
 * Creates a rule template for "free trade".
 *
 * The rule:
 * - Triggers when profit (in `trigger.unit`) ≥ `trigger.value` AND not already executed.
 * - Closes `(recover.value / trigger.value) * 100` percent of the position.
 * - Records a fact to prevent re-execution.
 *
 * Throws synchronously when:
 * - Either measurement is malformed.
 * - `trigger.unit !== recover.unit`.
 * - `trigger.value < recover.value`.
 *
 * @example
 * ```typescript
 * // At +2R, close 50% to recover 1R (standard free trade).
 * const template = createFreeTradeTemplate({
 *   trigger: { value: 2, unit: 'R' },
 *   recover: { value: 1, unit: 'R' },
 * });
 * ```
 */
export declare function createFreeTradeTemplate(params: FreeTradeTemplateParams): RuleTemplate;
/**
 * Predefined: At +2R, close 50% to recover 1R.
 */
export declare const FREE_TRADE_2R: RuleTemplate;
/**
 * Predefined: At +3R, close ~33% to recover 1R.
 */
export declare const FREE_TRADE_3R: RuleTemplate;
/**
 * Predefined: At +1.5R, close ~67% to recover 1R.
 */
export declare const FREE_TRADE_1_5R: RuleTemplate;
/**
 * Predefined: At +4R, close 25% to recover 1R.
 */
export declare const FREE_TRADE_4R: RuleTemplate;
//# sourceMappingURL=freeTrade.d.ts.map