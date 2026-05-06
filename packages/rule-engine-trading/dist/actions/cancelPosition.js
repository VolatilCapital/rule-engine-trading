import { ActionType } from '../domain/TradingEnums.js';
export function createCancelPositionAction() {
    return {
        actionRef: ActionType.CANCEL_POSITION,
        parameters: {}
    };
}
//# sourceMappingURL=cancelPosition.js.map