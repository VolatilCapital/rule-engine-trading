import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
import { ActionType } from '../domain/TradingEnums.js';

export interface MoveStopLossParams extends Record<string, unknown> {
  /** A concrete value (number) or a JSON Logic expression (e.g. `{ var: "entryPrice" }`). */
  newStopPrice: number | { var: string } | Record<string, unknown>;
}

export function createMoveStopLossAction(params: MoveStopLossParams): ActionDefinition {
  return {
    actionRef: ActionType.MOVE_STOP_LOSS,
    parameters: params
  };
}