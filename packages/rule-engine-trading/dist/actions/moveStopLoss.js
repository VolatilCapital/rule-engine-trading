import { ActionType } from '../domain/TradingEnums.js';
export function createMoveStopLossAction(params) {
    return {
        actionRef: ActionType.MOVE_STOP_LOSS,
        parameters: params
    };
}
//# sourceMappingURL=moveStopLoss.js.map