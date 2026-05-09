/**
 * @file takeProfit.ts
 * @description Template factory for "take-profit" rules.
 * Closes the position when profit reaches the configured threshold.
 *
 * The threshold is unit-aware via `Measurement`:
 *   - `{ value: 3, unit: 'R' }`       → fires when `currentR >= 3`
 *   - `{ value: 1.5, unit: 'percent' }` → fires when `currentPctFromEntry >= 1.5`
 *   - `{ value: 0.5, unit: 'price' }` → fires when `currentPriceMove >= 0.5`
 */

import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { assertMeasurement, type Measurement } from '../domain/Measurement.js';
import { createClosePositionAction } from '../actions/placeOrder.js';
import { createProfitThresholdCondition, createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';

export interface TakeProfitTemplateParams {
  /** Profit threshold expressed in R, percent, or absolute price. */
  threshold: Measurement;
}

export function createTakeProfitTemplate(params: TakeProfitTemplateParams): RuleTemplate {
  const { threshold } = params;
  assertMeasurement('threshold', threshold);

  const actions = [
    createClosePositionAction()
  ];

  const historicalConditions = [
    createHistoricalCondition('position_closed_for_profit')
  ];

  const condition = createAndCondition([
    createProfitThresholdCondition(threshold),
    createNotExecutedCondition('position_closed_for_profit')
  ], 'main_condition');

  return RuleTemplate.create(condition, actions, historicalConditions);
}
