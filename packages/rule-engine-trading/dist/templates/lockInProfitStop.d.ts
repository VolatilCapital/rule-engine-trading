/**
 * @file lockInProfitStop.ts
 * @description Template factory for "lock-in profit" stop rules.
 * Moves the stop loss to guarantee a minimum profit when a higher profit is reached.
 *
 * Variant of breakeven, but guarantees actual profit instead of just entry price.
 *
 * Example: At +3R → move stop to guarantee +1R minimum
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
/**
 * Parameters for lock-in profit stop template.
 */
export interface LockInProfitStopTemplateParams {
    /**
     * R threshold to trigger the stop move.
     * Example: 3 means "when profit reaches 3R"
     */
    triggerR: number;
    /**
     * R level to lock in (the new guaranteed minimum profit).
     * Must be < triggerR.
     * Example: 1 means "guarantee at least 1R profit"
     */
    lockInR: number;
    /** Unique identifier for multiple lock-in rules */
    ruleId?: string;
}
/**
 * Creates a rule template for lock-in profit stop.
 *
 * The rule:
 * - Triggers when currentR >= triggerR AND not already executed
 * - Moves stop loss to lock in the specified R profit
 * - Records a fact to prevent re-execution
 *
 * Context requirements:
 * - `currentR`: number - current risk/reward ratio
 * - `entryPrice`: number - position entry price
 * - `riskPerUnit`: number - the R value per price unit (for calculating new stop)
 *
 * The new stop price is calculated as:
 *   For LONG: entryPrice + (lockInR * riskPerUnit)
 *   For SHORT: entryPrice - (lockInR * riskPerUnit)
 *
 * This is passed as a JSON Logic expression to be evaluated at execution time.
 *
 * @example
 * ```typescript
 * // At +3R, lock in +1R profit
 * const template = createLockInProfitStopTemplate({
 *   triggerR: 3,
 *   lockInR: 1,
 * });
 *
 * // At +5R, lock in +2R profit
 * const template5R = createLockInProfitStopTemplate({
 *   triggerR: 5,
 *   lockInR: 2,
 * });
 * ```
 */
export declare function createLockInProfitStopTemplate(params: LockInProfitStopTemplateParams): RuleTemplate;
/**
 * Alternative factory that uses explicit stop price calculation.
 * Requires context to provide the calculated stop price.
 *
 * The context should include a field like `lockInStopPrice` that is pre-calculated:
 * - For LONG: entryPrice + (lockInR * riskPerUnit)
 * - For SHORT: entryPrice - (lockInR * riskPerUnit)
 */
export declare function createLockInProfitStopTemplateWithExplicitPrice(params: LockInProfitStopTemplateParams & {
    stopPriceField: string;
}): RuleTemplate;
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