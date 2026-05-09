import { AtomicCondition, Operator, LogicalCondition, LogicalOperator, MemorizableCondition } from 'rule-engine-monorepo/rule-engine';
// ============================================================================
// Basic Conditions
// ============================================================================
export function createProfitThresholdCondition(thresholdR) {
    return AtomicCondition.create('currentR', Operator.GREATER_EQUAL, thresholdR, 'currentR_check');
}
export function createProfitBelowCondition(thresholdR) {
    return AtomicCondition.create('currentR', Operator.LESS_THAN, thresholdR, 'currentR_below_check');
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
// R-based Tracking Conditions
// For tracking peak R and drawdown from peak
// Requires context to have: peakR (number), currentR (number)
// ============================================================================
/**
 * Creates a condition that checks if peak R was reached.
 * Context must include `peakR` field (highest R reached during trade).
 */
export function createPeakRReachedCondition(thresholdR) {
    return AtomicCondition.create('peakR', Operator.GREATER_EQUAL, thresholdR, 'peakR_reached_check');
}
/**
 * Creates a condition that checks if price has dropped from peak by X R.
 * Context must include `drawdownFromPeakR` field (peakR - currentR).
 */
export function createDrawdownFromPeakCondition(drawdownR) {
    return AtomicCondition.create('drawdownFromPeakR', Operator.GREATER_EQUAL, drawdownR, 'drawdown_from_peak_check');
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