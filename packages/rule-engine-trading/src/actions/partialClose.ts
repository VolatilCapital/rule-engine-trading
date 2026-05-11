/**
 * @file partialClose.ts
 * @description Factory functions for creating PARTIAL_CLOSE actions.
 */

import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
import { ActionType } from '../domain/TradingEnums.js';

/**
 * Parameters for partial close by fixed quantity.
 */
export interface PartialCloseByQuantityParams {
  /** Fixed quantity to close */
  quantity: number;
}

/**
 * Parameters for partial close by percentage.
 */
export interface PartialCloseByPercentageParams {
  /** Percentage of position to close (0-100) */
  percentage: number;
}

/**
 * Parameters for partial close with dynamic quantity using JSON Logic.
 */
export interface PartialCloseDynamicParams {
  /** JSON Logic expression for quantity */
  quantity?: { var: string };
  /** JSON Logic expression for percentage */
  percentage?: { var: string };
}

/**
 * Creates a PARTIAL_CLOSE action with a fixed quantity.
 *
 * @example
 * ```typescript
 * const action = createPartialCloseByQuantity({ quantity: 100 });
 * // Will close 100 units of the position
 * ```
 */
export function createPartialCloseByQuantity(params: PartialCloseByQuantityParams): ActionDefinition {
  if (params.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  return {
    actionRef: ActionType.PARTIAL_CLOSE,
    parameters: {
      quantity: params.quantity,
    },
  };
}

/**
 * Creates a PARTIAL_CLOSE action with a percentage of the position.
 *
 * @example
 * ```typescript
 * const action = createPartialCloseByPercentage({ percentage: 50 });
 * // Will close 50% of the position
 * ```
 */
export function createPartialCloseByPercentage(params: PartialCloseByPercentageParams): ActionDefinition {
  if (params.percentage <= 0 || params.percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }

  return {
    actionRef: ActionType.PARTIAL_CLOSE,
    parameters: {
      percentage: params.percentage,
    },
  };
}

/**
 * Creates a PARTIAL_CLOSE action with dynamic parameters.
 *
 * @example
 * ```typescript
 * // Close quantity based on a field in context
 * const action = createPartialCloseDynamic({
 *   quantity: { var: 'partialCloseQuantity' }
 * });
 *
 * // Close percentage based on a field in context
 * const action = createPartialCloseDynamic({
 *   percentage: { var: 'closePercentage' }
 * });
 * ```
 */
export function createPartialCloseDynamic(params: PartialCloseDynamicParams): ActionDefinition {
  if (!params.quantity && !params.percentage) {
    throw new Error('Either quantity or percentage must be specified');
  }

  return {
    actionRef: ActionType.PARTIAL_CLOSE,
    parameters: params.quantity
      ? { quantity: params.quantity }
      : { percentage: params.percentage },
  };
}

/**
 * Predefined action: Close 50% of the position.
 */
export const PARTIAL_CLOSE_50_PERCENT: ActionDefinition = createPartialCloseByPercentage({ percentage: 50 });

/**
 * Predefined action: Close 25% of the position.
 */
export const PARTIAL_CLOSE_25_PERCENT: ActionDefinition = createPartialCloseByPercentage({ percentage: 25 });

/**
 * Predefined action: Close 33% of the position (1/3).
 */
export const PARTIAL_CLOSE_33_PERCENT: ActionDefinition = createPartialCloseByPercentage({ percentage: 33.33 });
