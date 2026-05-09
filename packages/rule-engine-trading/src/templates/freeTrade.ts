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
import { assertMeasurement, type Measurement } from '../domain/Measurement.js';
import { createPartialCloseByPercentage } from '../actions/partialClose.js';
import {
  createProfitThresholdCondition,
  createNotExecutedCondition,
  createAndCondition,
  createHistoricalCondition,
} from '../conditions/tradingConditions.js';

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
 * Fact key prefix for tracking free trade execution.
 */
const FREE_TRADE_FACT_PREFIX = 'free_trade_executed';

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
export function createFreeTradeTemplate(params: FreeTradeTemplateParams): RuleTemplate {
  const { trigger, recover, ruleId } = params;

  assertMeasurement('trigger', trigger);
  assertMeasurement('recover', recover);

  if (trigger.unit !== recover.unit) {
    throw new Error(
      `trigger and recover must share unit (got trigger=${trigger.unit}, recover=${recover.unit})`,
    );
  }

  if (trigger.value < recover.value) {
    throw new Error(
      `trigger.value (${trigger.value}) must be >= recover.value (${recover.value})`,
    );
  }

  // Unit-agnostic ratio (no price arithmetic involved).
  const closePercentage = (recover.value / trigger.value) * 100;

  // Unique fact key
  const factKey = ruleId
    ? `${FREE_TRADE_FACT_PREFIX}_${ruleId}`
    : `${FREE_TRADE_FACT_PREFIX}_${trigger.value}${trigger.unit}`;

  // Combined condition: profit reached AND not already executed
  const mainCondition = createAndCondition(
    [createProfitThresholdCondition(trigger), createNotExecutedCondition(factKey)],
    'free_trade_condition'
  );

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
  trigger: { value: 2, unit: 'R' },
  recover: { value: 1, unit: 'R' },
  ruleId: '2R',
});

/**
 * Predefined: At +3R, close ~33% to recover 1R.
 */
export const FREE_TRADE_3R = createFreeTradeTemplate({
  trigger: { value: 3, unit: 'R' },
  recover: { value: 1, unit: 'R' },
  ruleId: '3R',
});

/**
 * Predefined: At +1.5R, close ~67% to recover 1R.
 */
export const FREE_TRADE_1_5R = createFreeTradeTemplate({
  trigger: { value: 1.5, unit: 'R' },
  recover: { value: 1, unit: 'R' },
  ruleId: '1_5R',
});

/**
 * Predefined: At +4R, close 25% to recover 1R.
 */
export const FREE_TRADE_4R = createFreeTradeTemplate({
  trigger: { value: 4, unit: 'R' },
  recover: { value: 1, unit: 'R' },
  ruleId: '4R',
});
