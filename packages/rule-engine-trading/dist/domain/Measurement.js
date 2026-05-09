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
 * Context field that exposes the *current profit from entry* in each unit.
 * Side-aware (positive when the trade is winning), populated by the adapter.
 */
export const PROFIT_FIELD = {
    R: 'currentR',
    percent: 'currentPctFromEntry',
    price: 'currentPriceMove',
};
/**
 * Context field that exposes the *peak profit reached during the trade* in
 * each unit. Reserved for Phase C (max-drawdown-from-peak).
 */
export const PEAK_FIELD = {
    R: 'peakR',
    percent: 'peakPctFromEntry',
    price: 'peakPriceMove',
};
/**
 * Context field that exposes the *drawdown from peak* in each unit.
 * Reserved for Phase C (max-drawdown-from-peak).
 */
export const DRAWDOWN_FROM_PEAK_FIELD = {
    R: 'drawdownFromPeakR',
    percent: 'drawdownFromPeakPct',
    price: 'drawdownFromPeakPrice',
};
const ALLOWED_UNITS = ['R', 'percent', 'price'];
/**
 * Asserts that `m` is a well-formed `Measurement`. Throws synchronously with
 * a message naming the parameter when it is not.
 *
 * @param name - Parameter name to mention in error messages.
 * @param m - The candidate measurement (typed `unknown` to validate at the boundary).
 * @param opts - Options. Set `allowZero: true` for parameters whose floor is 0.
 */
export function assertMeasurement(name, m, opts = {}) {
    if (m === null || typeof m !== 'object') {
        throw new Error(`${name} must be a Measurement object { value, unit }`);
    }
    const candidate = m;
    if (typeof candidate.value !== 'number' || !Number.isFinite(candidate.value)) {
        throw new Error(`${name}.value must be a finite number`);
    }
    if (typeof candidate.unit !== 'string' || !ALLOWED_UNITS.includes(candidate.unit)) {
        throw new Error(`${name}.unit must be one of R | percent | price`);
    }
    if (opts.allowZero === true) {
        if (candidate.value < 0) {
            throw new Error(`${name}.value must be >= 0 (got ${candidate.value})`);
        }
    }
    else if (candidate.value <= 0) {
        throw new Error(`${name}.value must be > 0 (got ${candidate.value})`);
    }
}
//# sourceMappingURL=Measurement.js.map