/**
 * @file freeTrade.ts
 * @description Template factory for "free trade" rules.
 * When profit reaches X R, close enough to recover the initial risk (1R).
 * The remaining position is then "free" - 100% profit, no risk.
 *
 * Psychologically powerful: allows traders to let profits run without fear.
 *
 * Example: At +2R, close 50% to recover 1R → remaining 50% is pure profit.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
/**
 * Parameters for free trade template.
 */
export interface FreeTradeTemplateParams {
    /**
     * R threshold to trigger the free trade action.
     * Must be >= 1 (you need at least 1R profit to recover risk).
     */
    triggerR: number;
    /**
     * How many R to recover (typically 1 = initial risk).
     * Default: 1
     */
    rToRecover?: number;
    /** Unique identifier for multiple free trade rules */
    ruleId?: string;
}
/**
 * Creates a rule template for "free trade".
 *
 * The rule:
 * - Triggers when currentR >= triggerR AND not already executed
 * - Calculates the percentage needed to recover the initial risk
 * - Closes that percentage of the position
 * - Records a fact to prevent re-execution
 *
 * @example
 * ```typescript
 * // At +2R, close 50% to recover 1R (standard free trade)
 * const template = createFreeTradeTemplate({
 *   triggerR: 2,
 * });
 *
 * // At +3R, close 33% to recover 1R
 * const template3R = createFreeTradeTemplate({
 *   triggerR: 3,
 * });
 *
 * // At +4R, close 50% to recover 2R (more aggressive)
 * const aggressive = createFreeTradeTemplate({
 *   triggerR: 4,
 *   rToRecover: 2,
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