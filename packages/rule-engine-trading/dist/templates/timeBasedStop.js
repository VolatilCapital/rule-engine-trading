/**
 * @file timeBasedStop.ts
 * @description Template factory for time-based stop rules.
 * Closes position (fully or partially) if profit threshold is not reached within time limit.
 *
 * Use case: Eliminate "dead trades" that tie up capital and attention.
 * Example: If after 30 minutes the trade hasn't reached +1R, exit.
 */
import { RuleTemplate, AtomicCondition, Operator, } from 'rule-engine-monorepo/rule-engine';
import { ConditionReference } from '../domain/TradingEnums.js';
import { createClosePositionAction } from '../actions/placeOrder.js';
import { createPartialCloseByPercentage } from '../actions/partialClose.js';
import { createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';
/**
 * Fact key prefix for tracking time-based stop execution.
 */
const TIME_STOP_FACT_PREFIX = 'time_based_stop_executed';
/**
 * Creates a rule template for time-based stop.
 *
 * The rule:
 * - Triggers when elapsedMinutes >= maxMinutes AND currentR < minProfitR AND not already executed
 * - Closes the position (fully or partially)
 * - Records a fact to prevent re-execution
 *
 * Context requirements:
 * - `elapsedMinutes`: number - time since position entry
 * - `currentR`: number - current risk/reward ratio
 *
 * @example
 * ```typescript
 * // Close if not +1R after 30 minutes
 * const template = createTimeBasedStopTemplate({
 *   maxMinutes: 30,
 *   minProfitR: 1,
 * });
 *
 * // Partial close (50%) if not +0.5R after 15 minutes
 * const partialTemplate = createTimeBasedStopTemplate({
 *   maxMinutes: 15,
 *   minProfitR: 0.5,
 *   closePercentage: 50,
 *   ruleId: 'early_time_stop',
 * });
 * ```
 */
export function createTimeBasedStopTemplate(params) {
    const { maxMinutes, minProfitR, closePercentage = 100, ruleId } = params;
    if (maxMinutes <= 0) {
        throw new Error('maxMinutes must be greater than 0');
    }
    if (closePercentage <= 0 || closePercentage > 100) {
        throw new Error('closePercentage must be between 0 and 100');
    }
    // Unique fact key
    const factKey = ruleId
        ? `${TIME_STOP_FACT_PREFIX}_${ruleId}`
        : `${TIME_STOP_FACT_PREFIX}_${maxMinutes}min_${minProfitR}R`;
    // Condition 1: Time elapsed
    const timeCondition = AtomicCondition.create('elapsedMinutes', Operator.GREATER_EQUAL, maxMinutes, 'time_elapsed_check');
    // Condition 2: Profit NOT reached (we want to exit if profit is BELOW threshold)
    const profitNotReachedCondition = AtomicCondition.create('currentR', Operator.LESS_THAN, minProfitR, ConditionReference.PROFIT_RATIO_GREATER_EQUAL);
    // Combined: time elapsed AND profit not reached AND not executed
    const mainCondition = createAndCondition([timeCondition, profitNotReachedCondition, createNotExecutedCondition(factKey)], 'time_based_stop_condition');
    // Action: close fully or partially
    const action = closePercentage === 100
        ? createClosePositionAction()
        : createPartialCloseByPercentage({ percentage: closePercentage });
    // Historical condition (self-referencing: prevents Phase 1/Phase 2 ordering issue)
    const historicalCondition = createHistoricalCondition(factKey);
    return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}
/**
 * Predefined: Close if not +1R after 30 minutes.
 */
export const TIME_STOP_30MIN_1R = createTimeBasedStopTemplate({
    maxMinutes: 30,
    minProfitR: 1,
    ruleId: '30min_1R',
});
/**
 * Predefined: Close if not +0.5R after 15 minutes.
 */
export const TIME_STOP_15MIN_05R = createTimeBasedStopTemplate({
    maxMinutes: 15,
    minProfitR: 0.5,
    ruleId: '15min_05R',
});
/**
 * Predefined: Close if not +2R after 60 minutes.
 */
export const TIME_STOP_60MIN_2R = createTimeBasedStopTemplate({
    maxMinutes: 60,
    minProfitR: 2,
    ruleId: '60min_2R',
});
//# sourceMappingURL=timeBasedStop.js.map