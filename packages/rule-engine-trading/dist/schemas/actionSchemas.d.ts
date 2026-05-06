/**
 * @file actionSchemas.ts
 * @description Schema definitions for trading actions.
 * Used by UI to generate dynamic forms for action configuration.
 */
import type { ActionSchema } from 'rule-engine-monorepo/rule-engine';
/**
 * Available fields in the trading context that can be referenced
 */
export declare const TRADING_CONTEXT_FIELDS: readonly ["entryPrice", "currentPrice", "stopLoss", "takeProfit", "currentR", "positionSize", "accountBalance"];
/**
 * Schema for MOVE_STOP_LOSS action
 */
export declare const moveStopLossSchema: ActionSchema;
/**
 * Schema for PLACE_ORDER action
 */
export declare const placeOrderSchema: ActionSchema;
/**
 * Schema for PARTIAL_CLOSE action
 */
export declare const partialCloseSchema: ActionSchema;
/**
 * Schema for SCALE_OUT action
 */
export declare const scaleOutSchema: ActionSchema;
/**
 * Schema for START_TRAILING_STOP action
 */
export declare const startTrailingStopSchema: ActionSchema;
/**
 * Schema for CANCEL_POSITION action
 */
export declare const cancelPositionSchema: ActionSchema;
/**
 * All trading action schemas
 */
export declare const tradingActionSchemas: ActionSchema[];
//# sourceMappingURL=actionSchemas.d.ts.map