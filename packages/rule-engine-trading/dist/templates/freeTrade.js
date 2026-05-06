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
import { RuleTemplate, AtomicCondition, Operator, } from 'rule-engine-monorepo/rule-engine';
import { ConditionReference } from '../domain/TradingEnums.js';
import { createPartialCloseByPercentage } from '../actions/partialClose.js';
import { createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';
/**
 * Fact key prefix for tracking free trade execution.
 */
const FREE_TRADE_FACT_PREFIX = 'free_trade_executed';
/**
 * Calculates the percentage to close to recover rToRecover at triggerR.
 *
 * Formula: percentage = (rToRecover / triggerR) * 100
 *
 * Example: At 2R, to recover 1R, close 50%
 * Example: At 3R, to recover 1R, close 33.33%
 */
function calculateClosePercentage(triggerR, rToRecover) {
    return (rToRecover / triggerR) * 100;
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
export function createFreeTradeTemplate(params) {
    const { triggerR, rToRecover = 1, ruleId } = params;
    if (triggerR < rToRecover) {
        throw new Error(`triggerR (${triggerR}) must be >= rToRecover (${rToRecover})`);
    }
    if (rToRecover <= 0) {
        throw new Error('rToRecover must be greater than 0');
    }
    const closePercentage = calculateClosePercentage(triggerR, rToRecover);
    // Unique fact key
    const factKey = ruleId
        ? `${FREE_TRADE_FACT_PREFIX}_${ruleId}`
        : `${FREE_TRADE_FACT_PREFIX}_${triggerR}R`;
    // Condition 1: Profit threshold reached
    const profitCondition = new AtomicCondition('currentR', Operator.GREATER_EQUAL, triggerR, ConditionReference.PROFIT_RATIO_GREATER_EQUAL);
    // Combined condition: profit reached AND not already executed
    const mainCondition = createAndCondition([profitCondition, createNotExecutedCondition(factKey)], 'free_trade_condition');
    // Action: close calculated percentage
    const action = createPartialCloseByPercentage({ percentage: closePercentage });
    // Historical condition (self-referencing: prevents Phase 1/Phase 2 ordering issue)
    const historicalCondition = createHistoricalCondition(factKey);
    return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}
/**
 * Predefined: At +2R, close 50% to recover 1R.
 */
export const FREE_TRADE_2R = createFreeTradeTemplate({
    triggerR: 2,
    ruleId: '2R',
});
/**
 * Predefined: At +3R, close ~33% to recover 1R.
 */
export const FREE_TRADE_3R = createFreeTradeTemplate({
    triggerR: 3,
    ruleId: '3R',
});
/**
 * Predefined: At +1.5R, close ~67% to recover 1R.
 */
export const FREE_TRADE_1_5R = createFreeTradeTemplate({
    triggerR: 1.5,
    ruleId: '1_5R',
});
/**
 * Predefined: At +4R, close 25% to recover 1R.
 */
export const FREE_TRADE_4R = createFreeTradeTemplate({
    triggerR: 4,
    ruleId: '4R',
});
//# sourceMappingURL=freeTrade.js.map