/**
 * @file conditionSchemas.ts
 * @description Schema definitions for trading conditions.
 * Used by UI to generate dynamic forms for condition configuration.
 */
import type { ConditionSchema } from 'rule-engine-monorepo/rule-engine';
/**
 * Schema for PROFIT_RATIO_GREATER_EQUAL condition
 */
export declare const profitRatioSchema: ConditionSchema;
/**
 * Schema for POSITION_SIZE_GREATER_THAN condition
 */
export declare const positionSizeSchema: ConditionSchema;
/**
 * Schema for VOLUME_GREATER_THAN condition
 */
export declare const volumeSchema: ConditionSchema;
/**
 * Schema for MAX_DRAWDOWN_LESS_THAN condition
 */
export declare const maxDrawdownSchema: ConditionSchema;
/**
 * Schema for BARS_SINCE_ENTRY_GREATER_THAN condition
 */
export declare const barsSinceEntrySchema: ConditionSchema;
/**
 * Schema for STOP_LOSS_TRIGGERED_EQUAL condition
 */
export declare const stopLossTriggeredSchema: ConditionSchema;
/**
 * Schema for IS_TRAILING_NOT_EQUAL condition
 */
export declare const isTrailingSchema: ConditionSchema;
/**
 * Schema for SL_MOVED_EQUAL_TRUE condition
 */
export declare const slMovedSchema: ConditionSchema;
/**
 * Schema for PARTIAL_SL_DONE_NOT_EQUAL_TRUE condition
 */
export declare const partialSlDoneSchema: ConditionSchema;
/**
 * Schema for PRICE_LEVEL_REACHED condition
 */
export declare const priceLevelSchema: ConditionSchema;
/**
 * All trading condition schemas
 */
export declare const tradingConditionSchemas: ConditionSchema[];
//# sourceMappingURL=conditionSchemas.d.ts.map