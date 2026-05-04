import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
import { ActionType } from '../domain/TradingEnums.js';

export interface PlaceOrderParams {
  type: string;
  symbol?: string;
  side?: string;
  quantity?: number;
}

export function createPlaceOrderAction(params: PlaceOrderParams): ActionDefinition {
  return {
    actionRef: ActionType.PLACE_ORDER,
    parameters: params
  };
}

export function createClosePositionAction(): ActionDefinition {
  return createPlaceOrderAction({
    type: 'close_position'
  });
}