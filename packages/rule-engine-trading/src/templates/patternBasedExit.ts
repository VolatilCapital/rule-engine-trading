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

import {
  RuleTemplate,
  AtomicCondition,
  LogicalCondition,
  LogicalOperator,
  Operator,
} from 'rule-engine-monorepo/rule-engine';
import { TriggerType } from '../domain/TradingEnums.js';
import { assertMeasurement, type Measurement } from '../domain/Measurement.js';
import { createClosePositionAction } from '../actions/placeOrder.js';
import { createPartialCloseByPercentage } from '../actions/partialClose.js';
import {
  createNotExecutedCondition,
  createAndCondition,
  createHistoricalCondition,
  createProfitThresholdCondition,
} from '../conditions/tradingConditions.js';

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
   * Minimum profit (in any supported unit) before pattern exit is allowed.
   * Prevents exiting at a loss due to pattern.
   * Default: omitted (can exit at any profit level).
   */
  minProfit?: Measurement;

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
 * Fact key prefix for pattern-based exit.
 */
const PATTERN_EXIT_FACT_PREFIX = 'pattern_based_exit_executed';

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
export function createPatternBasedExitTemplate(
  params: PatternBasedExitTemplateParams
): RuleTemplate {
  const {
    positionDirection,
    patternNames,
    minProfit,
    closePercentage = 100,
    timeframe,
    ruleId,
  } = params;

  if (closePercentage <= 0 || closePercentage > 100) {
    throw new Error('closePercentage must be between 0 and 100');
  }

  if (minProfit !== undefined) {
    assertMeasurement('minProfit', minProfit);
  }

  // Determine which pattern direction triggers exit
  const triggerDirection = positionDirection === 'long' ? 'bearish' : 'bullish';

  // Build unique fact key
  const patternSuffix = patternNames?.join('_') ?? triggerDirection;
  const tfSuffix = timeframe ? `_${timeframe}` : '';
  const factKey = ruleId
    ? `${PATTERN_EXIT_FACT_PREFIX}_${ruleId}`
    : `${PATTERN_EXIT_FACT_PREFIX}_${positionDirection}_${patternSuffix}${tfSuffix}`;

  const conditions: (AtomicCondition | LogicalCondition)[] = [];

  // Pattern condition(s)
  if (patternNames && patternNames.length > 0) {
    if (patternNames.length === 1) {
      // Single pattern check
      conditions.push(
        AtomicCondition.create(
          `patterns.${patternNames[0]}`,
          Operator.EQUAL,
          true,
          `pattern_${patternNames[0]}_check`
        )
      );
    } else {
      // Multiple patterns: OR condition (any of them triggers)
      const patternConditions = patternNames.map(
        (name) =>
          AtomicCondition.create(
            `patterns.${name}`,
            Operator.EQUAL,
            true,
            `pattern_${name}_check`
          )
      );
      conditions.push(
        LogicalCondition.create(
          LogicalOperator.OR,
          patternConditions,
          'pattern_or_check'
        )
      );
    }
  } else {
    // General direction check
    conditions.push(
      AtomicCondition.create(
        `patterns.${triggerDirection}`,
        Operator.EQUAL,
        true,
        `${triggerDirection}_pattern_check`
      )
    );
  }

  // Optional minimum profit condition (unit-aware via createProfitThresholdCondition).
  if (minProfit !== undefined) {
    conditions.push(createProfitThresholdCondition(minProfit));
  }

  // Combined condition: all trading conditions AND not already executed
  const mainCondition = createAndCondition(
    [...conditions, createNotExecutedCondition(factKey)],
    'pattern_based_exit_condition'
  );

  // Action
  const action =
    closePercentage === 100
      ? createClosePositionAction()
      : createPartialCloseByPercentage({ percentage: closePercentage });

  // Historical condition (self-referencing: prevents Phase 1/Phase 2 ordering issue)
  const historicalCondition = createHistoricalCondition(factKey);

  return RuleTemplate.create(mainCondition, [action], [historicalCondition]);
}

/**
 * Predefined: Exit long on any bearish pattern.
 */
export const PATTERN_EXIT_LONG_BEARISH = createPatternBasedExitTemplate({
  positionDirection: 'long',
  ruleId: 'long_bearish',
});

/**
 * Predefined: Exit short on any bullish pattern.
 */
export const PATTERN_EXIT_SHORT_BULLISH = createPatternBasedExitTemplate({
  positionDirection: 'short',
  ruleId: 'short_bullish',
});

/**
 * Predefined: Exit long on bearish engulfing pattern.
 */
export const PATTERN_EXIT_LONG_ENGULFING = createPatternBasedExitTemplate({
  positionDirection: 'long',
  patternNames: ['engulfing_bearish'],
  ruleId: 'long_engulfing',
});

/**
 * Predefined: Exit short on bullish engulfing pattern.
 */
export const PATTERN_EXIT_SHORT_ENGULFING = createPatternBasedExitTemplate({
  positionDirection: 'short',
  patternNames: ['engulfing_bullish'],
  ruleId: 'short_engulfing',
});

/**
 * Predefined: Exit long on bearish pattern, only if in profit (+0.5R min).
 */
export const PATTERN_EXIT_LONG_BEARISH_PROFITABLE = createPatternBasedExitTemplate({
  positionDirection: 'long',
  minProfit: { value: 0.5, unit: 'R' },
  ruleId: 'long_bearish_profitable',
});

/**
 * Predefined: Partial exit (50%) on bearish pattern.
 */
export const PATTERN_EXIT_LONG_BEARISH_PARTIAL = createPatternBasedExitTemplate({
  positionDirection: 'long',
  closePercentage: 50,
  ruleId: 'long_bearish_partial',
});

/**
 * Recommended trigger type for pattern-based rules.
 * Pattern detection should happen on CANDLE_CLOSE for accuracy.
 */
export const PATTERN_RULE_TRIGGER_TYPE = TriggerType.CANDLE_CLOSE;
