/**
 * @file lockInProfitStop.ts
 * @description Template factory for "lock-in profit" stop rules.
 * Moves the stop loss to guarantee a minimum profit when a higher profit is reached.
 *
 * Variant of breakeven, but guarantees actual profit instead of just entry price.
 *
 * Both `trigger` and `lockIn` are `Measurement` values that must share the same unit.
 *
 * The new stop price is pre-computed by the adapter (testkit harness or production
 * context builder) and exposed under `lockInStopPrice_<value><unitSuffix>`:
 *   - R       → suffix `R`     (e.g. `lockInStopPrice_1R`)
 *   - percent → suffix `pct`   (e.g. `lockInStopPrice_1pct`)
 *   - price   → suffix `price` (e.g. `lockInStopPrice_0_5price`)
 *
 * Numeric values use `_` instead of `.` to keep the key a valid identifier-like token.
 *
 * Example: At +3R → move stop to guarantee +1R minimum.
 */

import {
  RuleTemplate,
  AtomicCondition,
} from 'rule-engine-monorepo/rule-engine';
import { assertMeasurement, type Measurement, type Unit } from '../domain/Measurement.js';
import { createMoveStopLossAction } from '../actions/moveStopLoss.js';
import {
  createProfitThresholdCondition,
  createNotExecutedCondition,
  createAndCondition,
  createHistoricalCondition,
} from '../conditions/tradingConditions.js';

/**
 * Parameters for lock-in profit stop template.
 */
export interface LockInProfitStopTemplateParams {
  /**
   * Profit threshold (in any supported unit) that triggers the stop move.
   * Example: `{ value: 3, unit: 'R' }` means "when profit reaches 3R".
   */
  trigger: Measurement;
  /**
   * Profit level to lock in (the new guaranteed minimum profit).
   * Must share the same unit as `trigger` and be strictly less than it.
   * Example: `{ value: 1, unit: 'R' }` guarantees at least 1R profit.
   */
  lockIn: Measurement;
  /** Unique identifier for multiple lock-in rules */
  ruleId?: string;
}

/**
 * Fact key prefix for tracking lock-in stop execution.
 */
const LOCK_IN_STOP_FACT_PREFIX = 'lock_in_profit_stop_executed';

/**
 * WeakMap that stores the LockInProfitStopTemplateParams for each created
 * RuleTemplate. The testkit harness (or production context builder) walks
 * this map to know which `lockInStopPrice_<value><unitSuffix>` keys to
 * pre-fill in the execution context.
 *
 * @internal Internal convention between this factory and the adapter.
 */
export const lockInProfitStopParamsMap = new WeakMap<RuleTemplate, LockInProfitStopTemplateParams>();

/** Maps a `Unit` to the suffix used in the `lockInStopPrice_*` context key. */
const UNIT_SUFFIX: Record<Unit, string> = {
  R: 'R',
  percent: 'pct',
  price: 'price',
};

/**
 * Builds the canonical `lockInStopPrice_*` context key for a `lockIn`
 * measurement. Replaces `.` with `_` so the key reads cleanly.
 *
 * Example: `{ value: 0.5, unit: 'R' }` → `lockInStopPrice_0_5R`.
 *
 * @internal Exported for adapter use only.
 */
export function lockInStopPriceKey(lockIn: Measurement): string {
  const valuePart = String(lockIn.value).replace(/\./g, '_');
  return `lockInStopPrice_${valuePart}${UNIT_SUFFIX[lockIn.unit]}`;
}

/**
 * Creates a rule template for lock-in profit stop.
 *
 * The rule:
 * - Triggers when the profit-from-entry (in `trigger.unit`) ≥ `trigger.value`
 *   AND the lock-in has not already been executed.
 * - Moves stop loss to the pre-computed `lockInStopPrice_*` value.
 * - Records a fact to prevent re-execution.
 *
 * Throws synchronously when:
 * - Either measurement is malformed.
 * - `trigger.unit !== lockIn.unit`.
 * - `lockIn.value >= trigger.value`.
 *
 * Context requirements (populated by adapter):
 * - One of `currentR | currentPctFromEntry | currentPriceMove` for the chosen unit.
 * - `lockInStopPrice_<value><unitSuffix>` for the chosen `lockIn`.
 *
 * @example
 * ```typescript
 * const template = createLockInProfitStopTemplate({
 *   trigger: { value: 3, unit: 'R' },
 *   lockIn: { value: 1, unit: 'R' },
 * });
 * ```
 */
export function createLockInProfitStopTemplate(params: LockInProfitStopTemplateParams): RuleTemplate {
  const { trigger, lockIn, ruleId } = params;

  assertMeasurement('trigger', trigger);
  assertMeasurement('lockIn', lockIn, { allowZero: true });

  if (trigger.unit !== lockIn.unit) {
    throw new Error(
      `trigger and lockIn must share unit (got trigger=${trigger.unit}, lockIn=${lockIn.unit})`,
    );
  }

  if (lockIn.value >= trigger.value) {
    throw new Error(`lockIn.value (${lockIn.value}) must be < trigger.value (${trigger.value})`);
  }

  // Unique fact key
  const factKey = ruleId
    ? `${LOCK_IN_STOP_FACT_PREFIX}_${ruleId}`
    : `${LOCK_IN_STOP_FACT_PREFIX}_${trigger.value}${trigger.unit}_to_${lockIn.value}${lockIn.unit}`;

  // Profit-threshold condition (unit-aware via PROFIT_FIELD).
  const profitCondition: AtomicCondition = createProfitThresholdCondition(trigger);

  // Combined condition: profit reached AND not already executed
  const mainCondition = createAndCondition(
    [profitCondition, createNotExecutedCondition(factKey)],
    'lock_in_profit_stop_condition'
  );

  // Action: move stop loss to the pre-computed lock-in price.
  const action = createMoveStopLossAction({
    newStopPrice: { "var": lockInStopPriceKey(lockIn) }
  });

  // Historical condition (self-referencing: only records fact when already true)
  // Actual re-execution prevention is handled by COMPLETED status.
  const historicalCondition = createHistoricalCondition(factKey);

  const template = RuleTemplate.create(mainCondition, [action], [historicalCondition]);

  // Register params so the adapter can pre-fill the right context key.
  lockInProfitStopParamsMap.set(template, { trigger, lockIn, ruleId });

  return template;
}

/**
 * Predefined: At +3R, lock in +1R profit.
 */
export const LOCK_IN_3R_TO_1R = createLockInProfitStopTemplate({
  trigger: { value: 3, unit: 'R' },
  lockIn: { value: 1, unit: 'R' },
  ruleId: '3R_to_1R',
});

/**
 * Predefined: At +2R, lock in +0.5R profit.
 */
export const LOCK_IN_2R_TO_05R = createLockInProfitStopTemplate({
  trigger: { value: 2, unit: 'R' },
  lockIn: { value: 0.5, unit: 'R' },
  ruleId: '2R_to_05R',
});

/**
 * Predefined: At +4R, lock in +2R profit.
 */
export const LOCK_IN_4R_TO_2R = createLockInProfitStopTemplate({
  trigger: { value: 4, unit: 'R' },
  lockIn: { value: 2, unit: 'R' },
  ruleId: '4R_to_2R',
});

/**
 * Predefined: At +5R, lock in +3R profit.
 */
export const LOCK_IN_5R_TO_3R = createLockInProfitStopTemplate({
  trigger: { value: 5, unit: 'R' },
  lockIn: { value: 3, unit: 'R' },
  ruleId: '5R_to_3R',
});
