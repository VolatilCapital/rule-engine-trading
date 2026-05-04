import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { createCancelPositionAction } from '../actions/cancelPosition.js';
import {
  createPriceBelowCondition,
  createPriceAboveCondition,
  createNotExecutedCondition,
  createAndCondition,
  createHistoricalCondition,
} from '../conditions/tradingConditions.js';

export interface CancelPendingOnPriceLevelTemplateParams {
  invalidationPrice: number;
  direction: 'below' | 'above';
}

export function createCancelPendingOnPriceLevelTemplate(params: CancelPendingOnPriceLevelTemplateParams): RuleTemplate {
  const { invalidationPrice, direction } = params;

  if (direction !== 'below' && direction !== 'above') {
    throw new Error(`Invalid direction: ${direction}. Must be 'below' or 'above'.`);
  }

  if (invalidationPrice <= 0) {
    throw new Error(`Invalid invalidationPrice: ${invalidationPrice}. Must be a positive number.`);
  }

  const priceCondition = direction === 'below'
    ? createPriceBelowCondition(invalidationPrice)
    : createPriceAboveCondition(invalidationPrice);

  const condition = createAndCondition([
    priceCondition,
    createNotExecutedCondition('position_cancelled')
  ], 'cancel_pending_condition');

  const actions = [createCancelPositionAction()];

  const historicalConditions = [createHistoricalCondition('position_cancelled')];

  return RuleTemplate.create(condition, actions, historicalConditions);
}
