/**
 * @file takePartial.ts
 * @description Template factory for partial close rules.
 * Creates rules that close a percentage of the position when profit threshold is reached.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
/**
 * Parameters for take partial template.
 */
export interface TakePartialTemplateParams {
    /** R threshold to trigger partial close (e.g., 1 = 1R profit) */
    thresholdR: number;
    /** Percentage of position to close (0-100) */
    closePercentage: number;
    /** Unique identifier for this partial close (to prevent re-execution) */
    partialId?: string;
}
/**
 * Creates a rule template for taking a partial close at a profit threshold.
 *
 * The rule:
 * - Triggers when currentR >= thresholdR AND partial not already taken
 * - Closes the specified percentage of the position
 * - Records a fact to prevent re-execution
 *
 * @example
 * ```typescript
 * // Close 50% of position at 2R profit
 * const template = createTakePartialTemplate({
 *   thresholdR: 2,
 *   closePercentage: 50,
 * });
 *
 * // Create multiple partials with unique IDs
 * const partial1 = createTakePartialTemplate({
 *   thresholdR: 1,
 *   closePercentage: 33,
 *   partialId: 'first_partial',
 * });
 *
 * const partial2 = createTakePartialTemplate({
 *   thresholdR: 2,
 *   closePercentage: 50,
 *   partialId: 'second_partial',
 * });
 * ```
 */
export declare function createTakePartialTemplate(params: TakePartialTemplateParams): RuleTemplate;
/**
 * Predefined template: Close 50% at 1R profit.
 */
export declare const TAKE_PARTIAL_1R_50PCT: RuleTemplate;
/**
 * Predefined template: Close 33% at 1R profit.
 */
export declare const TAKE_PARTIAL_1R_33PCT: RuleTemplate;
/**
 * Predefined template: Close 50% at 2R profit.
 */
export declare const TAKE_PARTIAL_2R_50PCT: RuleTemplate;
/**
 * Predefined template: Close 25% at 1R, then 25% at 2R (use both templates).
 */
export declare const TAKE_PARTIAL_1R_25PCT: RuleTemplate;
export declare const TAKE_PARTIAL_2R_25PCT: RuleTemplate;
//# sourceMappingURL=takePartial.d.ts.map