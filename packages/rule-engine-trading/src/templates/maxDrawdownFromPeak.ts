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

import {
  RuleTemplate,
  AtomicCondition,
  Operator,
} from 'rule-engine-monorepo/rule-engine';
import { createClosePositionAction } from '../actions/placeOrder.js';
import { createPartialCloseByPercentage } from '../actions/partialClose.js';
import { createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';

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
 * Fact key prefix for tracking max drawdown execution.
 */
const MAX_DRAWDOWN_FACT_PREFIX = 'max_drawdown_from_peak_executed';

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
export function createMaxDrawdownFromPeakTemplate(
  params: MaxDrawdownFromPeakTemplateParams
): RuleTemplate {
  const {
    minPeakR,
    maxDrawdownR,
    minCurrentR,
    closePercentage = 100,
    ruleId,
  } = params;

  if (minPeakR <= 0) {
    throw new Error('minPeakR must be greater than 0');
  }

  if (maxDrawdownR <= 0) {
    throw new Error('maxDrawdownR must be greater than 0');
  }

  if (closePercentage <= 0 || closePercentage > 100) {
    throw new Error('closePercentage must be between 0 and 100');
  }

  // Unique fact key
  const factKey = ruleId
    ? `${MAX_DRAWDOWN_FACT_PREFIX}_${ruleId}`
    : `${MAX_DRAWDOWN_FACT_PREFIX}_peak${minPeakR}R_dd${maxDrawdownR}R`;

  const conditions: AtomicCondition[] = [];

  // Condition 1: Peak R must have been reached
  conditions.push(
    new AtomicCondition(
      'peakR',
      Operator.GREATER_EQUAL,
      minPeakR,
      'peak_r_check'
    )
  );

  // Condition 2: Drawdown from peak exceeds threshold
  conditions.push(
    new AtomicCondition(
      'drawdownFromPeakR',
      Operator.GREATER_EQUAL,
      maxDrawdownR,
      'drawdown_from_peak_check'
    )
  );

  // Condition 3: Optional minimum current R
  if (minCurrentR !== undefined) {
    conditions.push(
      new AtomicCondition(
        'currentR',
        Operator.GREATER_EQUAL,
        minCurrentR,
        'min_current_r_check'
      )
    );
  }

  // Combined condition: all trading conditions AND not already executed
  const mainCondition = createAndCondition(
    [...conditions, createNotExecutedCondition(factKey)],
    'max_drawdown_from_peak_condition'
  );

  // Action: close fully or partially
  const action =
    closePercentage === 100
      ? createClosePositionAction()
      : createPartialCloseByPercentage({ percentage: closePercentage });

  // Historical condition (self-referencing: only records fact when already true)
  // Actual re-execution prevention is handled by COMPLETED status.
  const historicalCondition = createHistoricalCondition(factKey);

  return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}

/**
 * Predefined: Close if +4R peak drops to +1.5R (gave back 2.5R).
 */
export const MAX_DD_4R_PEAK_25R_DD = createMaxDrawdownFromPeakTemplate({
  minPeakR: 4,
  maxDrawdownR: 2.5,
  ruleId: '4R_peak_25R_dd',
});

/**
 * Predefined: Close if +3R peak drops by 1.5R (to +1.5R or below).
 */
export const MAX_DD_3R_PEAK_15R_DD = createMaxDrawdownFromPeakTemplate({
  minPeakR: 3,
  maxDrawdownR: 1.5,
  ruleId: '3R_peak_15R_dd',
});

/**
 * Predefined: Close if +2R peak drops by 1R (to +1R or below).
 */
export const MAX_DD_2R_PEAK_1R_DD = createMaxDrawdownFromPeakTemplate({
  minPeakR: 2,
  maxDrawdownR: 1,
  ruleId: '2R_peak_1R_dd',
});

/**
 * Predefined: Close if +5R peak drops by 2R, but only if still above +1R.
 */
export const MAX_DD_5R_PEAK_2R_DD_MIN_1R = createMaxDrawdownFromPeakTemplate({
  minPeakR: 5,
  maxDrawdownR: 2,
  minCurrentR: 1,
  ruleId: '5R_peak_2R_dd_min1R',
});
