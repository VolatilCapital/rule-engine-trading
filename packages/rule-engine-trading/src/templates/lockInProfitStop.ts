/**
 * @file lockInProfitStop.ts
 * @description Template factory for "lock-in profit" stop rules.
 * Moves the stop loss to guarantee a minimum profit when a higher profit is reached.
 *
 * Variant of breakeven, but guarantees actual profit instead of just entry price.
 *
 * Example: At +3R → move stop to guarantee +1R minimum
 */

import {
  RuleTemplate,
  AtomicCondition,
  Operator,
} from 'rule-engine-monorepo/rule-engine';
import { ConditionReference } from '../domain/TradingEnums.js';
import { createMoveStopLossAction } from '../actions/moveStopLoss.js';
import { createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';

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
 * Fact key prefix for tracking lock-in stop execution.
 */
const LOCK_IN_STOP_FACT_PREFIX = 'lock_in_profit_stop_executed';

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
export function createLockInProfitStopTemplate(params: LockInProfitStopTemplateParams): RuleTemplate {
  const { triggerR, lockInR, ruleId } = params;

  if (triggerR <= 0) {
    throw new Error('triggerR must be greater than 0');
  }

  if (lockInR < 0) {
    throw new Error('lockInR must be >= 0');
  }

  if (lockInR >= triggerR) {
    throw new Error(`lockInR (${lockInR}) must be < triggerR (${triggerR})`);
  }

  // Unique fact key
  const factKey = ruleId
    ? `${LOCK_IN_STOP_FACT_PREFIX}_${ruleId}`
    : `${LOCK_IN_STOP_FACT_PREFIX}_${triggerR}R_to_${lockInR}R`;

  // Condition 1: Profit threshold reached
  const profitCondition = new AtomicCondition(
    'currentR',
    Operator.GREATER_EQUAL,
    triggerR,
    ConditionReference.PROFIT_RATIO_GREATER_EQUAL
  );

  // Combined condition: profit reached AND not already executed
  const mainCondition = createAndCondition(
    [profitCondition, createNotExecutedCondition(factKey)],
    'lock_in_profit_stop_condition'
  );

  // Action: move stop loss to lock in profit
  // The newStopPrice is calculated as entryPrice + (lockInR * riskPerUnit)
  // Using JSON Logic expression for dynamic calculation
  // Note: The executor must support this calculation, or provide lockInStopPrice in context
  const action = createMoveStopLossAction({
    newStopPrice: { "var": `lockInStopPrice_${lockInR}R` }
  });

  // Historical condition (self-referencing: only records fact when already true)
  // Actual re-execution prevention is handled by COMPLETED status.
  const historicalCondition = createHistoricalCondition(factKey);

  return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}

/**
 * Alternative factory that uses explicit stop price calculation.
 * Requires context to provide the calculated stop price.
 *
 * The context should include a field like `lockInStopPrice` that is pre-calculated:
 * - For LONG: entryPrice + (lockInR * riskPerUnit)
 * - For SHORT: entryPrice - (lockInR * riskPerUnit)
 */
export function createLockInProfitStopTemplateWithExplicitPrice(
  params: LockInProfitStopTemplateParams & { stopPriceField: string }
): RuleTemplate {
  const { triggerR, lockInR, ruleId, stopPriceField } = params;

  if (triggerR <= 0) {
    throw new Error('triggerR must be greater than 0');
  }

  if (lockInR < 0) {
    throw new Error('lockInR must be >= 0');
  }

  if (lockInR >= triggerR) {
    throw new Error(`lockInR (${lockInR}) must be < triggerR (${triggerR})`);
  }

  const factKey = ruleId
    ? `${LOCK_IN_STOP_FACT_PREFIX}_${ruleId}`
    : `${LOCK_IN_STOP_FACT_PREFIX}_${triggerR}R_to_${lockInR}R`;

  const profitCondition = new AtomicCondition(
    'currentR',
    Operator.GREATER_EQUAL,
    triggerR,
    ConditionReference.PROFIT_RATIO_GREATER_EQUAL
  );

  const mainCondition = createAndCondition(
    [profitCondition, createNotExecutedCondition(factKey)],
    'lock_in_profit_stop_condition'
  );

  const action = createMoveStopLossAction({
    newStopPrice: { "var": stopPriceField }
  });

  const historicalCondition = createHistoricalCondition(factKey);

  return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}

/**
 * Predefined: At +3R, lock in +1R profit.
 */
export const LOCK_IN_3R_TO_1R = createLockInProfitStopTemplate({
  triggerR: 3,
  lockInR: 1,
  ruleId: '3R_to_1R',
});

/**
 * Predefined: At +2R, lock in +0.5R profit.
 */
export const LOCK_IN_2R_TO_05R = createLockInProfitStopTemplate({
  triggerR: 2,
  lockInR: 0.5,
  ruleId: '2R_to_05R',
});

/**
 * Predefined: At +4R, lock in +2R profit.
 */
export const LOCK_IN_4R_TO_2R = createLockInProfitStopTemplate({
  triggerR: 4,
  lockInR: 2,
  ruleId: '4R_to_2R',
});

/**
 * Predefined: At +5R, lock in +3R profit.
 */
export const LOCK_IN_5R_TO_3R = createLockInProfitStopTemplate({
  triggerR: 5,
  lockInR: 3,
  ruleId: '5R_to_3R',
});
