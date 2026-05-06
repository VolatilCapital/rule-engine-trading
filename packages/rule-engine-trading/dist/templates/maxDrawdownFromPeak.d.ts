/**
 * @file maxDrawdownFromPeak.ts
 * @description Template factory for "max R given back to market" rules.
 * Closes position when profit drops too much from peak.
 *
 * Protects against violent reversals. Example: +4R → +1.5R → close
 * (Trade gave back 2.5R from peak, which is too much)
 *
 * Requires tracking of peak R reached during the trade.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
/**
 * Parameters for max drawdown from peak template.
 */
export interface MaxDrawdownFromPeakTemplateParams {
    /**
     * Minimum peak R required before this rule activates.
     * Prevents premature exits on trades that haven't run yet.
     * Example: 2 means "only activate after peak reached +2R"
     */
    minPeakR: number;
    /**
     * Maximum R that can be given back to market before closing.
     * Example: 2.5 means "if trade drops 2.5R from peak, close"
     */
    maxDrawdownR: number;
    /**
     * Optional: Minimum current R to still close.
     * If set, won't close if currentR < this value (already too low).
     * Example: 0.5 means "don't trigger if already below +0.5R"
     */
    minCurrentR?: number;
    /** Percentage to close (100 = full close, <100 = partial) */
    closePercentage?: number;
    /** Unique identifier */
    ruleId?: string;
}
/**
 * Creates a rule template for max drawdown from peak.
 *
 * The rule:
 * - Activates only after peakR >= minPeakR (trade must have run first)
 * - Triggers when drawdownFromPeakR >= maxDrawdownR
 * - Optionally requires currentR >= minCurrentR
 * - Not already executed
 *
 * Context requirements:
 * - `peakR`: number - highest R reached during this trade
 * - `currentR`: number - current R level
 * - `drawdownFromPeakR`: number - (peakR - currentR), always positive or zero
 *
 * @example
 * ```typescript
 * // Close if trade gives back 2.5R after reaching +3R peak
 * const template = createMaxDrawdownFromPeakTemplate({
 *   minPeakR: 3,
 *   maxDrawdownR: 2.5,
 * });
 *
 * // Close if trade gives back 1.5R after reaching +2R peak,
 * // but only if still above +0.5R
 * const conservative = createMaxDrawdownFromPeakTemplate({
 *   minPeakR: 2,
 *   maxDrawdownR: 1.5,
 *   minCurrentR: 0.5,
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