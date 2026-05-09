/**
 * @file actionSchemas.ts
 * @description Schema definitions for trading actions.
 * Used by UI to generate dynamic forms for action configuration.
 */

import type { ActionSchema } from 'rule-engine-monorepo/rule-engine';
import { ActionType } from '../domain/TradingEnums.js';

/**
 * Available fields in the trading context that can be referenced
 */
export const TRADING_CONTEXT_FIELDS = [
  'entryPrice',
  'currentPrice',
  'stopLoss',
  'takeProfit',
  'currentR',
  'positionSize',
  'accountBalance',
] as const;

/**
 * Schema for MOVE_STOP_LOSS action
 */
export const moveStopLossSchema: ActionSchema = {
  actionRef: ActionType.MOVE_STOP_LOSS,
  category: 'stop_loss',
  parameters: [
    {
      name: 'newStopPrice',
      type: 'field-ref',
      required: true,
      availableFields: [...TRADING_CONTEXT_FIELDS],
    },
  ],
};

/**
 * Schema for PLACE_ORDER action
 */
export const placeOrderSchema: ActionSchema = {
  actionRef: ActionType.PLACE_ORDER,
  category: 'orders',
  parameters: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: ['market', 'limit', 'stop', 'close_position'],
      defaultValue: 'market',
    },
    {
      name: 'symbol',
      type: 'string',
      required: false,
    },
    {
      name: 'side',
      type: 'select',
      required: false,
      options: ['BUY', 'SELL'],
    },
    {
      name: 'quantity',
      type: 'number',
      required: false,
      min: 0,
      step: 0.01,
    },
  ],
};

/**
 * Schema for PARTIAL_CLOSE action
 */
export const partialCloseSchema: ActionSchema = {
  actionRef: ActionType.PARTIAL_CLOSE,
  category: 'orders',
  parameters: [
    {
      name: 'percentage',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
      step: 1,
      defaultValue: 50,
    },
  ],
};

/**
 * Schema for SCALE_OUT action
 */
export const scaleOutSchema: ActionSchema = {
  actionRef: ActionType.SCALE_OUT,
  category: 'orders',
  parameters: [
    {
      name: 'percentage',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
      step: 1,
      defaultValue: 25,
    },
    {
      name: 'targetR',
      type: 'number',
      required: true,
      min: 0,
      step: 0.5,
      defaultValue: 2,
    },
  ],
};

/**
 * Schema for START_TRAILING_STOP action.
 *
 * @deprecated Use the `trailing-stop` template (`createTrailingStopTemplate`) instead.
 * This raw action schema had no executor and is superseded by the template-based
 * approach that uses `MOVE_STOP_LOSS` with `isRecurring: true`.
 */
export const startTrailingStopSchema: ActionSchema = {
  actionRef: ActionType.START_TRAILING_STOP,
  category: 'stop_loss',
  parameters: [
    {
      name: 'trailingDistance',
      type: 'number',
      required: true,
      min: 0,
      step: 0.1,
    },
    {
      name: 'activationR',
      type: 'number',
      required: false,
      min: 0,
      step: 0.5,
      defaultValue: 1,
    },
  ],
};

/**
 * Schema for CANCEL_POSITION action
 */
export const cancelPositionSchema: ActionSchema = {
  actionRef: ActionType.CANCEL_POSITION,
  category: 'orders',
  parameters: [],
};

/**
 * All trading action schemas
 */
export const tradingActionSchemas: ActionSchema[] = [
  moveStopLossSchema,
  placeOrderSchema,
  partialCloseSchema,
  scaleOutSchema,
  startTrailingStopSchema,
  cancelPositionSchema,
];
