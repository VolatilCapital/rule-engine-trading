import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { createMoveStopLossAction } from '../actions/moveStopLoss.js';
import { createProfitThresholdCondition, createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';

export interface MoveSLToBreakevenTemplateParams {
  thresholdR: number; // Seuil R pour déclencher (ex: 1.5, 3, 5)
}

export function createMoveSLToBreakevenTemplate(params: MoveSLToBreakevenTemplateParams): RuleTemplate {
  const { thresholdR } = params;

  const actions = [
    createMoveStopLossAction({
      newStopPrice: { "var": "entryPrice" }
    })
  ];

  const historicalConditions = [
    createHistoricalCondition('sl_moved_to_breakeven')
  ];

  const condition = createAndCondition([
    createProfitThresholdCondition(thresholdR),
    createNotExecutedCondition('sl_moved_to_breakeven')
  ], 'main_condition');

  return RuleTemplate.create(condition, actions, historicalConditions);
}
