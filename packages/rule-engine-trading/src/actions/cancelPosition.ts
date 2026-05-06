import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
import { ActionType } from '../domain/TradingEnums.js';

export function createCancelPositionAction(): ActionDefinition {
  return {
    actionRef: ActionType.CANCEL_POSITION,
    parameters: {}
  };
}
