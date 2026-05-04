/**
 * @file partialCloseAtPrice.ts
 * @description Template factory for dynamic partial close rules at absolute price levels.
 * Unlike takePartial (R-based), this template uses absolute price targets.
 * Designed for per-position dynamic rules set by the user on a specific trade.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
/**
 * Parameters for partial close at price template.
 */
export interface PartialCloseAtPriceTemplateParams {
    /** Target price level at which to trigger the partial close */
    targetPrice: number;
    /** Percentage of remaining position to close (1-99) */
    closePercentage: number;
    /** Position side: 'buy' (long) or 'sell' (short) */
    side: 'buy' | 'sell';
    /** Unique identifier for this level (prevents re-execution) */
    levelId: string;
}
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
export declare function createPartialCloseAtPriceTemplate(params: PartialCloseAtPriceTemplateParams): RuleTemplate;
//# sourceMappingURL=partialCloseAtPrice.d.ts.map