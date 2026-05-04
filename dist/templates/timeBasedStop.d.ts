/**
 * @file timeBasedStop.ts
 * @description Template factory for time-based stop rules.
 * Closes position (fully or partially) if profit threshold is not reached within time limit.
 *
 * Use case: Eliminate "dead trades" that tie up capital and attention.
 * Example: If after 30 minutes the trade hasn't reached +1R, exit.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
/**
 * Parameters for time-based stop template.
 */
export interface TimeBasedStopTemplateParams {
    /** Maximum time in minutes before triggering exit */
    maxMinutes: number;
    /** Minimum R threshold that should be reached to avoid exit */
    minProfitR: number;
    /** Percentage to close (100 = full close, <100 = partial) */
    closePercentage?: number;
    /** Unique identifier (for multiple time-based rules) */
    ruleId?: string;
}
/**
 * Creates a rule template for time-based stop.
 *
 * The rule:
 * - Triggers when elapsedMinutes >= maxMinutes AND currentR < minProfitR AND not already executed
 * - Closes the position (fully or partially)
 * - Records a fact to prevent re-execution
 *
 * Context requirements:
 * - `elapsedMinutes`: number - time since position entry
 * - `currentR`: number - current risk/reward ratio
 *
 * @example
 * ```typescript
 * // Close if not +1R after 30 minutes
 * const template = createTimeBasedStopTemplate({
 *   maxMinutes: 30,
 *   minProfitR: 1,
 * });
 *
 * // Partial close (50%) if not +0.5R after 15 minutes
 * const partialTemplate = createTimeBasedStopTemplate({
 *   maxMinutes: 15,
 *   minProfitR: 0.5,
 *   closePercentage: 50,
 *   ruleId: 'early_time_stop',
 * });
 * ```
 */
export declare function createTimeBasedStopTemplate(params: TimeBasedStopTemplateParams): RuleTemplate;
/**
 * Predefined: Close if not +1R after 30 minutes.
 */
export declare const TIME_STOP_30MIN_1R: RuleTemplate;
/**
 * Predefined: Close if not +0.5R after 15 minutes.
 */
export declare const TIME_STOP_15MIN_05R: RuleTemplate;
/**
 * Predefined: Close if not +2R after 60 minutes.
 */
export declare const TIME_STOP_60MIN_2R: RuleTemplate;
//# sourceMappingURL=timeBasedStop.d.ts.map