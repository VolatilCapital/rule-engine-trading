/**
 * @file conditionSchemas.ts
 * @description Schema definitions for trading conditions.
 * Used by UI to generate dynamic forms for condition configuration.
 */

import type { ConditionSchema } from 'rule-engine-monorepo/rule-engine';
import { ConditionReference } from '../domain/TradingEnums.js';

/**
 * Schema for PROFIT_RATIO_GREATER_EQUAL condition
 */
export const profitRatioSchema: ConditionSchema = {
  conditionRef: ConditionReference.PROFIT_RATIO_GREATER_EQUAL,
  category: 'profit',
  fields: [
    {
      name: 'thresholdR',
      type: 'number',
      required: true,
      min: 0,
      step: 0.5,
      defaultValue: 1,
    },
  ],
};

/**
 * Schema for POSITION_SIZE_GREATER_THAN condition
 */
export const positionSizeSchema: ConditionSchema = {
  conditionRef: ConditionReference.POSITION_SIZE_GREATER_THAN,
  category: 'position',
  fields: [
    {
      name: 'minSize',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
    },
  ],
};

/**
 * Schema for VOLUME_GREATER_THAN condition
 */
export const volumeSchema: ConditionSchema = {
  conditionRef: ConditionReference.VOLUME_GREATER_THAN,
  category: 'market',
  fields: [
    {
      name: 'minVolume',
      type: 'number',
      required: true,
      min: 0,
    },
  ],
};

/**
 * Schema for MAX_DRAWDOWN_LESS_THAN condition
 */
export const maxDrawdownSchema: ConditionSchema = {
  conditionRef: ConditionReference.MAX_DRAWDOWN_LESS_THAN,
  category: 'risk',
  fields: [
    {
      name: 'maxDrawdownPercent',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 10,
    },
  ],
};

/**
 * Schema for BARS_SINCE_ENTRY_GREATER_THAN condition
 */
export const barsSinceEntrySchema: ConditionSchema = {
  conditionRef: ConditionReference.BARS_SINCE_ENTRY_GREATER_THAN,
  category: 'time',
  fields: [
    {
      name: 'minBars',
      type: 'number',
      required: true,
      min: 1,
      step: 1,
      defaultValue: 5,
    },
  ],
};

/**
 * Schema for STOP_LOSS_TRIGGERED_EQUAL condition
 */
export const stopLossTriggeredSchema: ConditionSchema = {
  conditionRef: ConditionReference.STOP_LOSS_TRIGGERED_EQUAL,
  category: 'stop_loss',
  fields: [
    {
      name: 'triggered',
      type: 'boolean',
      required: true,
      defaultValue: true,
    },
  ],
};

/**
 * Schema for IS_TRAILING_NOT_EQUAL condition
 */
export const isTrailingSchema: ConditionSchema = {
  conditionRef: ConditionReference.IS_TRAILING_NOT_EQUAL,
  category: 'stop_loss',
  fields: [
    {
      name: 'isTrailing',
      type: 'boolean',
      required: true,
      defaultValue: false,
    },
  ],
};

/**
 * Schema for SL_MOVED_EQUAL_TRUE condition
 */
export const slMovedSchema: ConditionSchema = {
  conditionRef: ConditionReference.SL_MOVED_EQUAL_TRUE,
  category: 'stop_loss',
  fields: [],
};

/**
 * Schema for PARTIAL_SL_DONE_NOT_EQUAL_TRUE condition
 */
export const partialSlDoneSchema: ConditionSchema = {
  conditionRef: ConditionReference.PARTIAL_SL_DONE_NOT_EQUAL_TRUE,
  category: 'stop_loss',
  fields: [],
};

/**
 * Schema for PRICE_LEVEL_REACHED condition
 */
export const priceLevelSchema: ConditionSchema = {
  conditionRef: ConditionReference.PRICE_LEVEL_REACHED,
  category: 'price',
  fields: [
    {
      name: 'invalidationPrice',
      type: 'number',
      required: true,
      min: 0,
      step: 0.0001,
    },
    {
      name: 'direction',
      type: 'string',
      required: true,
      defaultValue: 'below',
    },
  ],
};

/**
 * All trading condition schemas
 */
export const tradingConditionSchemas: ConditionSchema[] = [
  profitRatioSchema,
  positionSizeSchema,
  volumeSchema,
  maxDrawdownSchema,
  barsSinceEntrySchema,
  stopLossTriggeredSchema,
  isTrailingSchema,
  slMovedSchema,
  partialSlDoneSchema,
  priceLevelSchema,
];
