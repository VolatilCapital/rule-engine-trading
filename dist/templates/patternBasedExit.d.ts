/**
 * @file patternBasedExit.ts
 * @description Template factory for pattern-based exit rules.
 * Closes position when specific candle patterns are detected.
 *
 * Requires pattern detection results in the evaluation context.
 * The context should include a `patterns` object populated by IPatternDetector.
 *
 * Example: Exit long position when bearish engulfing pattern detected on 1H.
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { TriggerType } from '../domain/TradingEnums.js';
/**
 * Position direction for pattern matching.
 */
export type PositionDirection = 'long' | 'short';
/**
 * Parameters for pattern-based exit template.
 */
export interface PatternBasedExitTemplateParams {
    /**
     * Position direction (determines which patterns trigger exit).
     * - 'long': Bearish patterns trigger exit
     * - 'short': Bullish patterns trigger exit
     */
    positionDirection: PositionDirection;
    /**
     * Specific pattern names to trigger exit.
     * If not specified, uses general bearish/bullish detection.
     */
    patternNames?: string[];
    /**
     * Minimum profit R before pattern exit is allowed.
     * Prevents exiting at a loss due to pattern.
     * Default: 0 (can exit at any profit level)
     */
    minProfitR?: number;
    /**
     * Percentage to close (100 = full close, <100 = partial).
     * Default: 100
     */
    closePercentage?: number;
    /**
     * Timeframe for the pattern (for identification).
     */
    timeframe?: string;
    /** Unique identifier */
    ruleId?: string;
}
/**
 * Creates a rule template for pattern-based exit.
 *
 * The rule:
 * - For LONG positions: triggers on bearish patterns
 * - For SHORT positions: triggers on bullish patterns
 * - Optionally requires minimum profit R
 * - Can specify exact pattern names or use general direction
 *
 * Context requirements:
 * - `patterns.bearish`: boolean - true if bearish pattern detected
 * - `patterns.bullish`: boolean - true if bullish pattern detected
 * - `patterns.{patternName}`: boolean - true if specific pattern detected
 * - `currentR`: number - current profit in R (if minProfitR is set)
 *
 * @example
 * ```typescript
 * // Exit long on any bearish pattern
 * const longExitTemplate = createPatternBasedExitTemplate({
 *   positionDirection: 'long',
 * });
 *
 * // Exit long only on engulfing bearish pattern
 * const engulfingExitTemplate = createPatternBasedExitTemplate({
 *   positionDirection: 'long',
 *   patternNames: ['engulfing_bearish'],
 * });
 *
 * // Exit long on bearish pattern, but only if in profit
 * const profitableExitTemplate = createPatternBasedExitTemplate({
 *   positionDirection: 'long',
 *   minProfitR: 0.5,
 * });
 *
 * // Partial exit on pattern
 * const partialTemplate = createPatternBasedExitTemplate({
 *   positionDirection: 'long',
 *   closePercentage: 50,
 * });
 * ```
 */
export declare function createPatternBasedExitTemplate(params: PatternBasedExitTemplateParams): RuleTemplate;
/**
 * Predefined: Exit long on any bearish pattern.
 */
export declare const PATTERN_EXIT_LONG_BEARISH: RuleTemplate;
/**
 * Predefined: Exit short on any bullish pattern.
 */
export declare const PATTERN_EXIT_SHORT_BULLISH: RuleTemplate;
/**
 * Predefined: Exit long on bearish engulfing pattern.
 */
export declare const PATTERN_EXIT_LONG_ENGULFING: RuleTemplate;
/**
 * Predefined: Exit short on bullish engulfing pattern.
 */
export declare const PATTERN_EXIT_SHORT_ENGULFING: RuleTemplate;
/**
 * Predefined: Exit long on bearish pattern, only if in profit (+0.5R min).
 */
export declare const PATTERN_EXIT_LONG_BEARISH_PROFITABLE: RuleTemplate;
/**
 * Predefined: Partial exit (50%) on bearish pattern.
 */
export declare const PATTERN_EXIT_LONG_BEARISH_PARTIAL: RuleTemplate;
/**
 * Recommended trigger type for pattern-based rules.
 * Pattern detection should happen on CANDLE_CLOSE for accuracy.
 */
export declare const PATTERN_RULE_TRIGGER_TYPE = TriggerType.CANDLE_CLOSE;
//# sourceMappingURL=patternBasedExit.d.ts.map