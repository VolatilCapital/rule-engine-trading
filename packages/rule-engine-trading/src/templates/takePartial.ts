/**
 * @file takePartial.ts
 * @description Template factory for partial close rules.
 * Creates rules that close a percentage of the position when profit threshold is reached.
 */

import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { assertMeasurement, type Measurement } from '../domain/Measurement.js';
import { createPartialCloseByPercentage } from '../actions/partialClose.js';
import {
  createProfitThresholdCondition,
  createNotExecutedCondition,
  createAndCondition,
  createHistoricalCondition,
} from '../conditions/tradingConditions.js';

/**
 * Parameters for take partial template.
 */
export interface TakePartialTemplateParams {
  /** Profit threshold (R, percent, or price) at which the partial close fires. */
  threshold: Measurement;
  /** Percentage of position to close (0-100) */
  closePercentage: number;
  /** Unique identifier for this partial close (to prevent re-execution) */
  partialId?: string;
}

/**
 * Fact key for tracking partial close execution.
 */
const PARTIAL_CLOSE_FACT_PREFIX = 'partial_close_done';

/**
 * Creates a rule template for taking a partial close at a profit threshold.
 *
 * The rule:
 * - Triggers when profit (in chosen unit) reaches `threshold` AND partial not already taken
 * - Closes the specified percentage of the position
 * - Records a fact to prevent re-execution
 *
 * @example
 * ```typescript
 * // Close 50% of position at 2R profit
 * const template = createTakePartialTemplate({
 *   threshold: { value: 2, unit: 'R' },
 *   closePercentage: 50,
 * });
 * ```
 */
export function createTakePartialTemplate(params: TakePartialTemplateParams): RuleTemplate {
  const { threshold, closePercentage, partialId } = params;

  assertMeasurement('threshold', threshold);

  if (closePercentage <= 0 || closePercentage > 100) {
    throw new Error('closePercentage must be between 0 and 100');
  }

  // Unique fact key
  const factKey = partialId
    ? `${PARTIAL_CLOSE_FACT_PREFIX}_${partialId}`
    : `${PARTIAL_CLOSE_FACT_PREFIX}_${threshold.value}${threshold.unit}`;

  // Combined condition: profit reached AND not already executed
  const mainCondition = createAndCondition(
    [createProfitThresholdCondition(threshold), createNotExecutedCondition(factKey)],
    'main_condition'
  );

  // Action: close the specified percentage
  const action = createPartialCloseByPercentage({ percentage: closePercentage });

  // Historical condition (self-referencing: prevents Phase 1/Phase 2 ordering issue)
  const historicalCondition = createHistoricalCondition(factKey);

  return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}

/**
 * Predefined template: Close 50% at 1R profit.
 */
export const TAKE_PARTIAL_1R_50PCT = createTakePartialTemplate({
  threshold: { value: 1, unit: 'R' },
  closePercentage: 50,
  partialId: '1R_50pct',
});

/**
 * Predefined template: Close 33% at 1R profit.
 */
export const TAKE_PARTIAL_1R_33PCT = createTakePartialTemplate({
  threshold: { value: 1, unit: 'R' },
  closePercentage: 33.33,
  partialId: '1R_33pct',
});

/**
 * Predefined template: Close 50% at 2R profit.
 */
export const TAKE_PARTIAL_2R_50PCT = createTakePartialTemplate({
  threshold: { value: 2, unit: 'R' },
  closePercentage: 50,
  partialId: '2R_50pct',
});

/**
 * Predefined template: Close 25% at 1R, then 25% at 2R (use both templates).
 */
export const TAKE_PARTIAL_1R_25PCT = createTakePartialTemplate({
  threshold: { value: 1, unit: 'R' },
  closePercentage: 25,
  partialId: '1R_25pct',
});

export const TAKE_PARTIAL_2R_25PCT = createTakePartialTemplate({
  threshold: { value: 2, unit: 'R' },
  closePercentage: 25,
  partialId: '2R_25pct',
});
