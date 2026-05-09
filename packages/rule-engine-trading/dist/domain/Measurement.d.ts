/**
 * @file Measurement.ts
 * @description Domain primitive expressing a numeric quantity together with
 * its unit. Used by template parameters that must support multiple units of
 * comparison (R-multiples, percent of price, absolute price move).
 *
 * The domain only declares which semantic field of the execution context to
 * compare against, indexed by unit via the three field maps below. All price
 * arithmetic lives in the adapter (the testkit harness or the production
 * context builder). This keeps the templates pure and side-agnostic.
 *
 * The three field maps are defined here even though only `PROFIT_FIELD` is
 * consumed by Phase A. `PEAK_FIELD` and `DRAWDOWN_FROM_PEAK_FIELD` are
 * domain knowledge that Phases B and C will plug into without re-touching
 * this file.
 */
/**
 * Allowed measurement units.
 * - `R`: multiples of the trade's initial risk (entry − initial SL).
 * - `percent`: percent move of the underlying price (1.5 = 1.5 %).
 * - `price`: absolute price move (e.g. 0.5 = +0.5 in quote currency).
 */
export type Unit = 'R' | 'percent' | 'price';
/**
 * A quantity expressed in a specific unit.
 * Coupled measurements within the same template must share the same unit.
 */
export interface Measurement {
    readonly value: number;
    readonly unit: Unit;
}
/**
 * Context field that exposes the *current profit from entry* in each unit.
 * Side-aware (positive when the trade is winning), populated by the adapter.
 */
export declare const PROFIT_FIELD: Record<Unit, string>;
/**
 * Context field that exposes the *peak profit reached during the trade* in
 * each unit. Reserved for Phase C (max-drawdown-from-peak).
 */
export declare const PEAK_FIELD: Record<Unit, string>;
/**
 * Context field that exposes the *drawdown from peak* in each unit.
 * Reserved for Phase C (max-drawdown-from-peak).
 */
export declare const DRAWDOWN_FROM_PEAK_FIELD: Record<Unit, string>;
/**
 * Options for `assertMeasurement`.
 */
export interface AssertMeasurementOptions {
    /** Allow zero (use for lock-in floors). Defaults to false (value must be > 0). */
    allowZero?: boolean;
}
/**
 * Asserts that `m` is a well-formed `Measurement`. Throws synchronously with
 * a message naming the parameter when it is not.
 *
 * @param name - Parameter name to mention in error messages.
 * @param m - The candidate measurement (typed `unknown` to validate at the boundary).
 * @param opts - Options. Set `allowZero: true` for parameters whose floor is 0.
 */
export declare function assertMeasurement(name: string, m: unknown, opts?: AssertMeasurementOptions): asserts m is Measurement;
//# sourceMappingURL=Measurement.d.ts.map