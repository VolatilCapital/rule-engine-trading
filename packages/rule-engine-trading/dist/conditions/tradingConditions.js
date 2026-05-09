import { AtomicCondition, Operator, LogicalCondition, LogicalOperator, MemorizableCondition } from 'rule-engine-monorepo/rule-engine';
import { assertMeasurement, PROFIT_FIELD, PEAK_FIELD, DRAWDOWN_FROM_PEAK_FIELD, } from '../domain/Measurement.js';
// ============================================================================
// Basic Conditions
// ============================================================================
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
export function createProfitThresholdCondition(threshold) {
    assertMeasurement('threshold', threshold);
    const field = PROFIT_FIELD[threshold.unit];
    return AtomicCondition.create(field, Operator.GREATER_EQUAL, threshold.value, `${field}_check`);
}
/**
 * Creates a "profit-from-entry < threshold" atomic condition.
 * Same field selection rules as `createProfitThresholdCondition`.
 */
export function createProfitBelowCondition(threshold) {
    assertMeasurement('threshold', threshold);
    const field = PROFIT_FIELD[threshold.unit];
    return AtomicCondition.create(field, Operator.LESS_THAN, threshold.value, `${field}_below_check`);
}
export function createNotExecutedCondition(factKey) {
    // NOT_EQUAL true permet à undefined !== true de retourner true
    // Ainsi la condition passe quand le fait n'existe pas encore
    return AtomicCondition.create(`facts.${factKey}`, Operator.NOT_EQUAL, true, `${factKey}_not_executed_check`);
}
export function createExecutedCondition(factKey) {
    return AtomicCondition.create(`facts.${factKey}`, Operator.EQUAL, true, `${factKey}_executed_check`);
}
export function createAndCondition(conditions, conditionRef) {
    return LogicalCondition.create(LogicalOperator.AND, conditions, conditionRef);
}
export function createOrCondition(conditions, conditionRef) {
    return LogicalCondition.create(LogicalOperator.OR, conditions, conditionRef);
}
export function createHistoricalCondition(factKey) {
    return MemorizableCondition.create(factKey, createExecutedCondition(factKey));
}
// ============================================================================
// Price Level Conditions
// Used for cancel-pending-on-price-level rules
// Requires context to have: currentPrice (number)
// ============================================================================
export function createPriceBelowCondition(price) {
    return AtomicCondition.create('currentPrice', Operator.LESS_EQUAL, price, 'price_below_check');
}
export function createPriceAboveCondition(price) {
    return AtomicCondition.create('currentPrice', Operator.GREATER_EQUAL, price, 'price_above_check');
}
// ============================================================================
// Time-based Conditions
// Requires context to have: elapsedMinutes (number)
// ============================================================================
/**
 * Creates a condition that checks if elapsed time since entry exceeds threshold.
 * Context must include `elapsedMinutes` field.
 */
export function createTimeElapsedCondition(minutes) {
    return AtomicCondition.create('elapsedMinutes', Operator.GREATER_EQUAL, minutes, 'time_elapsed_check');
}
// ============================================================================
// Peak / Drawdown Tracking Conditions (multi-unit)
// For tracking the trade's most-favorable-ever peak and the drawdown from it.
//
// The unit dispatches the context field via the maps in `Measurement.ts`:
//   - PEAK_FIELD[unit]                → 'peakR' | 'peakPctFromEntry' | 'peakPriceMove'
//   - DRAWDOWN_FROM_PEAK_FIELD[unit]  → 'drawdownFromPeakR' | 'drawdownFromPeakPct'
//                                       | 'drawdownFromPeakPrice'
//
// All three fields per unit are populated side-awarely (profit-positive) by
// the adapter (testkit harness or production context builder).
// ============================================================================
/**
 * Creates a "peak-from-entry >= threshold" atomic condition.
 *
 * The context field is selected from `PEAK_FIELD[threshold.unit]`:
 * - `R`       → `peakR`
 * - `percent` → `peakPctFromEntry`
 * - `price`   → `peakPriceMove`
 */
export function createPeakReachedCondition(threshold) {
    assertMeasurement('threshold', threshold);
    const field = PEAK_FIELD[threshold.unit];
    return AtomicCondition.create(field, Operator.GREATER_EQUAL, threshold.value, `${field}_reached_check`);
}
/**
 * Creates a "drawdown-from-peak >= threshold" atomic condition.
 *
 * The context field is selected from `DRAWDOWN_FROM_PEAK_FIELD[threshold.unit]`:
 * - `R`       → `drawdownFromPeakR`
 * - `percent` → `drawdownFromPeakPct`
 * - `price`   → `drawdownFromPeakPrice`
 */
export function createDrawdownFromPeakCondition(threshold) {
    assertMeasurement('threshold', threshold);
    const field = DRAWDOWN_FROM_PEAK_FIELD[threshold.unit];
    return AtomicCondition.create(field, Operator.GREATER_EQUAL, threshold.value, `${field}_check`);
}
// ============================================================================
// Pattern-based Conditions
// Requires context to have pattern detection results
// ============================================================================
/**
 * Creates a condition that checks if a specific candle pattern is detected.
 * Context must include `detectedPatterns` array of pattern names.
 * Uses a custom field path for array-contains check.
 */
export function createPatternDetectedCondition(patternName) {
    // We'll check patterns.{patternName} == true (set by pattern detector)
    return AtomicCondition.create(`patterns.${patternName}`, Operator.EQUAL, true, `pattern_${patternName}_check`);
}
/**
 * Creates a condition that checks if pattern is bearish (for exit in long).
 * Context must include `patterns.bearish` boolean.
 */
export function createBearishPatternCondition() {
    return AtomicCondition.create('patterns.bearish', Operator.EQUAL, true, 'bearish_pattern_check');
}
/**
 * Creates a condition that checks if pattern is bullish (for exit in short).
 * Context must include `patterns.bullish` boolean.
 */
export function createBullishPatternCondition() {
    return AtomicCondition.create('patterns.bullish', Operator.EQUAL, true, 'bullish_pattern_check');
}
//# sourceMappingURL=tradingConditions.js.map