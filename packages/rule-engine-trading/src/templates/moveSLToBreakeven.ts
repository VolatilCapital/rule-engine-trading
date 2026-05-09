/**
 * @file moveSLToBreakeven.ts
 * @description Template factory for "move stop-loss to breakeven" rules.
 * Moves the SL to the entry price when profit reaches the configured threshold.
 *
 * Threshold is unit-aware via `Measurement` (R, percent, or absolute price move).
 */

import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { assertMeasurement, type Measurement } from '../domain/Measurement.js';
import { createMoveStopLossAction } from '../actions/moveStopLoss.js';
import { createProfitThresholdCondition, createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';

export interface MoveSLToBreakevenTemplateParams {
  /** Profit threshold to trigger the breakeven move. */
  threshold: Measurement;
}

export function createMoveSLToBreakevenTemplate(params: MoveSLToBreakevenTemplateParams): RuleTemplate {
  const { threshold } = params;
  assertMeasurement('threshold', threshold);

  const actions = [
    createMoveStopLossAction({
      newStopPrice: { "var": "entryPrice" }
    })
  ];

  const historicalConditions = [
    createHistoricalCondition('sl_moved_to_breakeven')
  ];

  const condition = createAndCondition([
    createProfitThresholdCondition(threshold),
    createNotExecutedCondition('sl_moved_to_breakeven')
  ], 'main_condition');

  return RuleTemplate.create(condition, actions, historicalConditions);
}
