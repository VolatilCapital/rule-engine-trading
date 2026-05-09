import { AtomicCondition, LogicalCondition, MemorizableCondition, ICondition } from 'rule-engine-monorepo/rule-engine';
import { type Measurement } from '../domain/Measurement.js';
/**
 * Creates a "profit-from-entry >= threshold" atomic condition.
 *
 * The context field is selected from `PROFIT_FIELD[threshold.unit]`:
 * - `R`     → `currentR`
 * - `percent` → `currentPctFromEntry`
 * - `price` → `currentPriceMove`
 *
 * The adapter (harness or production context builder) is responsible for
 * populating the chosen field side-awarely (positive when winning).
 */
export declare function createProfitThresholdCondition(threshold: Measurement): AtomicCondition;
/**
 * Creates a "profit-from-entry < threshold" atomic condition.
 * Same field selection rules as `createProfitThresholdCondition`.
 */
export declare function createProfitBelowCondition(threshold: Measurement): AtomicCondition;
export declare function createNotExecutedCondition(factKey: string): AtomicCondition;
export declare function createExecutedCondition(factKey: string): AtomicCondition;
export declare function createAndCondition(conditions: ICondition[], conditionRef: string): LogicalCondition;
export declare function createOrCondition(conditions: ICondition[], conditionRef: string): LogicalCondition;
export declare function createHistoricalCondition(factKey: string): MemorizableCondition;
export declare function createPriceBelowCondition(price: number): AtomicCondition;
export declare function createPriceAboveCondition(price: number): AtomicCondition;
/**
 * Creates a condition that checks if elapsed time since entry exceeds threshold.
 * Context must include `elapsedMinutes` field.
 */
export declare function createTimeElapsedCondition(minutes: number): AtomicCondition;
/**
 * Creates a "peak-from-entry >= threshold" atomic condition.
 *
 * The context field is selected from `PEAK_FIELD[threshold.unit]`:
 * - `R`       → `peakR`
 * - `percent` → `peakPctFromEntry`
 * - `price`   → `peakPriceMove`
 */
export declare function createPeakReachedCondition(threshold: Measurement): AtomicCondition;
/**
 * Creates a "drawdown-from-peak >= threshold" atomic condition.
 *
 * The context field is selected from `DRAWDOWN_FROM_PEAK_FIELD[threshold.unit]`:
 * - `R`       → `drawdownFromPeakR`
 * - `percent` → `drawdownFromPeakPct`
 * - `price`   → `drawdownFromPeakPrice`
 */
export declare function createDrawdownFromPeakCondition(threshold: Measurement): AtomicCondition;
/**
 * Creates a condition that checks if a specific candle pattern is detected.
 * Context must include `detectedPatterns` array of pattern names.
 * Uses a custom field path for array-contains check.
 */
export declare function createPatternDetectedCondition(patternName: string): AtomicCondition;
/**
 * Creates a condition that checks if pattern is bearish (for exit in long).
 * Context must include `patterns.bearish` boolean.
 */
export declare function createBearishPatternCondition(): AtomicCondition;
/**
 * Creates a condition that checks if pattern is bullish (for exit in short).
 * Context must include `patterns.bullish` boolean.
 */
export declare function createBullishPatternCondition(): AtomicCondition;
//# sourceMappingURL=tradingConditions.d.ts.map