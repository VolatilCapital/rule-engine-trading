/**
 * @file takeProfit.ts
 * @description Template factory for "take-profit" rules.
 * Closes the position when profit reaches the configured threshold.
 *
 * The threshold is unit-aware via `Measurement`:
 *   - `{ value: 3, unit: 'R' }`       → fires when `currentR >= 3`
 *   - `{ value: 1.5, unit: 'percent' }` → fires when `currentPctFromEntry >= 1.5`
 *   - `{ value: 0.5, unit: 'price' }` → fires when `currentPriceMove >= 0.5`
 */
import { RuleTemplate } from 'rule-engine-monorepo/rule-engine';
import { type Measurement } from '../domain/Measurement.js';
export interface TakeProfitTemplateParams {
    /** Profit threshold expressed in R, percent, or absolute price. */
    threshold: Measurement;
}
export declare function createTakeProfitTemplate(params: TakeProfitTemplateParams): RuleTemplate;
//# sourceMappingURL=takeProfit.d.ts.map