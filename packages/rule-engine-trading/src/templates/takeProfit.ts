import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { createClosePositionAction } from '../actions/placeOrder.js';
import { createProfitThresholdCondition, createNotExecutedCondition, createAndCondition, createHistoricalCondition } from '../conditions/tradingConditions.js';

export interface TakeProfitTemplateParams {
  thresholdR: number; // Seuil R pour déclencher la prise de bénéfices (ex: 2, 3, 5)
}

export function createTakeProfitTemplate(params: TakeProfitTemplateParams): RuleTemplate {
  const { thresholdR } = params;

  const actions = [
    createClosePositionAction()
  ];

  const historicalConditions = [
    createHistoricalCondition('position_closed_for_profit')
  ];

  const condition = createAndCondition([
    createProfitThresholdCondition(thresholdR),
    createNotExecutedCondition('position_closed_for_profit')
  ], 'main_condition');

  return RuleTemplate.create(condition, actions, historicalConditions);
}

