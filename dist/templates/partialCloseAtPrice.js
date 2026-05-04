/**
 * @file partialCloseAtPrice.ts
 * @description Template factory for dynamic partial close rules at absolute price levels.
 * Unlike takePartial (R-based), this template uses absolute price targets.
 * Designed for per-position dynamic rules set by the user on a specific trade.
 */
import { RuleTemplate, } from 'rule-engine-monorepo/rule-engine';
import { createPartialCloseByPercentage } from '../actions/partialClose.js';
import { createNotExecutedCondition, createAndCondition, createHistoricalCondition, createPriceAboveCondition, createPriceBelowCondition, } from '../conditions/tradingConditions.js';
/**
 * Fact key prefix for tracking partial close at price execution.
 */
const PARTIAL_CLOSE_AT_PRICE_FACT_PREFIX = 'dynamic_partial_close';
/**
 * Creates a rule template for partially closing a position at an absolute price level.
 *
 * For a BUY (long) position, the rule triggers when price goes ABOVE the target
 * (taking profit on the way up).
 * For a SELL (short) position, the rule triggers when price goes BELOW the target
 * (taking profit on the way down).
 *
 * @example
 * ```typescript
 * // Close 30% of a long position when price reaches 45000
 * const template = createPartialCloseAtPriceTemplate({
 *   targetPrice: 45000,
 *   closePercentage: 30,
 *   side: 'buy',
 *   levelId: 'level_1',
 * });
 *
 * // Close 50% of a short position when price drops to 42000
 * const template2 = createPartialCloseAtPriceTemplate({
 *   targetPrice: 42000,
 *   closePercentage: 50,
 *   side: 'sell',
 *   levelId: 'level_2',
 * });
 * ```
 */
export function createPartialCloseAtPriceTemplate(params) {
    const { targetPrice, closePercentage, side, levelId } = params;
    if (targetPrice <= 0) {
        throw new Error('targetPrice must be greater than 0');
    }
    if (closePercentage <= 0 || closePercentage > 99) {
        throw new Error('closePercentage must be between 1 and 99');
    }
    if (side !== 'buy' && side !== 'sell') {
        throw new Error('side must be "buy" or "sell"');
    }
    if (!levelId) {
        throw new Error('levelId is required');
    }
    // Unique fact key for this specific level
    const factKey = `${PARTIAL_CLOSE_AT_PRICE_FACT_PREFIX}_${levelId}`;
    // Price condition depends on position side
    // BUY: price goes UP to target → createPriceAboveCondition
    // SELL: price goes DOWN to target → createPriceBelowCondition
    const priceCondition = side === 'buy'
        ? createPriceAboveCondition(targetPrice)
        : createPriceBelowCondition(targetPrice);
    // Combined condition: price reached AND not already executed
    const mainCondition = createAndCondition([priceCondition, createNotExecutedCondition(factKey)], 'main_condition');
    // Action: close the specified percentage
    const action = createPartialCloseByPercentage({ percentage: closePercentage });
    // Historical condition (prevents re-execution after Phase 1/Phase 2 ordering)
    const historicalCondition = createHistoricalCondition(factKey);
    return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}
//# sourceMappingURL=partialCloseAtPrice.js.map