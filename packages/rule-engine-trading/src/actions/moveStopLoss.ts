import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
import { ActionType } from '../domain/TradingEnums.js';

export interface MoveStopLossParams {
  newStopPrice: any; // Peut être une valeur ou une expression JSON Logic
}

export function createMoveStopLossAction(params: MoveStopLossParams): ActionDefinition {
  return {
    actionRef: ActionType.MOVE_STOP_LOSS,
    parameters: params
  };
}