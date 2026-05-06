import { AtomicCondition, LogicalCondition, MemorizableCondition, ICondition } from 'rule-engine-monorepo/rule-engine';
export declare function createProfitThresholdCondition(thresholdR: number): AtomicCondition;
export declare function createProfitBelowCondition(thresholdR: number): AtomicCondition;
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
 * Creates a condition that checks if peak R was reached.
 * Context must include `peakR` field (highest R reached during trade).
 */
export declare function createPeakRReachedCondition(thresholdR: number): AtomicCondition;
/**
 * Creates a condition that checks if price has dropped from peak by X R.
 * Context must include `drawdownFromPeakR` field (peakR - currentR).
 */
export declare function createDrawdownFromPeakCondition(drawdownR: number): AtomicCondition;
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