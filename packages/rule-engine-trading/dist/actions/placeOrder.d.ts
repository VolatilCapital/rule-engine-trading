import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
export interface PlaceOrderParams extends Record<string, unknown> {
    type: 'market' | 'limit' | 'stop' | 'close_position';
    symbol?: string;
    side?: string;
    quantity?: number;
}
export declare function createPlaceOrderAction(params: PlaceOrderParams): ActionDefinition;
export declare function createClosePositionAction(): ActionDefinition;
//# sourceMappingURL=placeOrder.d.ts.map