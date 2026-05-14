import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
export interface MoveStopLossParams extends Record<string, unknown> {
    /** A concrete value (number) or a JSON Logic expression (e.g. `{ var: "entryPrice" }`). */
    newStopPrice: number | {
        var: string;
    } | Record<string, unknown>;
}
export declare function createMoveStopLossAction(params: MoveStopLossParams): ActionDefinition;
//# sourceMappingURL=moveStopLoss.d.ts.map