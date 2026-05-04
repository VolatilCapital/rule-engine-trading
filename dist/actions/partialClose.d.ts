/**
 * @file partialClose.ts
 * @description Factory functions for creating PARTIAL_CLOSE actions.
 */
import { ActionDefinition } from 'rule-engine-monorepo/rule-engine';
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
    quantity?: {
        var: string;
    } | Record<string, unknown>;
    /** JSON Logic expression for percentage */
    percentage?: {
        var: string;
    } | Record<string, unknown>;
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
export declare function createPartialCloseByQuantity(params: PartialCloseByQuantityParams): ActionDefinition;
/**
 * Creates a PARTIAL_CLOSE action with a percentage of the position.
 *
 * @example
 * ```typescript
 * const action = createPartialCloseByPercentage({ percentage: 50 });
 * // Will close 50% of the position
 * ```
 */
export declare function createPartialCloseByPercentage(params: PartialCloseByPercentageParams): ActionDefinition;
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
export declare function createPartialCloseDynamic(params: PartialCloseDynamicParams): ActionDefinition;
/**
 * Predefined action: Close 50% of the position.
 */
export declare const PARTIAL_CLOSE_50_PERCENT: ActionDefinition;
/**
 * Predefined action: Close 25% of the position.
 */
export declare const PARTIAL_CLOSE_25_PERCENT: ActionDefinition;
/**
 * Predefined action: Close 33% of the position (1/3).
 */
export declare const PARTIAL_CLOSE_33_PERCENT: ActionDefinition;
//# sourceMappingURL=partialClose.d.ts.map