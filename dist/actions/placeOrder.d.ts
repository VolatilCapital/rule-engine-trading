import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
export interface PlaceOrderParams {
    type: string;
    symbol?: string;
    side?: string;
    quantity?: number;
}
export declare function createPlaceOrderAction(params: PlaceOrderParams): ActionDefinition;
export declare function createClosePositionAction(): ActionDefinition;
//# sourceMappingURL=placeOrder.d.ts.map