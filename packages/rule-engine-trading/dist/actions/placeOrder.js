import { ActionType } from '../domain/TradingEnums.js';
export function createPlaceOrderAction(params) {
    return {
        actionRef: ActionType.PLACE_ORDER,
        parameters: params
    };
}
export function createClosePositionAction() {
    return createPlaceOrderAction({
        type: 'close_position'
    });
}
//# sourceMappingURL=placeOrder.js.map